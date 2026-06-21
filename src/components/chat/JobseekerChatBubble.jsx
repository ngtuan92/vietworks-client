import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, SendHorizontal, Paperclip, Loader2, Minimize2, Maximize2, ChevronLeft } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { getConversations, getMessages, sendMessage, uploadChatFile, markAsRead } from '../../services/chatService';
import useAuth from '../../hooks/useAuth';
import { format } from 'date-fns';

const JobseekerChatBubble = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
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

  useEffect(() => {
    if (user && user.role === 'JOBSEEKER') {
      fetchConversations();
    }
  }, [user]);

  // Handle socket for new messages and unread count
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
        if (isOpen && !isMinimized) {
          markAsRead(activeConv._id);
        }
      } else {
        setUnreadCount(prev => prev + 1);
      }
      fetchConversations(); // refresh list
    };
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeConv, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && activeConv) {
      const loadMsg = async () => {
        setLoading(true);
        try {
          const res = await getMessages(activeConv._id);
          if (res.success) setMessages(res.data);
          markAsRead(activeConv._id);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadMsg();
      if (socket) socket.emit('join_conversation', activeConv._id);
      return () => {
        if (socket) socket.emit('leave_conversation', activeConv._id);
      };
    }
  }, [isOpen, isMinimized, activeConv, socket]);

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
        if (uploadRes.success) attachments.push(uploadRes.data);
        fileInputRef.current.value = '';
      }
      const res = await sendMessage(activeConv._id, { content: draft, attachments });
      if (res.success) setDraft('');
    } catch (error) {
      console.error(error);
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
              <h3 className="font-bold text-sm">
                {isMinimized ? 'Tin nhắn' : (activeConv ? activeConv.jobId?.companyId?.companyName || 'Công ty' : 'Tin nhắn của bạn')}
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
                      const companyName = c.jobId?.companyId?.companyName || 'Nhà tuyển dụng';
                      const logo = c.jobId?.companyId?.logo;
                      return (
                        <button key={c._id} onClick={() => setActiveConv(c)} className="w-full p-4 border-b border-slate-100 flex items-start gap-3 hover:bg-slate-100 transition-colors text-left bg-white">
                          <img src={logo || '/default-company-logo.png'} className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white shrink-0" alt=""/>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{companyName}</h4>
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
                      <div className="flex justify-center py-4 text-slate-400"><Loader2 className="w-5 h-5 animate-spin"/></div>
                    ) : (
                      messages.map((msg, idx) => {
                        const me = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                        return (
                          <div key={msg._id || idx} className={`flex max-w-[85%] ${me ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`px-3 py-2 text-sm shadow-sm ${me ? 'bg-primary text-white rounded-2xl rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'}`}>
                              {msg.content && <p>{msg.content}</p>}
                              {msg.attachments?.map((att, i) => (
                                <div key={i} className="mt-2">
                                  {att.fileType?.includes('image') ? (
                                    <img src={att.fileUrl} alt="img" className="max-w-[150px] rounded-lg cursor-pointer" onClick={() => window.open(att.fileUrl, '_blank')}/>
                                  ) : (
                                    <a href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline text-xs">
                                      <Paperclip className="w-3 h-3"/> File đính kèm
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-3 border-t border-slate-200 bg-white flex items-end gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Paperclip className="w-5 h-5" />
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
                      {sending ? <Loader2 className="w-4 h-4 animate-spin"/> : <SendHorizontal className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobseekerChatBubble;
