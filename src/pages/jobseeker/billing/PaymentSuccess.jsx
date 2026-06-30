import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTransactionByOrderCode, checkSepayPayment } from '../../../services/paymentService';

const Info = ({ label, value, mono = false, valueClassName = '' }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className={`font-semibold text-slate-900 mt-1 break-all ${mono ? 'font-mono text-xs' : ''} ${valueClassName}`}>
      {value}
    </div>
  </div>
);

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng trong URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const res = await getTransactionByOrderCode(orderCode);
        if (cancelled) return;
        setData(res);
        if (res?.transaction?.status === 'PENDING') setPolling(true);
      } catch (e) {
        if (cancelled) return;
        setError(e.response?.data?.message || 'Lỗi khi lấy thông tin giao dịch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOnce();
    return () => { cancelled = true; };
  }, [orderCode]);

  useEffect(() => {
    if (!polling || !orderCode) return;
    const id = setInterval(async () => {
      try {
        const r = await checkSepayPayment(orderCode);
        if (r?.paid) {
          const fresh = await getTransactionByOrderCode(orderCode);
          setData(fresh);
          setPolling(false);
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(id);
  }, [polling, orderCode]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-10 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 mt-4">Đang tải thông tin giao dịch...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.transaction) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">Không tìm thấy giao dịch</h1>
          <p className="text-slate-600 mt-2">{error || 'Mã đơn hàng không hợp lệ.'}</p>
          <Link to="/my-transactions" className="inline-block mt-6 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95">
            Xem lịch sử giao dịch
          </Link>
        </div>
      </div>
    );
  }

  const { transaction, package: pkg, userServicePackage, target } = data;
  const isPending = transaction.status === 'PENDING';
  const isSuccess = transaction.status === 'SUCCESS';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-600'
                : isPending
                ? 'bg-amber-50 text-amber-600 animate-pulse'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>
              {isSuccess ? 'check_circle' : isPending ? 'hourglass_top' : 'cancel'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            {isSuccess
              ? 'Thanh toán thành công!'
              : isPending
              ? 'Đang chờ xác nhận thanh toán'
              : 'Thanh toán thất bại'}
          </h1>
          <p className="text-slate-600 mt-2">
            Số tiền: <b className="text-primary">{Number(transaction.amount).toLocaleString('vi-VN')} VNĐ</b>
          </p>
          {isPending && (
            <p className="text-amber-600 text-sm mt-2">
              Trang sẽ tự cập nhật khi ngân hàng xác nhận giao dịch (1–2 phút).
            </p>
          )}
        </div>

        {/* Thông tin giao dịch */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Info label="Mã giao dịch" value={transaction._id} mono />
          <Info label="Mã đơn hàng" value={transaction.orderCode || '-'} mono />
          <Info label="Thời gian tạo" value={new Date(transaction.createdAt).toLocaleString('vi-VN')} />
          <Info
            label="Thời gian thanh toán"
            value={transaction.paidAt ? new Date(transaction.paidAt).toLocaleString('vi-VN') : '-'}
          />
        </div>

        {/* Gói đã kích hoạt */}
        {pkg && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-blue-50/30 p-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              Gói đã kích hoạt
            </h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Info label="Tên gói" value={pkg.name} />
              {target && <Info label="CV được boost" value={target.title} />}
              <Info label="Thời hạn" value={`${pkg.durationDays || 0} ngày`} />
              {userServicePackage?.expiredAt && (
                <Info
                  label="Hết hạn"
                  value={new Date(userServicePackage.expiredAt).toLocaleDateString('vi-VN')}
                  valueClassName="text-primary font-bold"
                />
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          <Link
            to="/manage-cv"
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
          >
            Về CV của tôi
          </Link>
          <Link
            to="/my-subscriptions"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            Xem gói đang dùng
          </Link>
        </div>
      </div>
    </div>
  );
};


export default PaymentSuccess;
