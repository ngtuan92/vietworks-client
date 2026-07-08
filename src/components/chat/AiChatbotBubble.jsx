import { useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizontal, Sparkles, X } from 'lucide-react';
import { sendAiChatMessage } from '../../services/aiChatbotService';
import liveChatbotGif from '../../assets/live-chatbot.gif';
import vietworksAiAvatar from '../../assets/vietworks-ai-avatar.png';

const starterMessages = [
  'Tìm việc phù hợp với hồ sơ của tôi',
  'Hướng dẫn tạo CV trên VietWorks',
  'Cách ứng tuyển việc làm'
];

const renderMessageText = (text) => String(text)
  .split(/(\*\*[^*]+\*\*)/g)
  .map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });

const AiChatbotBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Chào bạn, mình là trợ lý AI của VietWorks. Bạn muốn mình hỗ trợ tìm việc, tạo CV hay hướng dẫn sử dụng hệ thống?'
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const submitMessage = async (content = draft) => {
    const text = content.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setDraft('');
    setSending(true);

    try {
      const response = await sendAiChatMessage({
        message: text,
        messages: messages.map(({ role, content }) => ({ role, content }))
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data?.reply || 'Mình chưa có câu trả lời phù hợp cho câu hỏi này.'
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.response?.data?.message || 'Chatbot AI đang tạm thời chưa sẵn sàng. Bạn thử lại sau nhé.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex flex-col items-start pointer-events-none">
      {isOpen && (
        <div className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[82vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img src={vietworksAiAvatar} alt="" className="w-11 h-11 object-contain" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm truncate">VietWorks AI</h3>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                </div>
                <p className="text-[11px] text-slate-200 truncate">Trợ lý việc làm và CV</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10"
              aria-label="Dong chatbot AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 custom-scrollbar">
            {messages.map((message, index) => {
              const fromUser = message.role === 'user';
              return (
                <div key={`${message.role}-${index}`} className={`flex gap-2 ${fromUser ? 'justify-end' : 'justify-start'}`}>
                  {!fromUser && (
                    <span className="w-8 h-8 rounded-full bg-white border border-cyan-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden mt-auto">
                      <img src={vietworksAiAvatar} alt="" className="w-7 h-7 object-contain" />
                    </span>
                  )}
                  <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    fromUser
                      ? 'bg-primary text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{renderMessageText(message.content)}</p>
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start gap-2">
                <span className="w-8 h-8 rounded-full bg-white border border-cyan-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden mt-auto">
                  <img src={vietworksAiAvatar} alt="" className="w-7 h-7 object-contain" />
                </span>
                <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-bl-md text-slate-500 flex items-center gap-2 text-sm shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang trả lời...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 space-y-2">
            {messages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {starterMessages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => submitMessage(item)}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Hỏi VietWorks AI..."
                className="flex-1 min-h-[40px] max-h-24 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => submitMessage()}
                disabled={sending || !draft.trim()}
                className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary/90"
                aria-label="Gui tin nhan AI"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative h-24 w-24 flex items-center justify-center transition-all hover:-translate-y-1 pointer-events-auto"
        aria-label="Mo chatbot AI"
      >
        {!isOpen && (
          <span className="absolute bottom-full left-0 mb-2 w-max max-w-[180px] rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xl border border-slate-200 opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0">
            Cần hỗ trợ tìm việc?
          </span>
        )}
        <img src={liveChatbotGif} alt="" className="h-24 w-24 object-contain drop-shadow-2xl" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-lg whitespace-nowrap">
          VietWorks AI
        </span>
      </button>
    </div>
  );
};

export default AiChatbotBubble;
