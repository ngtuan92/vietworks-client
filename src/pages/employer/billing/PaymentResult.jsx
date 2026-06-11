
import { Link, useSearchParams } from 'react-router-dom';

const PaymentResult = () => {
  const [params] = useSearchParams();
  const status = (params.get('status') || 'success').toLowerCase();
  const amount = params.get('amount') || '0';
  const success = status === 'success' || status === 'approved';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className="material-symbols-outlined text-3xl">{success ? 'check_circle' : 'cancel'}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h1>
            <p className="text-slate-600 mt-1">Số tiền: <b>{Number(amount).toLocaleString('vi-VN')} VNĐ</b></p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Info label="Mã giao dịch" value="TXN-123456" />
              <Info label="Thời gian" value={new Date().toLocaleString('vi-VN')} />
              <Info label="Trạng thái" value={success ? 'SUCCESS' : 'FAILED'} />
              <Info label="Số dư mới" value="1.250.000 VNĐ" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <Link to="/employer/wallet" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Quay lại ví
          </Link>
          <Link to="/employer/transactions" className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Xem lịch sử giao dịch
          </Link>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default PaymentResult;
