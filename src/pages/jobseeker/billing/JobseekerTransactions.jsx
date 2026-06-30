import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import RequestInvoiceModal from '../../../components/employer/billing/RequestInvoiceModal';

// Tab filter tổng quát — gộp các loại giao dịch mua gói/mở khóa/tin nổi bật
// vào cùng 1 nhóm để UI gọn lại.
// - 'all'     → tất cả giao dịch
// - 'package' → các giao dịch mua gói (PACKAGE_PURCHASE, CV_UNLOCK_SINGLE, CV_UNLOCK_BY_PACKAGE)
// - 'topup'   → nạp tiền vào ví (WALLET_DEPOSIT)
const PACKAGE_TYPES = ['PACKAGE_PURCHASE', 'CV_UNLOCK_SINGLE', 'CV_UNLOCK_BY_PACKAGE'];

const TABS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'package', label: 'Mua gói' },
  { key: 'topup',   label: 'Nạp tiền' }
];

// Tooltip giải thích trạng thái (hover vào StatusPill để xem).
// - SUCCESS  → đã cộng / đã thanh toán
// - PENDING  → đang chờ SePay; nếu >10p thì cảnh báo timeout
// - FAILED   → lấy metadata.failedReason do backend set khi webhook amount sai
const describeTransaction = (tx) => {
  if (!tx) return '';
  if (tx.status === 'SUCCESS') {
    if (tx.type === 'WALLET_DEPOSIT') return 'Đã cộng vào ví';
    if (tx.type === 'PACKAGE_PURCHASE') return 'Đã thanh toán — dịch vụ đang được kích hoạt';
    return 'Giao dịch đã hoàn tất';
  }
  if (tx.status === 'PENDING') {
    const ageMs = Date.now() - new Date(tx.createdAt).getTime();
    if (ageMs > 10 * 60 * 1000) {
      return 'Đang chờ SePay xác nhận — quá thời gian, kiểm tra nội dung chuyển khoản hoặc liên hệ hỗ trợ';
    }
    return 'Đang chờ SePay xử lý — tiền sẽ tự cộng khi ngân hàng xác nhận';
  }
  if (tx.status === 'FAILED') {
    return tx?.metadata?.failedReason || 'Thanh toán thất bại — liên hệ hỗ trợ để được hướng dẫn';
  }
  return tx.status;
};

const JobseekerTransactions = () => {
  const [active, setActive] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [preselectTxId, setPreselectTxId] = useState(null);

  const openInvoiceFor = (txId) => {
    setPreselectTxId(txId);
    setShowInvoiceModal(true);
  };

  useEffect(() => {
    api.get('/jobseeker/transactions')
      .then((r) => {
        if (r.data.success) {
          setRows(r.data.data);
          // Báo header refresh số dư (event vietworks:wallet-updated)
          window.dispatchEvent(new Event('vietworks:wallet-updated'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (active === 'package' && !PACKAGE_TYPES.includes(r.type)) return false;
      if (active === 'topup' && r.type !== 'WALLET_DEPOSIT') return false;
      if (keyword) {
        const blob = `${r._id} ${r.description} ${r.status}`.toLowerCase();
        if (!blob.includes(keyword.toLowerCase())) return false;
      }
      return true;
    });
  }, [active, keyword, rows]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-sm relative">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                {['Mã giao dịch', 'Loại', 'Số tiền', 'Trạng thái', 'Thời gian', 'Ghi chú', 'Hóa đơn'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Không có giao dịch.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{r._id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{typeLabel(r.type)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={r.type === 'WALLET_DEPOSIT' ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                        {r.type === 'WALLET_DEPOSIT' ? '+' : '-'}{Number(r.amount).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span title={describeTransaction(r)} className="cursor-help">
                        <StatusPill status={r.status} />
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">{r.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <InvoiceActionButton tx={r} onRequest={openInvoiceFor} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal yêu cầu xuất hóa đơn — mở khi user click "Xuất HĐ" ở 1 dòng */}
      <RequestInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        transactions={rows}
        defaultSelectedId={preselectTxId}
      />
    </div>
  );
};

// Nút thao tác hóa đơn trên từng dòng giao dịch:
// - Đã yêu cầu rồi (invoiceRequested=true)  → disable, label "Đã yêu cầu"
// - SUCCESS + PACKAGE_PURCHASE + chưa yêu cầu → enable "Xuất HĐ", mở modal
// - Còn lại (PENDING/FAILED, WALLET_DEPOSIT, …) → disable, label "—"
const InvoiceActionButton = ({ tx, onRequest }) => {
  if (tx?.invoiceRequested) {
    return (
      <button
        type="button"
        disabled
        title="Đã gửi yêu cầu — đang chờ admin xử lý"
        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 font-medium cursor-not-allowed"
      >
        Đã yêu cầu
      </button>
    );
  }
  if (tx?.status === 'SUCCESS' && tx?.type === 'PACKAGE_PURCHASE') {
    return (
      <button
        type="button"
        onClick={() => onRequest?.(tx._id)}
        className="px-3 py-1.5 rounded-lg border border-primary/40 text-primary font-semibold hover:bg-primary/10"
      >
        Xuất HĐ
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled
      title="Chỉ giao dịch mua gói dịch vụ thành công mới được xuất hóa đơn"
      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 font-medium cursor-not-allowed"
    >
      —
    </button>
  );
};

const typeLabel = (t) => {
  if (t === 'WALLET_DEPOSIT') return 'Nạp tiền';
  if (t === 'PACKAGE_PURCHASE') return 'Mua dịch vụ';
  if (t === 'CV_UNLOCK_SINGLE' || t === 'CV_UNLOCK_BY_PACKAGE') return 'Mở khóa CV';
  if (t === 'REFUND') return 'Hoàn tiền';
  if (t === 'ADMIN_ADJUSTMENT') return 'Điều chỉnh';
  return 'Khác';
};

const StatusPill = ({ status }) => {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800',
    SUCCESS: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-700'
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || map.PENDING}`}>{status}</span>;
};

export default JobseekerTransactions;