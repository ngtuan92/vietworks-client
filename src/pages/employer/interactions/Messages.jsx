import { useState } from 'react';

const threads = [
  { id: 1, name: 'Nguyễn Minh Anh', last: 'Em đã nhận lịch phỏng vấn, cảm ơn anh/chị.', time: '10:32', unread: 0, job: 'Senior Backend Developer' },
  { id: 2, name: 'Lê Gia Huy', last: 'Em gửi thêm portfolio tại đây ạ.', time: '09:18', unread: 2, job: 'Product Designer' },
  { id: 3, name: 'Phạm Đức Huy', last: 'Nhờ anh/chị phản hồi giúp em về kết quả.', time: 'Hôm qua', unread: 0, job: 'Backend Engineer' },
];

const Messages = () => {
  const [active, setActive] = useState(threads[0]);
  const [draft, setDraft] = useState('');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <aside className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">Tin nhắn</h1>
        </div>
        <div className="divide-y divide-slate-100">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className={`w-full text-left p-4 hover:bg-slate-50 ${active.id === t.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.time}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{t.job}</div>
              <div className="text-sm text-slate-600 mt-2 line-clamp-2">{t.last}</div>
              {t.unread > 0 ? <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{t.unread} mới</span> : null}
            </button>
          ))}
        </div>
      </aside>

      <section className="xl:col-span-6 bg-white border border-slate-200 rounded-2xl flex flex-col min-h-[720px]">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">{active.name}</h2>
          <p className="text-sm text-slate-500">{active.job}</p>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50">
          <Bubble me={false} text="Chào anh/chị, em quan tâm vị trí này." time="09:00" />
          <Bubble me={true} text="Cảm ơn bạn đã ứng tuyển. Bạn sẵn sàng phỏng vấn online vào thứ 3 không?" time="09:05" />
          <Bubble me={false} text={active.last} time={active.time} />
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Gửi lịch phỏng vấn</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Mẫu tin nhanh</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">Gửi file</button>
          </div>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
            />
            <button className="px-4 py-3 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
              Gửi
            </button>
          </div>
        </div>
      </section>

      <aside className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-slate-900">Thông tin liên quan</h3>
        <Card title="Ứng viên" value={active.name} />
        <Card title="Job" value={active.job} />
        <Card title="Trạng thái hồ sơ" value="VIEWED" />
      </aside>
    </div>
  );
};

const Bubble = ({ me, text, time }) => (
  <div className={`max-w-[80%] ${me ? 'ml-auto' : ''}`}>
    <div className={`rounded-2xl px-4 py-3 text-sm ${me ? 'bg-[#003f87] text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
      {text}
    </div>
    <div className={`text-xs mt-1 ${me ? 'text-right text-slate-400' : 'text-slate-400'}`}>{time}</div>
  </div>
);

const Card = ({ title, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{title}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default Messages;
