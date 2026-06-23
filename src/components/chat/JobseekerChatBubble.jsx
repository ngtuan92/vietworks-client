import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, SendHorizontal, Paperclip, Loader2, Minimize2, Maximize2, ChevronLeft, FileText, FileImage, File } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { getConversations, getMessages, sendMessage, uploadChatFile, markAsRead, getUnreadMessageCount } from '../../services/chatService';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';


const getAttachmentMeta = (attachment) => {
  const fileName = attachment?.fileName || 'Tệp đính kèm';
  const fileType = (attachment?.fileType || '').toLowerCase();
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (fileType.includes('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
    return { icon: FileImage, color: 'text-emerald-600', label: 'Ảnh' };
  }
  if (fileType.includes('application/pdf') || extension === 'pdf') {
    return { icon: FileText, color: 'text-red-600', label: 'PDF' };
  }
  if (fileType.includes('word') || ['doc', 'docx'].includes(extension)) {
    return { icon: FileText, color: 'text-blue-600', label: 'DOC' };
  }
  return { icon: File, color: 'text-slate-500', label: 'File' };
};

const getCompanyInfo = (conversation) => {
  const company = conversation?.jobId?.companyId;
  return {
    name: company?.name || company?.companyName || 'Nhà tuyển dụng',
    avatar: company?.avatarUrl || company?.logo || '',
  };
};

const CompanyAvatar = ({ companyInfo, className = '' }) => {
  const initial = companyInfo?.name?.trim()?.charAt(0)?.toUpperCase() || 'N';

  if (companyInfo?.avatar) {
    return <img src={companyInfo.avatar} className={`object-cover ${className}`} alt="" />;
  }

  return (
    <span className={`bg-primary/10 text-primary font-bold flex items-center justify-center ${className}`}>
      {initial}
    </span>
  );
};

const JobseekerChatBubble = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { error } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Listen for custom event to open a specific conversation
  useEffect(() => {
    const handleOpenChat = (e) => {
      const convId = e.detail?.conversationId;
      setIsOpen(true);
      setIsMinimized(false);
      if (convId) {
        const target = conversations.find(c => c._id === convId);
        if (target) {
          setActiveConv(target);
        } else {
          // If not in list, fetch conversations again then set
          fetchConversations().then(res => {
            const newTarget = res?.find(c => c._id === convId);
            if (newTarget) setActiveConv(newTarget);
          });
        }
      }
    };
    window.addEventListener('open_chat', handleOpenChat);
    return () => window.removeEventListener('open_chat', handleOpenChat);
  }, [conversations]);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      if (res.success) {
        setConversations(res.data);
        return res.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const res = await getUnreadMessageCount();
      if (res.success) setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'JOBSEEKER') {
      fetchConversations();
      refreshUnreadCount();
    }
  }, [user]);

  // Handle socket for new messages and unread count
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      const isMine = msg.senderId?._id === user?._id || msg.senderId === user?._id;
      if (activeConv && String(msg.conversationId) === String(activeConv._id)) {
        setMessages(prev => {
          if (prev.some(m => String(m._id) === String(msg._id))) return prev;
          return [...prev, msg];
        });
        if (!isMine && isOpen && !isMinimized) {
          markAsRead(activeConv._id).then(refreshUnreadCount).catch(console.error);
        } else if (!isMine) {
          setUnreadCount(prev => prev + 1);
        }
      } else if (!isMine) {
        setUnreadCount(prev => prev + 1);
      }
      fetchConversations(); // refresh list
    };
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeConv, isOpen, isMinimized, user?._id]);

  useEffect(() => {
    if (isOpen && !isMinimized && activeConv && socket) {
      const convId = activeConv._id;
      const joinConversation = () => socket.emit('join_conversation', convId);

      joinConversation();
      socket.on('connect', joinConversation);

      const loadMsg = async () => {
        setLoading(true);
        try {
          const res = await getMessages(convId);
          if (res.success) setMessages(res.data);
          markAsRead(convId).then(refreshUnreadCount).catch(console.error);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadMsg();
      return () => {
        socket.off('connect', joinConversation);
        socket.emit('leave_conversation', convId);
      };
    }
    return undefined;
  }, [isOpen, isMinimized, activeConv, socket]);

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
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || err.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  if (!user || user.role !== 'JOBSEEKER') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto ${isMinimized ? 'w-72 h-14' : 'w-[360px] h-[520px] max-h-[80vh]'}`}>

          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-2">
              {activeConv && !isMinimized && (
                <button onClick={(e) => { e.stopPropagation(); setActiveConv(null); }} className="hover:bg-white/20 p-1 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeConv && !isMinimized && (
                <CompanyAvatar companyInfo={getCompanyInfo(activeConv)} className="w-7 h-7 rounded-full border border-white/30 bg-white text-xs" />
              )}
              <h3 className="font-bold text-sm truncate max-w-[210px]">
                {isMinimized ? 'Tin nhắn' : (activeConv ? getCompanyInfo(activeConv).name : 'Tin nhắn của bạn')}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-white/20 rounded-full">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* If no active conversation, show list */}
              {!activeConv ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">Bạn chưa có cuộc trò chuyện nào</div>
                  ) : (
                    conversations.map(c => {
                      const companyInfo = getCompanyInfo(c);
                      return (
                        <button key={c._id} onClick={() => setActiveConv(c)} className="w-full p-4 border-b border-slate-100 flex items-start gap-3 hover:bg-slate-100 transition-colors text-left bg-white">
                          <CompanyAvatar companyInfo={companyInfo} className="w-10 h-10 rounded-lg border border-slate-200 bg-white shrink-0 text-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-slate-900 truncate">{companyInfo.name}</h4>
                              <span className="text-[11px] text-slate-400 shrink-0">{c.lastMessageAt ? format(new Date(c.lastMessageAt), 'HH:mm') : ''}</span>
                            </div>
                            <p className="text-[11px] text-primary font-semibold mt-0.5 truncate">{c.jobId?.title || 'Trao đổi tuyển dụng'}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{c.lastMessage || 'Bắt đầu trò chuyện'}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                // Active conversation view
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                    {loading ? (
                      <div className="flex justify-center py-4 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
                    ) : (
                      messages.map((msg, idx) => {
                        const me = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                        const onlyAttachment = !msg.content && msg.attachments?.length > 0;
                        return (
                          <div key={msg._id || idx} className={`flex max-w-[85%] gap-2 ${me ? 'ml-auto flex-row-reverse' : ''}`}>
                            {!me && (
                              <CompanyAvatar companyInfo={getCompanyInfo(activeConv)} className="w-7 h-7 rounded-full border border-slate-200 shrink-0 mt-auto text-xs" />
                            )}
                            <div className={`flex flex-col ${me ? 'items-end' : 'items-start'}`}>
                              <div className={`text-sm ${onlyAttachment ? 'p-0 bg-transparent shadow-none border-0' : `px-3 py-2 shadow-sm ${me ? 'bg-primary text-white rounded-2xl rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'}`}`}>
                                {msg.content && <p>{msg.content}</p>}
                                {msg.attachments?.map((att, i) => {
                                  const meta = getAttachmentMeta(att);
                                  const Icon = meta.icon;
                                  const isImage = meta.label === 'Ảnh';
                                  return (
                                    <div key={i} className="mt-2">
                                      {isImage ? (
                                        <button type="button" onClick={() => window.open(att.fileUrl, '_blank')} className="block overflow-hidden rounded-xl hover:opacity-90 transition">
                                          <img src={att.fileUrl} alt={att.fileName || 'Ảnh đính kèm'} className="max-w-[180px] max-h-[180px] object-cover" />
                                        </button>
                                      ) : (
                                        <a href={att.fileUrl} target="_blank" rel="noreferrer" download={att.fileName || true} className={`flex items-center gap-2 py-1.5 transition ${me && !onlyAttachment ? 'text-white hover:text-blue-100' : 'text-slate-700 hover:text-primary'}`}>
                                          <span className="w-6 h-6 flex items-center justify-center shrink-0">
                                            <Icon className={`w-4 h-4 ${meta.color}`} />
                                          </span>
                                          <span className="min-w-0 text-left">
                                            <span className={`block text-[10px] font-black uppercase tracking-wide ${me && !onlyAttachment ? 'text-blue-100' : 'text-slate-400'}`}>{meta.label}</span>
                                            <span className="block max-w-[140px] truncate text-xs font-semibold">{att.fileName || 'Tệp đính kèm'}</span>
                                          </span>
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="text-[10px] font-medium mt-1 text-slate-400">
                                {format(new Date(msg.createdAt || new Date()), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-slate-100 bg-white relative">
                    {selectedFile && (
                      <div className="absolute bottom-full mb-2 left-3 right-3 rounded-xl px-1 py-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-blue-800 truncate">{selectedFile.name}</span>
                        </div>
                        <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 rounded-full hover:bg-blue-100 text-blue-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-end gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                      <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-primary rounded-full hover:bg-slate-200/50">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 max-h-24 min-h-[40px] py-2 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <button onClick={handleSend} disabled={sending} className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => { setIsOpen(true); setIsMinimized(false); refreshUnreadCount(); }}
        className="relative mt-3 h-14 w-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center transition-all hover:-translate-y-1 hover:bg-primary/90 pointer-events-auto animate-bounce hover:animate-none"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-red-500 border-2 border-white text-[10px] font-black text-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default JobseekerChatBubble;




