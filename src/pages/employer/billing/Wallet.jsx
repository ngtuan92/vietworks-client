
import { Link } from 'react-router-dom';

const Wallet = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ví của tôi</h1>
          <p className="text-slate-600 mt-1">Quản lý số dư, nạp tiền và theo dõi lịch sử giao dịch.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/employer/wallet/topup" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Nạp tiền
          </Link>
          <Link to="/employer/transactions" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Xem lịch sử
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Số dư hiện tại" value="1.250.000 VNĐ" tone="text-[#003f87]" />
        <Card title="Tổng đã nạp" value="5.500.000 VNĐ" />
        <Card title="Tổng đã sử dụng" value="4.250.000 VNĐ" />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-slate-900">Giao dịch gần đây</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Mã giao dịch', 'Loại', 'Số tiền', 'Trạng thái', 'Thời gian', 'Ghi chú'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['TXN-001', 'Nạp tiền', '+1.000.000', 'SUCCESS', '18/05/2026 14:12', 'Nạp qua PayOS'],
                ['TXN-002', 'Mở khóa CV', '-20.000', 'SUCCESS', '18/05/2026 15:05', 'Ứng viên Nguyễn Minh Anh'],
                ['TXN-003', 'Mua gói Job 7 ngày', '-150.000', 'SUCCESS', '17/05/2026 09:30', 'Job Senior Backend'],
              ].map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{row[0]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row[1]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row[2]} VNĐ</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">{row[3]}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{row[4]}</td>
                  <td className="px-4 py-3">{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const Card = ({ title, value, tone = 'text-slate-900' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5">
    <p className="text-sm text-slate-600">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${tone}`}>{value}</p>
  </div>
);

export default Wallet;
