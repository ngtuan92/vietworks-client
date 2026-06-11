import { Eye } from 'lucide-react';


const rows = [
  { id: 1, name: 'Gói Job 7 ngày', target: 'Job Senior Backend Developer', start: '18/05/2026', end: '25/05/2026', status: 'ACTIVE', cost: '150.000 VNĐ' },
  { id: 2, name: 'Gói 50 CV', target: 'Tài khoản công ty', start: '10/05/2026', end: '09/06/2026', status: 'ACTIVE', cost: '800.000 VNĐ' },
  { id: 3, name: 'Gói Job 14 ngày', target: 'Job Sales Executive', start: '20/04/2026', end: '04/05/2026', status: 'EXPIRED', cost: '250.000 VNĐ' },
];

const ActivePackages = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gói đang sử dụng</h1>
        <p className="text-slate-600 mt-1">Theo dõi các gói dịch vụ đang active hoặc đã hết hạn.</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Tên gói', 'Áp dụng cho', 'Ngày bắt đầu', 'Ngày hết hạn', 'Trạng thái', 'Chi phí', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-4 py-3">{r.target}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.start}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.end}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {r.status === 'ACTIVE' ? 'Đang hoạt động' : 'Hết hạn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.cost}</td>
                  <td className="px-4 py-3">
                    <button 
                      title="Xem chi tiết"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <Eye className="w-4 h-4" />
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

export default ActivePackages;
