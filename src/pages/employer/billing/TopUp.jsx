import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeposit } from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';

const quickAmounts = [
  { label: '500k', value: 500000 },
  { label: '1 Triệu', value: 1000000 },
  { label: '2 Triệu', value: 2000000 },
  { label: '5 Triệu', value: 5000000 },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const TopUp = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500000);
  const [method, setMethod] = useState('SePay');
  const [needInvoice, setNeedInvoice] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await createDeposit(amount);
      if (res.success) {
        setQrData(res.data);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQr = () => {
    setQrData(null);
  };

  // Polling SePay - khi paid → tự navigate sang trang Payment Result
  const { paid } = useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: (orderCode) => {
      // Delay 1.5s để user thấy ✓ rồi mới chuyển trang
      setTimeout(() => {
        navigate(`/employer/wallet/payment-result?orderCode=${orderCode}`);
      }, 1500);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nạp tiền vào ví</h1>
        <p className="text-slate-600 mt-1">Nạp số dư để dễ dàng mua các gói dịch vụ và mở khóa hồ sơ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form id="topup-form" onSubmit={submit} className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-6">
            <div>
              <label className="block text-base font-bold text-slate-900 mb-3">1. Chọn số tiền nạp</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {quickAmounts.map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAmount(item.value)}
                    className={`py-3 rounded-xl font-bold border transition-all ${
                      amount === item.value 
                        ? 'border-primary bg-blue-50 text-primary shadow-sm' 
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Hoặc nhập số tiền khác (VNĐ)</label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                  placeholder="Nhập số tiền..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="block text-base font-bold text-slate-900 mb-3">2. Phương thức thanh toán</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RadioCard 
                  checked={method === 'SePay'} 
                  onClick={() => setMethod('SePay')} 
                  title="Thanh toán QR (SePay)" 
                  desc="Quét mã QR qua ứng dụng ngân hàng." 
                  icon="qr_code_scanner"
                />
                <RadioCard 
                  checked={method === 'Bank'} 
                  onClick={() => setMethod('Bank')} 
                  title="Chuyển khoản thủ công" 
                  desc="Chuyển tiền vào số tài khoản VietWorks." 
                  icon="account_balance"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors ${needInvoice ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                  {needInvoice && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                </div>
                <input type="checkbox" checked={needInvoice} onChange={(e) => setNeedInvoice(e.target.checked)} className="hidden" />
                <div>
                  <span className="text-sm font-bold text-slate-800">Yêu cầu xuất hóa đơn GTGT (VAT)</span>
                  <p className="text-sm text-slate-500 mt-0.5">Chúng tôi sẽ gửi hóa đơn điện tử qua email của công ty sau khi giao dịch thành công.</p>
                </div>
              </label>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-6 sticky top-6">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Tóm tắt giao dịch</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Dịch vụ</span>
                <span className="font-semibold text-slate-800">Nạp số dư ví</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Số tiền nạp</span>
                <span className="font-semibold text-slate-800">{formatPrice(amount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (0%)</span>
                <span className="font-semibold text-slate-800">0 đ</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-200 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900 text-base">Tổng thanh toán</span>
                <span className="font-black text-2xl text-primary">{formatPrice(amount || 0)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="topup-form"
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              Nạp tiền ngay
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              Bằng việc bấm Nạp tiền ngay, bạn đã đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
            </p>
          </div>
        </div>

      </div>

      {/* QR Code Modal */}
      {qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px]">qr_code</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quét mã QR thanh toán</h2>
                  <p className="text-sm text-slate-500">Thanh toán qua SePay</p>
                </div>
              </div>
              <button onClick={handleCloseQr} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-4">
                <img src={qrData.qrUrl} alt="QR Thanh toán" className="w-48 h-48 mx-auto" />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số tiền:</span>
                  <span className="font-black text-emerald-600">{Number(qrData.amount).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-900">{qrData.bankName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-bold text-slate-900">{qrData.bankAccount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <span className="font-black text-[#003f87]">{qrData.transferContent}</span>
                </div>
              </div>
              {paid ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <span className="material-symbols-outlined text-emerald-600 text-[40px]">check_circle</span>
                  <p className="font-black text-emerald-700 mt-1">Nạp tiền thành công!</p>
                  <p className="text-sm text-emerald-600 mb-3">Đang chuyển sang trang xác nhận...</p>
                  <button
                    onClick={() => navigate(`/employer/wallet/payment-result?orderCode=${qrData.orderCode}`)}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                  >
                    Xem chi tiết giao dịch
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Đang chờ thanh toán... (tự cộng tiền khi nhận được)
                  </div>
                  <button
                    onClick={handleCloseQr}
                    className="w-full px-6 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                  >
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
    className={`w-full text-left rounded-2xl border p-4 transition-all ${
      checked 
        ? 'border-primary bg-blue-50/50 shadow-sm ring-1 ring-primary/20' 
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${checked ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <div className="font-bold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</div>
        </div>
      </div>
      <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center mt-0.5 ${checked ? 'border-primary' : 'border-slate-300'}`}>
        {checked ? <div className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
      </div>
    </div>
  </button>
);

export default TopUp;
