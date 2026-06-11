import { useState } from 'react';
import { Search, Phone, Video, Info, Paperclip, Smile, SendHorizontal, MoreVertical } from 'lucide-react';

const threads = [
  { id: 1, name: 'Nguyễn Minh Anh', last: 'Em đã nhận lịch phỏng vấn, cảm ơn anh/chị.', time: '10:32', unread: 0, job: 'Senior Backend Developer', online: true, avatar: 'M' },
  { id: 2, name: 'Lê Gia Huy', last: 'Em gửi thêm portfolio tại đây ạ.', time: '09:18', unread: 2, job: 'Product Designer', online: false, avatar: 'H' },
  { id: 3, name: 'Phạm Đức Huy', last: 'Nhờ anh/chị phản hồi giúp em về kết quả.', time: 'Hôm qua', unread: 0, job: 'Backend Engineer', online: true, avatar: 'P' },
];

const Messages = () => {
  const [active, setActive] = useState(threads[0]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* LEFT SIDEBAR - THREADS */}
      <aside className="xl:col-span-3 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Tin nhắn</h1>
            <button className="text-primary font-semibold text-sm hover:underline">Đánh dấu đã đọc</button>
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
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50 ${active.id === t.id ? 'bg-blue-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  {t.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 truncate text-sm">{t.name}</h3>
                    <span className={`text-xs whitespace-nowrap ${t.unread > 0 ? 'text-primary font-bold' : 'text-slate-400'}`}>{t.time}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5 truncate">{t.job}</p>
                  <p className={`text-sm mt-1 truncate ${t.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{t.last}</p>
                </div>
                {t.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {t.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* CENTER - MAIN CHAT AREA */}
      <section className="xl:col-span-6 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                {active.avatar}
              </div>
              {active.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">{active.name}</h2>
              <p className="text-xs text-emerald-600 font-medium">{active.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"><Video className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#f8fafc] custom-scrollbar">
          <div className="text-center">
            <span className="bg-slate-200/60 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full">Hôm nay</span>
          </div>
          
          <Bubble me={false} avatar={active.avatar} text="Chào anh/chị, em quan tâm vị trí này và đã gửi CV trên hệ thống." time="09:00" />
          <Bubble me={true} text="Cảm ơn bạn đã ứng tuyển. Bạn sẵn sàng phỏng vấn online qua Google Meet vào lúc 14:00 thứ 3 tuần sau không?" time="09:05" />
          <Bubble me={false} avatar={active.avatar} text={active.last} time={active.time} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2 mb-3">
            <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">Gửi lịch phỏng vấn</button>
            <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">Mẫu tin nhanh</button>
          </div>
          <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-200/50">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent max-h-32 min-h-[44px] py-2.5 px-2 outline-none resize-none text-sm text-slate-700"
              rows={1}
            />
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-200/50">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <SendHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT SIDEBAR - INFO */}
      <aside className="xl:col-span-3 bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-4xl mx-auto shadow-sm">
            {active.avatar}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xl">{active.name}</h3>
            <p className="text-sm text-slate-500 mt-1">Ứng viên tiềm năng</p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Info className="w-4 h-4" />
              Xem hồ sơ
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-900">Thông tin ứng tuyển</h4>
          
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Vị trí ứng tuyển</div>
              <div className="font-semibold text-slate-900 mt-1">{active.job}</div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Trạng thái hồ sơ</div>
              <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                ĐÃ XEM
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium mb-2">Đính kèm</div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">PDF</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">CV_NguyenMinhAnh.pdf</p>
                  <p className="text-[10px] text-slate-400">1.2 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const Bubble = ({ me, avatar, text, time }) => (
  <div className={`flex gap-3 max-w-[85%] ${me ? 'ml-auto flex-row-reverse' : ''}`}>
    {!me && (
      <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs mt-auto">
        {avatar}
      </div>
    )}
    <div className={`flex flex-col ${me ? 'items-end' : 'items-start'}`}>
      <div 
        className={`px-4 py-3 text-sm shadow-sm ${
          me 
            ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl rounded-br-sm' 
            : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
        }`}
      >
        {text}
      </div>
      <div className={`text-[11px] font-medium mt-1 ${me ? 'text-slate-400' : 'text-slate-400'}`}>
        {time}
      </div>
    </div>
  </div>
);

export default Messages;
