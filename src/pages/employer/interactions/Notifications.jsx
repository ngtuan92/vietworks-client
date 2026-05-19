

const items = [
  { id: 1, title: 'Tin tuyển dụng "Senior Backend Developer" đã được duyệt', type: 'Job', status: 'UNREAD', time: '18/05/2026 10:20' },
  { id: 2, title: 'Hồ sơ công ty đã được duyệt', type: 'Company', status: 'READ', time: '17/05/2026 14:10' },
  { id: 3, title: 'Có ứng viên mới ứng tuyển vào Job Product Designer', type: 'Application', status: 'UNREAD', time: '17/05/2026 09:15' },
  { id: 4, title: 'Nạp tiền thành công: 1.000.000 VNĐ', type: 'Billing', status: 'READ', time: '16/05/2026 18:05' },
  { id: 5, title: 'Gói premium của Job Sales Executive sắp hết hạn', type: 'Package', status: 'UNREAD', time: '16/05/2026 08:30' },
];

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-600 mt-1">Theo dõi thông báo Job, Company, Billing, Package và hệ thống.</p>
        </div>
        <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Tiêu đề', 'Loại', 'Trạng thái', 'Thời gian', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 min-w-[420px]">
                    <div className="font-medium text-slate-900">{item.title}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {item.status === 'UNREAD' ? 'Chưa đọc' : 'Đã đọc'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.time}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Notifications;
