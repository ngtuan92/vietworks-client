import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeposit } from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';

const quickAmounts = [
  { label: '500k', value: 500000 },
  { label: '1 triệu', value: 1000000 },
  { label: '2 triệu', value: 2000000 },
  { label: '5 triệu', value: 5000000 },
];

const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)} đ`;

const TopUp = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500000);
  const [method, setMethod] = useState('SePay');
  const [needInvoice, setNeedInvoice] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await createDeposit(amount);
      if (response.success) {
        setQrData(response.data);
      }
    } catch (error) {
      console.error('Lỗi nạp tiền:', error);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQr = () => setQrData(null);

  const { paid } = useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: (orderCode) => {
      window.dispatchEvent(new Event('vietworks:wallet-updated'));
      setTimeout(() => {
        navigate(`/employer/wallet/payment-result?orderCode=${orderCode}`);
      }, 1500);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nạp tiền vào ví</h1>
        <p className="mt-1 text-slate-600">Nạp số dư để mua gói dịch vụ và mở khóa hồ sơ ứng viên.</p>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form id="topup-form" onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div>
              <label className="mb-3 block text-base font-bold text-slate-900">1. Chọn số tiền nạp</label>
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {quickAmounts.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAmount(item.value)}
                    className={`rounded-xl border py-3 font-bold transition-all ${
                      amount === item.value
                        ? 'border-primary bg-blue-50 text-primary shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-600">Hoặc nhập số tiền khác (VNĐ)</label>
              <input
                type="number"
                min={50000}
                step={10000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Nhập số tiền..."
              />
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="mb-3 block text-base font-bold text-slate-900">2. Phương thức thanh toán</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RadioCard
                  checked={method === 'SePay'}
                  onClick={() => setMethod('SePay')}
                  title="Thanh toán QR SePay"
                  desc="Quét mã QR qua ứng dụng ngân hàng."
                  icon="qr_code_scanner"
                />
                <RadioCard
                  checked={method === 'BANK_TRANSFER'}
                  onClick={() => setMethod('BANK_TRANSFER')}
                  title="Chuyển khoản ngân hàng"
                  desc="Sử dụng thông tin chuyển khoản được tạo tự động."
                  icon="account_balance"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={needInvoice} onChange={(event) => setNeedInvoice(event.target.checked)} />
              Tôi cần xuất hóa đơn cho giao dịch này
            </label>

            <button
              type="submit"
              disabled={loading || !amount || amount < 50000}
              className="w-full rounded-xl bg-primary py-3.5 font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Đang tạo mã thanh toán...' : 'Tạo mã thanh toán'}
            </button>
          </form>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Tóm tắt giao dịch</h2>
          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Số tiền nạp" value={formatPrice(amount)} highlight />
            <InfoRow label="Phương thức" value={method === 'SePay' ? 'QR SePay' : 'Chuyển khoản'} />
            <InfoRow label="Hóa đơn" value={needInvoice ? 'Có yêu cầu' : 'Không'} />
          </div>
        </aside>
      </div>

      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                  <span className="material-symbols-outlined text-[24px] text-emerald-600">qr_code</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quét mã QR thanh toán</h2>
                  <p className="text-sm text-slate-500">Thanh toán qua SePay</p>
                </div>
              </div>
              <button onClick={handleCloseQr} className="rounded-lg p-2 hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4 inline-block rounded-xl border border-slate-200 bg-white p-4">
                <img src={qrData.qrUrl} alt="QR thanh toán" className="mx-auto h-48 w-48" />
              </div>
              <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-4 text-left">
                <InfoRow label="Số tiền" value={formatPrice(qrData.amount)} highlight />
                <InfoRow label="Ngân hàng" value={qrData.bankName} />
                <InfoRow label="Số tài khoản" value={qrData.bankAccount} />
                <InfoRow label="Chủ tài khoản" value={qrData.bankOwner} />
                <InfoRow label="Nội dung chuyển khoản" value={qrData.transferContent} primary />
              </div>

              {paid ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <span className="material-symbols-outlined text-[40px] text-emerald-600">check_circle</span>
                  <p className="mt-1 font-black text-emerald-700">Nạp tiền thành công!</p>
                  <p className="mb-3 text-sm text-emerald-600">Đang chuyển sang trang xác nhận...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Đang chờ thanh toán... hệ thống sẽ tự cộng tiền khi nhận được.
                  </div>
                  <button onClick={handleCloseQr} className="w-full rounded-xl border border-slate-200 px-6 py-3 font-bold transition-all hover:bg-slate-50">
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RadioCard = ({ checked, onClick, title, desc, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-2xl border p-4 text-left transition-all ${
      checked ? 'border-primary bg-blue-50/50 shadow-sm ring-1 ring-primary/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${checked ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <div className="font-bold text-slate-900">{title}</div>
          <div className="mt-0.5 text-sm leading-relaxed text-slate-500">{desc}</div>
        </div>
      </div>
      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-primary' : 'border-slate-300'}`}>
        {checked ? <div className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      </div>
    </div>
  </button>
);

const InfoRow = ({ label, value, highlight, primary }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-slate-500">{label}:</span>
    <span className={`text-right font-bold ${highlight ? 'text-emerald-600' : primary ? 'text-[#003f87]' : 'text-slate-900'}`}>{value}</span>
  </div>
);

export default TopUp;
