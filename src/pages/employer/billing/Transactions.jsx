import { useMemo, useState } from 'react';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'topup', label: 'Nạp tiền' },
  { key: 'service', label: 'Mua dịch vụ' },
  { key: 'unlock', label: 'Mở khóa CV' },
  { key: 'job_package', label: 'Gói tin nổi bật' },
];

const rows = [
  { id: 'TXN-001', type: 'topup', amount: 1000000, sign: '+', status: 'SUCCESS', at: '18/05/2026 14:12', note: 'Nạp qua PayOS' },
  { id: 'TXN-002', type: 'unlock', amount: 20000, sign: '-', status: 'SUCCESS', at: '18/05/2026 15:05', note: 'Mở khóa CV ứng viên #1' },
  { id: 'TXN-003', type: 'job_package', amount: 150000, sign: '-', status: 'SUCCESS', at: '17/05/2026 09:30', note: 'Gói Job 7 ngày cho Job #1' },
  { id: 'TXN-004', type: 'topup', amount: 500000, sign: '+', status: 'PENDING', at: '16/05/2026 10:11', note: 'Chờ thanh toán PayOS' },
  { id: 'TXN-005', type: 'service', amount: 800000, sign: '-', status: 'FAILED', at: '14/05/2026 16:40', note: 'Mua gói 50 CV (thất bại)' },
];

const Transactions = () => {
  const [active, setActive] = useState('all');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (active !== 'all' && r.type !== active) return false;
      if (keyword) {
        const blob = `${r.id} ${r.note} ${r.status}`.toLowerCase();
        if (!blob.includes(keyword.toLowerCase())) return false;
      }
      return true;
    });
  }, [active, keyword]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử giao dịch</h1>
        <p className="text-slate-600 mt-1">Dữ liệu lịch sử giao dịch là dữ liệu đóng, không cho phép chỉnh sửa hoặc xóa.</p>
      </div>

      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${active === t.key ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              placeholder="Mã giao dịch, ghi chú..."
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Mã giao dịch', 'Loại', 'Số tiền', 'Trạng thái', 'Thời gian', 'Ghi chú', 'Hóa đơn'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{r.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{typeLabel(r.type)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={r.sign === '+' ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {r.sign}{r.amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.at}</td>
                  <td className="px-4 py-3">{r.note}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                      Tải
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Không có giao dịch.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const typeLabel = (t) => {
  if (t === 'topup') return 'Nạp tiền';
  if (t === 'service') return 'Mua dịch vụ';
  if (t === 'unlock') return 'Mở khóa CV';
  if (t === 'job_package') return 'Gói Job';
  return 'Khác';
};

const StatusPill = ({ status }) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800',
    SUCCESS: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || map.PENDING}`}>{status}</span>;
};

export default Transactions;
