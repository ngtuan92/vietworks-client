import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiArrowUpRight, FiCreditCard, FiTrendingUp, FiTrendingDown, FiZap } from 'react-icons/fi';
import {
  getJobseekerWallet,
  createJobseekerWallet,
  createJobseekerDeposit,
  getJobseekerTransactions
} from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';
import RequestInvoiceModal from '../../../components/employer/billing/RequestInvoiceModal';

const typeConfig = {
  WALLET_DEPOSIT:        { label: 'Nạp tiền',       bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <FiArrowUpRight/> },
  PACKAGE_PURCHASE:      { label: 'Mua gói',         bg: 'bg-indigo-100',  text: 'text-indigo-700',  icon: <FiZap/> },
  CV_UNLOCK_SINGLE:      { label: 'Mở khóa CV',      bg: 'bg-violet-100',  text: 'text-violet-700',  icon: <FiCreditCard/> },
  CV_UNLOCK_BY_PACKAGE:  { label: 'Mở khóa CV (gói)', bg: 'bg-violet-100', text: 'text-violet-700',  icon: <FiCreditCard/> },
  REFUND:                { label: 'Hoàn tiền',       bg: 'bg-amber-100',   text: 'text-amber-700',   icon: <FiTrendingDown/> },
  ADMIN_ADJUSTMENT:      { label: 'Điều chỉnh',      bg: 'bg-slate-100',   text: 'text-slate-700',   icon: <FiTrendingUp/> }
};

const statusConfig = {
  SUCCESS: { label: 'Thành công', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING: { label: 'Đang chờ',   bg: 'bg-amber-100',   text: 'text-amber-700' },
  FAILED:  { label: 'Thất bại',   bg: 'bg-rose-100',    text: 'text-rose-700' },
  REJECTED:{ label: 'Bị từ chối', bg: 'bg-red-100',     text: 'text-red-700' }
};

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0) + ' đ';

const JobseekerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositData, setDepositData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  // Hiện notification tự ẩn sau 4s (đồng bộ với EmployerWallet)
  const showNotification = (payload) => {
    setNotification(payload);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => () => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      showNotification({ type: 'success', message: 'Nạp tiền thành công!' });
      fetchWallet();
      fetchTransactions();
    } else if (paymentStatus === 'error') {
      const reason = searchParams.get('reason');
      showNotification({
        type: 'error',
        message: reason
          ? `Nạp tiền thất bại: ${decodeURIComponent(reason)}`
          : 'Nạp tiền thất bại. Vui lòng kiểm tra giao dịch và thử lại.'
      });
      fetchTransactions();
    } else if (paymentStatus === 'cancel') {
      showNotification({ type: 'info', message: 'Đã hủy nạp tiền.' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchWallet = async () => {
    try {
      const data = await getJobseekerWallet();
      setWallet(data);
      // Báo cho header (và các nơi khác) biết balance vừa đổi
      window.dispatchEvent(new Event('vietworks:wallet-updated'));
    } catch (err) {
      console.error('Fetch wallet error:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await getJobseekerTransactions();
      setTransactions(res?.data || []);
      window.dispatchEvent(new Event('vietworks:wallet-updated'));
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDeposits = transactions
    .filter((tx) => tx.type === 'WALLET_DEPOSIT' && tx.status === 'SUCCESS')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = transactions
    .filter((tx) => tx.type !== 'WALLET_DEPOSIT' && tx.type !== 'REFUND' && tx.status === 'SUCCESS')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    try {
      const res = await createJobseekerDeposit(Number(depositAmount));
      if (res.success) setDepositData(res.data);
    } catch (err) {
      console.error('Deposit error:', err);
      const message = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      showNotification({ type: 'error', message });
    }
  };

  const handleCloseModal = () => {
    setShowDepositModal(false);
    setDepositAmount('');
    setDepositData(null);
  };

  useSepayPolling(depositData?.orderCode, {
    enabled: !!depositData?.orderCode,
    onPaid: () => {
      showNotification({ type: 'success', message: 'Nạp tiền thành công! Số dư đã được cập nhật.' });
      fetchWallet();
      fetchTransactions();
      handleCloseModal();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
          notification.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
          'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          <p className="font-bold">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Ví của tôi
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Nạp tiền để mua gói Boost CV hoặc AI Premium</p>
        </div>
        <button
          onClick={() => setShowDepositModal(true)}
          className="bg-[#0056b3] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2"
        >
          <FiCreditCard className="text-[18px]" />
          Nạp tiền
        </button>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-400/20 blur-3xl -z-10 rounded-full" />
          <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 p-8 rounded-3xl text-white relative overflow-hidden premium-shadow border border-slate-700/50 hover-3d transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-9 bg-gradient-to-br from-indigo-200 to-indigo-500 rounded-md opacity-80 shadow-inner" />
                <span className="font-bold text-slate-300 tracking-widest uppercase">VietWorks Personal</span>
              </div>

              <div className="mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Số dư khả dụng</span>
                <p className="text-5xl font-black tracking-tight drop-shadow-lg">
                  {wallet ? formatPrice(wallet.balance) : '0 đ'}
                </p>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng nạp</p>
                  <p className="text-lg font-bold text-emerald-400">{formatPrice(totalDeposits)}</p>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng chi</p>
                  <p className="text-lg font-bold text-slate-200">{formatPrice(totalSpent)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/50 premium-shadow">
            <h3 className="font-bold text-slate-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Link to="/premium" className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all text-left">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FiZap />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Mua gói Boost CV</p>
                  <p className="text-xs text-slate-500">Ưu tiên hiển thị cho NTD</p>
                </div>
              </Link>
              <Link to="/my-subscriptions" className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all text-left">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  <FiCreditCard />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Gói đang dùng</p>
                  <p className="text-xs text-slate-500">Xem hạn sử dụng</p>
                </div>
              </Link>
              <Link to="/my-transactions" className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all text-left">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FiTrendingUp />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Lịch sử chi tiết</p>
                  <p className="text-xs text-slate-500">Tất cả giao dịch</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <FiCreditCard />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Yêu cầu xuất hóa đơn</p>
                  <p className="text-xs text-slate-500">VAT cho gói Boost CV</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Lịch sử giao dịch gần đây</h3>
          <Link to="/my-transactions" className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium">Chưa có giao dịch nào</p>
            <p className="text-sm mt-1">Bấm "Nạp tiền" để bắt đầu</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Loại</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Số tiền</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Mô tả</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => {
                const type = typeConfig[tx.type] || typeConfig.PACKAGE_PURCHASE;
                const status = statusConfig[tx.status] || statusConfig.PENDING;
                return (
                  <tr key={tx._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${type.bg} ${type.text}`}>
                        {type.icon} {type.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-black ${tx.type === 'WALLET_DEPOSIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'WALLET_DEPOSIT' ? '+' : '-'}{formatPrice(Math.abs(tx.amount))}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{tx.description}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Deposit Modal - SePay */}
      {showDepositModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={handleCloseModal} />
          <div className="fixed inset-0 md:inset-auto md:top-0 md:right-0 md:h-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FiCreditCard className="text-[24px]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nạp tiền qua SePay</h2>
                  <p className="text-sm text-slate-500">Quét QR hoặc chuyển khoản</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {!depositData ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Số tiền nạp (VND)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-xl font-bold"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[500000, 1000000, 2000000, 5000000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          Number(depositAmount) === amount
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        {formatPrice(amount)}
                      </button>
                    ))}
                  </div>
                  {depositAmount && Number(depositAmount) > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500">Số tiền nạp</p>
                      <p className="text-2xl font-black text-emerald-600">{formatPrice(Number(depositAmount))}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || Number(depositAmount) <= 0}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      Tạo mã QR thanh toán
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 rounded-xl font-bold border border-slate-300 hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Quét mã QR để thanh toán</h3>
                  <p className="text-sm text-slate-500 mb-4">Mở app ngân hàng và quét mã bên dưới</p>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-4">
                    <img src={depositData.qrUrl} alt="QR" className="w-48 h-48 mx-auto" />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Số tiền:</span>
                      <span className="font-black text-emerald-600">{formatPrice(depositData.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-bold">{depositData.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">STK:</span>
                      <span className="font-bold">{depositData.bankAccount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Nội dung CK:</span>
                      <span className="font-black text-indigo-600">{depositData.transferContent}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đang chờ xác nhận thanh toán tự động...
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200"
                  >
                    Đóng (tự động cập nhật khi nhận được CK)
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Request Invoice Modal — chọn giao dịch PACKAGE_PURCHASE SUCCESS để xuất HĐ */}
      <RequestInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        transactions={transactions}
      />
    </div>
  );
};

export default JobseekerWallet;