import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Phone, Video, Info, Paperclip, Smile, SendHorizontal, MoreVertical, Loader2, X, FileText, FileImage, File } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';
import { getConversations, getMessages, sendMessage, uploadChatFile, markAsRead } from '../../../services/chatService';
import useAuth from '../../../hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotification } from '../../../contexts/NotificationContext';

const getAttachmentMeta = (attachment) => {
  const fileName = attachment?.fileName || 'Tệp đính kèm';
  const fileType = (attachment?.fileType || '').toLowerCase();
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  const pdfTypes = ['application/pdf'];
  const docTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word',
  ];

  if (imageTypes.some((type) => fileType.includes(type)) || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
    return { icon: FileImage, color: 'text-emerald-600', label: 'Ảnh' };
  }
  if (pdfTypes.some((type) => fileType.includes(type)) || extension === 'pdf') {
    return { icon: FileText, color: 'text-red-600', label: 'PDF' };
  }
  if (docTypes.some((type) => fileType.includes(type)) || ['doc', 'docx'].includes(extension)) {
    return { icon: FileText, color: 'text-blue-600', label: 'DOC' };
  }
  return { icon: File, color: 'text-slate-500', label: 'File' };
};

const getCompanyInfo = (conversation) => {
  const company = conversation?.jobId?.companyId || conversation?.companyId;
  return {
    name: company?.name || company?.companyName || 'Công ty bạn',
    avatar: company?.avatarUrl || company?.logo || '',
  };
};

const CompanyAvatar = ({ companyInfo, className = '' }) => {
  const initial = companyInfo?.name?.trim()?.charAt(0)?.toUpperCase() || 'C';

  if (companyInfo?.avatar) {
    return <img src={companyInfo.avatar} className={`object-cover ${className}`} alt="" />;
  }

  return (
    <span className={`bg-primary/10 text-primary font-bold flex items-center justify-center ${className}`}>
      {initial}
    </span>
  );
};

const getUserAvatar = (user, fallbackName = 'U') => {
  const avatar = user?.avatarUrl || user?.avatar || '';
  const name = user?.fullName || fallbackName;
  return {
    avatar,
    name,
    initial: name.trim().charAt(0).toUpperCase() || 'U'
  };
};

const UserAvatar = ({ userInfo, className = '', textClassName = '' }) => {
  if (userInfo?.avatar) {
    return <img src={userInfo.avatar} className={`object-cover ${className}`} alt="" />;
  }

  return (
    <span className={`bg-primary/10 text-primary font-bold flex items-center justify-center ${className} ${textClassName}`}>
      {userInfo?.initial || 'U'}
    </span>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { error: notifyError } = useNotification();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeConvRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const targetConvId = searchParams.get('conversationId');

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) {
        setConversations(res.data);
        if (targetConvId) {
          const target = res.data.find(c => c._id === targetConvId);
          if (target) {
            setActiveConv(target);
            // Optional: remove query param after opening
            setSearchParams({});
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cuộc hội thoại:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Socket: listener nhận tin nhắn luôn bật khi socket đã kết nối
  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (msg) => {
      const conversationId = String(msg.conversationId);
      const currentConversationId = activeConvRef.current?._id ? String(activeConvRef.current._id) : null;

      if (currentConversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((message) => String(message._id) === String(msg._id))) return prev;
          return [...prev, msg];
        });
        markAsRead(conversationId).catch((error) => console.error('Lỗi đánh dấu tin nhắn đã đọc:', error));
      }

      setConversations((prev) => {
        const index = prev.findIndex((conversation) => String(conversation._id) === conversationId);
        if (index === -1) {
          fetchConversations();
          return prev;
        }

        const next = [...prev];
        next[index] = {
          ...next[index],
          lastMessage: msg.content || 'Đã gửi đính kèm',
          lastMessageAt: msg.createdAt
        };
        return next.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  // Socket: join room của hội thoại đang mở và tự join lại sau khi reconnect
  useEffect(() => {
    if (!socket || !activeConv?._id) return undefined;

    const conversationId = activeConv._id;
    const joinConversation = () => socket.emit('join_conversation', conversationId);

    joinConversation();
    socket.on('connect', joinConversation);

    return () => {
      socket.off('connect', joinConversation);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, activeConv?._id]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!activeConv) return;
    const loadMessages = async () => {
      try {
        const res = await getMessages(activeConv._id);
        if (res.success) {
          setMessages(res.data);
          markAsRead(activeConv._id);
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
      }
    };
    loadMessages();
  }, [activeConv]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() && !selectedFile) return;
    if (!activeConv) return;

    try {
      setSending(true);
      let attachments = [];

      if (selectedFile) {
        const uploadRes = await uploadChatFile(selectedFile);
        if (uploadRes.success) {
          attachments.push(uploadRes.data);
        } else {
          throw new Error(uploadRes.message || 'Tải tệp đính kèm thất bại');
        }
        fileInputRef.current.value = ''; // Reset file
        setSelectedFile(null);
      }

      const res = await sendMessage(activeConv._id, { content: draft, attachments });
      if (res.success) {
        setDraft('');
        setMessages(prev => {
          if (prev.some(m => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      notifyError(error.response?.data?.message || error.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter(c => {
    const jobseeker = c.participants.find(p => p.role === 'JOBSEEKER')?.userId;
    return jobseeker?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">

      {/* LEFT SIDEBAR - THREADS */}
      <aside className="xl:col-span-3 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Tin nhắn</h1>
            <button onClick={fetchConversations} className="text-primary font-semibold text-sm hover:underline">Làm mới</button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm ứng viên..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Chưa có cuộc trò chuyện nào</div>
          ) : filteredConvs.map((c) => {
            const jobseeker = c.participants.find(p => p.role === 'JOBSEEKER')?.userId;
            const userAvatar = getUserAvatar(jobseeker, 'Ứng viên ẩn danh');
            return (
              <button
                key={c._id}
                onClick={() => setActiveConv(c)}
                className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 ${activeConv?._id === c._id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <UserAvatar userInfo={userAvatar} className="w-12 h-12 rounded-full shrink-0" textClassName="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 truncate text-sm">{userAvatar.name}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {c.lastMessageAt ? format(new Date(c.lastMessageAt), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5 truncate">{c.jobId?.title || (c.applicationId === null ? 'Nguồn: Talent Pool' : 'Vị trí không xác định')}</p>
                    <p className="text-sm mt-1 truncate text-slate-500">{c.lastMessage}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* CENTER - MAIN CHAT AREA */}
      <section className="xl:col-span-6 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        {activeConv ? (() => {
          const jobseeker = activeConv.participants.find(p => p.role === 'JOBSEEKER')?.userId;
          const userAvatar = getUserAvatar(jobseeker, 'Ứng viên ẩn danh');
          return (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <UserAvatar userInfo={userAvatar} className="w-10 h-10 rounded-full shrink-0" />
                  <div>
                    <h2 className="font-bold text-slate-900 leading-tight">{userAvatar.name}</h2>
                    <p className="text-xs text-slate-500">{activeConv.jobId?.title || (activeConv.applicationId === null ? 'Nguồn: Talent Pool' : 'Vị trí không xác định')}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#f8fafc] custom-scrollbar">
                {messages.map((msg, idx) => {
                  const me = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  const onlyAttachment = !msg.content && msg.attachments?.length > 0;
                  const senderAvatar = getUserAvatar(msg.senderId, 'Ứng viên ẩn danh');
                  return (
                    <div key={msg._id || idx} className={`flex gap-3 max-w-[85%] ${me ? 'ml-auto flex-row-reverse' : ''}`}>
                      {!me && (
                        <UserAvatar userInfo={senderAvatar} className="w-8 h-8 shrink-0 rounded-full mt-auto" textClassName="text-xs" />
                      )}
                      <div className={`flex flex-col ${me ? 'items-end' : 'items-start'}`}>
                        <div className={`text-sm ${onlyAttachment ? 'p-0 bg-transparent shadow-none border-0' : `${me ? 'px-4 py-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm' : 'px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm shadow-sm'}`}`}>
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachments?.map((att, i) => {
                            const meta = getAttachmentMeta(att);
                            const Icon = meta.icon;
                            const isImage = meta.label === 'Ảnh';
                            return (
                              <div key={i} className="mt-2">
                                {isImage ? (
                                  <button type="button" onClick={() => window.open(att.fileUrl, '_blank')} className="block overflow-hidden rounded-xl hover:opacity-90 transition">
                                    <img src={att.fileUrl} alt={att.fileName || 'Ảnh đính kèm'} className="max-w-[240px] max-h-[220px] object-cover" />
                                  </button>
                                ) : (
                                  <a href={att.fileUrl} target="_blank" rel="noreferrer" download={att.fileName || true} className={`flex items-center gap-2 py-1.5 transition ${me && !onlyAttachment ? 'text-white hover:text-blue-100' : 'text-slate-700 hover:text-primary'}`}>
                                    <span className="w-6 h-6 flex items-center justify-center shrink-0">
                                      <Icon className={`w-5 h-5 ${meta.color}`} />
                                    </span>
                                    <span className="min-w-0 text-left">
                                      <span className={`block text-xs font-black uppercase tracking-wide ${me && !onlyAttachment ? 'text-blue-100' : 'text-slate-400'}`}>{meta.label}</span>
                                      <span className="block max-w-[180px] truncate text-sm font-semibold">{att.fileName || 'Tệp đính kèm'}</span>
                                    </span>
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[11px] font-medium mt-1 text-slate-400">
                          {format(new Date(msg.createdAt || new Date()), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-100 bg-white relative">
                {selectedFile && (
                  <div className="absolute bottom-full mb-2 left-4 right-4 rounded-xl px-1 py-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-semibold text-blue-800 truncate">{selectedFile.name}</span>
                      <span className="text-xs text-blue-400 shrink-0">({Math.round(selectedFile.size / 1024)} KB)</span>
                    </div>
                    <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 rounded-full hover:bg-blue-100 text-blue-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-200/50">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent max-h-32 min-h-[44px] py-2.5 px-2 outline-none resize-none text-sm text-slate-700"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button onClick={handleSend} disabled={sending} className={`p-2.5 rounded-full font-bold transition-all ${sending ? 'bg-slate-300 text-slate-500' : 'bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md'}`}>
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Smile className="w-10 h-10 text-slate-300" />
            </div>
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR - INFO */}
      <aside className="xl:col-span-3 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {activeConv ? (() => {
          const jobseeker = activeConv.participants.find(p => p.role === 'JOBSEEKER')?.userId;
          const userAvatar = getUserAvatar(jobseeker, 'Ứng viên ẩn danh');
          return (
            <>
              <div className="text-center space-y-3 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-200 shadow-sm relative">
                  <UserAvatar userInfo={userAvatar} className="w-full h-full" textClassName="text-4xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">{userAvatar.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{jobseeker?.email || 'Chưa cập nhật email'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Thông tin ứng tuyển</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">{activeConv.applicationId === null ? 'Nguồn ứng viên' : 'Vị trí ứng tuyển'}</div>
                  <div className="font-semibold text-slate-900 mt-1">{activeConv.jobId?.title || (activeConv.applicationId === null ? 'Talent Pool (Đã mở khóa)' : '')}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Công ty</div>
                  <div className="flex items-center gap-3 mt-1">
                    <CompanyAvatar companyInfo={getCompanyInfo(activeConv)} className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-sm" />
                    <div className="font-semibold text-slate-900">{getCompanyInfo(activeConv).name}</div>
                  </div>
                </div>
              </div>
            </>
          );
        })() : (
          <div className="text-center text-slate-400 mt-20">Thông tin ứng viên sẽ hiển thị tại đây</div>
        )}
      </aside>
    </div>
  );
};

export default Messages;




