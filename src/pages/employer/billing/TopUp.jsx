import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopUp = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(200000);
  const [method, setMethod] = useState('PayOS');
  const [needInvoice, setNeedInvoice] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    navigate('/employer/wallet/payment-result?status=success&amount=' + encodeURIComponent(amount));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nạp tiền</h1>
        <p className="text-slate-600 mt-1">Tạo lệnh nạp tiền vào ví để sử dụng các dịch vụ.</p>
      </div>

      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền nạp</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RadioCard checked={method === 'PayOS'} onClick={() => setMethod('PayOS')} title="PayOS" desc="Thanh toán nhanh qua cổng PayOS." />
            <RadioCard checked={method === 'Bank'} onClick={() => setMethod('Bank')} title="Chuyển khoản" desc="Chuyển khoản ngân hàng." />
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={needInvoice} onChange={(e) => setNeedInvoice(e.target.checked)} className="mt-1" />
          Yêu cầu xuất hóa đơn
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate('/employer/wallet')} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Hủy
          </button>
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Tiếp tục thanh toán
          </button>
        </div>
      </form>
    </div>
  );
};

const RadioCard = ({ checked, onClick, title, desc }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-2xl border p-4 transition-colors ${checked ? 'border-[#003f87] bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-bold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600 mt-1">{desc}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${checked ? 'border-[#003f87]' : 'border-slate-300'}`}>
        {checked ? <div className="w-2.5 h-2.5 rounded-full bg-[#003f87]" /> : null}
      </div>
    </div>
  </button>
);

export default TopUp;
