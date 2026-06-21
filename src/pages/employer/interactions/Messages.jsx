import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Phone, Video, Info, Paperclip, Smile, SendHorizontal, MoreVertical, Loader2 } from 'lucide-react';
import { useSocket } from '../../../contexts/SocketContext';
import { getConversations, getMessages, sendMessage, uploadChatFile, markAsRead } from '../../../services/chatService';
import useAuth from '../../../hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Socket listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Update messages if we are in this conversation
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
        markAsRead(activeConv._id); // Auto read if currently open
      }
      
      // Update last message in the conversation list
      setConversations(prev => {
        const idx = prev.findIndex(c => c._id === msg.conversationId);
        if (idx !== -1) {
          const newConvs = [...prev];
          newConvs[idx].lastMessage = msg.content || 'Đã gửi đính kèm';
          newConvs[idx].lastMessageAt = msg.createdAt;
          // Sort again by lastMessageAt
          return newConvs.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        return prev;
      });
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeConv]);

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
    
    if (socket) {
      socket.emit('join_conversation', activeConv._id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConv._id);
      }
    };
  }, [activeConv, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() && !fileInputRef.current?.files[0]) return;
    if (!activeConv) return;

    try {
      setSending(true);
      let attachments = [];
      const file = fileInputRef.current?.files[0];
      
      if (file) {
        const uploadRes = await uploadChatFile(file);
        if (uploadRes.success) {
          attachments.push(uploadRes.data);
        }
        fileInputRef.current.value = ''; // Reset file
      }

      const res = await sendMessage(activeConv._id, { content: draft, attachments });
      if (res.success) {
        setDraft('');
        // NOTE: the new message will come back via Socket, but we can optimistically append it if we want.
        // For simplicity, we just rely on socket 'new_message' to render it.
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
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
            const name = jobseeker?.fullName || 'Ứng viên ẩn danh';
            const avatar = jobseeker?.avatar || name.charAt(0);
            return (
              <button
                key={c._id}
                onClick={() => setActiveConv(c)}
                className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 ${activeConv?._id === c._id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img src={avatar.length > 1 ? avatar : undefined} className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-lg object-cover" alt="" />
                    {!avatar.length > 1 && <span className="absolute inset-0 flex items-center justify-center">{avatar}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 truncate text-sm">{name}</h3>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {c.lastMessageAt ? format(new Date(c.lastMessageAt), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5 truncate">{c.jobId?.title || 'Vị trí không xác định'}</p>
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
          const name = jobseeker?.fullName || 'Ứng viên ẩn danh';
          const avatar = jobseeker?.avatar || name.charAt(0);
          return (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    {avatar.length > 1 ? <img src={avatar} alt="" className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-slate-600 font-bold">{avatar}</span>}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 leading-tight">{name}</h2>
                    <p className="text-xs text-slate-500">{activeConv.jobId?.title}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-[#f8fafc] custom-scrollbar">
                {messages.map((msg, idx) => {
                  const me = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  return (
                    <div key={msg._id || idx} className={`flex gap-3 max-w-[85%] ${me ? 'ml-auto flex-row-reverse' : ''}`}>
                      {!me && (
                        <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 overflow-hidden mt-auto">
                          {avatar.length > 1 ? <img src={avatar} className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">{avatar}</span>}
                        </div>
                      )}
                      <div className={`flex flex-col ${me ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 text-sm shadow-sm ${me ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'}`}>
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachments?.map((att, i) => (
                            <div key={i} className="mt-2">
                              {att.fileType?.includes('image') ? (
                                <img src={att.fileUrl} alt="attachment" className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90" onClick={() => window.open(att.fileUrl, '_blank')}/>
                              ) : (
                                <a href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline text-xs font-semibold">
                                  <Paperclip className="w-4 h-4"/> {att.fileName || 'Tài liệu đính kèm'}
                                </a>
                              )}
                            </div>
                          ))}
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
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={() => {/* Could show preview here */}} />
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
                    {sending ? <Loader2 className="w-5 h-5 animate-spin"/> : <SendHorizontal className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <Smile className="w-10 h-10 text-slate-300"/>
            </div>
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR - INFO */}
      <aside className="xl:col-span-3 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {activeConv ? (() => {
          const jobseeker = activeConv.participants.find(p => p.role === 'JOBSEEKER')?.userId;
          const name = jobseeker?.fullName || 'Ứng viên ẩn danh';
          const avatar = jobseeker?.avatar || name.charAt(0);
          return (
            <>
              <div className="text-center space-y-3 pb-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-200 shadow-sm relative">
                  {avatar.length > 1 ? <img src={avatar} className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">{avatar}</span>}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">{name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{jobseeker?.email || 'Chưa cập nhật email'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Thông tin ứng tuyển</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Vị trí ứng tuyển</div>
                  <div className="font-semibold text-slate-900 mt-1">{activeConv.jobId?.title}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Công ty</div>
                  <div className="font-semibold text-slate-900 mt-1">{activeConv.jobId?.companyId?.companyName || 'Công ty bạn'}</div>
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
