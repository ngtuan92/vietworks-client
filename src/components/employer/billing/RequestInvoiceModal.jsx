import { useEffect, useMemo, useState } from 'react';
import { requestInvoice } from '../../../services/paymentService';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

// Lọc các giao dịch đủ điều kiện xuất hóa đơn:
// - status SUCCESS
// - type PACKAGE_PURCHASE (theo logic backend tại invoiceController.js)
// - chưa invoiceRequested
const isInvoiceEligible = (tx) =>
  tx?.status === 'SUCCESS'
  && tx?.type === 'PACKAGE_PURCHASE'
  && !tx?.invoiceRequested;

const describeTx = (tx) => {
  const date = tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : '';
  const amount = formatPrice(tx?.amount || 0);
  return `${amount} — ${date} — ${tx?.description || tx?._id}`;
};

const RequestInvoiceModal = ({ isOpen, onClose, transactions = [], defaultSelectedId = null }) => {
  const eligible = useMemo(() => transactions.filter(isInvoiceEligible), [transactions]);

  const [selectedId, setSelectedId] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Reset state mỗi lần mở modal
  useEffect(() => {
    if (isOpen) {
      // Ưu tiên id được truyền vào (từ button "Xuất HĐ" ở từng dòng), fallback về giao dịch đầu tiên.
      const initial = defaultSelectedId && eligible.some((t) => t._id === defaultSelectedId)
        ? defaultSelectedId
        : eligible[0]?._id || '';
      setSelectedId(initial);
      setTaxId('');
      setCompanyName('');
      setAddress('');
      setSubmitting(false);
      setError(null);
      setSuccess(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedId) {
      setError('Vui lòng chọn giao dịch cần xuất hóa đơn.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await requestInvoice(selectedId, { taxId, address });
      if (res?.success) {
        setSuccess(res.data);
        // Báo cho header refresh notification badge nếu cần
        window.dispatchEvent(new Event('vietworks:notification-read'));
      } else {
        setError(res?.message || 'Yêu cầu xuất hóa đơn thất bại.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">receipt_long</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Yêu cầu xuất hóa đơn VAT</h2>
                <p className="text-sm text-slate-500">Chọn giao dịch thành công và điền thông tin xuất hóa đơn.</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg" disabled={submitting}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {success ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-emerald-600 text-[32px]">check_circle</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gửi yêu cầu thành công</h3>
              <p className="text-sm text-slate-600 mb-4">
                Mã hóa đơn: <span className="font-bold text-slate-900">{success.invoiceNumber}</span>
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Hóa đơn điện tử sẽ được gửi qua email sau khi admin xử lý.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {eligible.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  Bạn chưa có giao dịch mua gói dịch vụ thành công nào để xuất hóa đơn.
                  Hóa đơn VAT chỉ áp dụng cho giao dịch mua gói, không áp dụng cho giao dịch nạp tiền.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Giao dịch cần xuất hóa đơn</label>
                    <select
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                      required
                    >
                      {eligible.map((tx) => (
                        <option key={tx._id} value={tx._id}>
                          {describeTx(tx)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Mã số thuế</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="VD: 0312345678"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tên đơn vị</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Tên công ty trên hóa đơn"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Địa chỉ</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Địa chỉ xuất hóa đơn"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm resize-none"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligible.length === 0}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestInvoiceModal;
