import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import RequestInvoiceModal from '../../../components/employer/billing/RequestInvoiceModal';

// Tooltip mô tả chi tiết cho từng transaction (hiện khi hover badge status).
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

const typeConfig = {
  WALLET_DEPOSIT:       { label: 'Nạp tiền',       bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'add_card' },
  PACKAGE_PURCHASE:     { label: 'Mua gói',         bg: 'bg-indigo-100',  text: 'text-indigo-700',  icon: 'payments' },
  CV_UNLOCK_SINGLE:     { label: 'Mở khóa CV',      bg: 'bg-violet-100',  text: 'text-violet-700',  icon: 'lock_open' },
  CV_UNLOCK_BY_PACKAGE: { label: 'Mở khóa CV (gói)', bg: 'bg-violet-100', text: 'text-violet-700',  icon: 'lock_open' },
  REFUND:               { label: 'Hoàn tiền',       bg: 'bg-amber-100',   text: 'text-amber-700',   icon: 'replay' },
  ADMIN_ADJUSTMENT:     { label: 'Điều chỉnh',      bg: 'bg-slate-100',   text: 'text-slate-700',   icon: 'tune' },
};

const statusConfig = {
  SUCCESS: { label: 'Thành công', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING: { label: 'Đang chờ', bg: 'bg-amber-100', text: 'text-amber-700' },
  FAILED: { label: 'Thất bại', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const EmployerWallet = () => {
  const navigate = useNavigate();
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

  // Hiện notification tự ẩn sau 4s
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
      const res = await api.get('/employer/wallet');
      if (res.data.success) {
        setWallet(res.data.data);
        // Báo cho header (và các nơi khác) biết balance vừa đổi
        window.dispatchEvent(new Event('vietworks:wallet-updated'));
      }
    } catch (error) {
      console.error('Fetch wallet error:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/employer/transactions');
      if (res.data.success) setTransactions(res.data.data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
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
      const res = await api.post('/employer/wallet/deposit',
        { amount: Number(depositAmount) }
      );
      if (res.data.success) {
        setDepositData(res.data.data);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      const message = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      showNotification({ type: 'error', message });
    }
  };

  const handleCloseModal = () => {
    setShowDepositModal(false);
    setDepositAmount('');
    setDepositData(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in ${
          notification.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
          'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          <span className="material-symbols-outlined">
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <p className="font-bold">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Ví của tôi
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Quản lý số dư và giao dịch</p>
        </div>
        <Link
          to="/employer/wallet/topup"
          className="bg-[#0056b3] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          Nạp tiền
        </Link>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-400/20 blur-3xl -z-10 rounded-full" />
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-3xl text-white relative overflow-hidden premium-shadow border border-slate-700/50 hover-3d transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-9 bg-gradient-to-br from-amber-200 to-amber-500 rounded-md opacity-80 shadow-inner" />
                <span className="font-bold text-slate-300 tracking-widest uppercase">VietWorks Business</span>
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
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng tiêu</p>
                  <p className="text-lg font-bold text-slate-200">{formatPrice(totalSpent)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
            <h3 className="font-bold text-[#1b1c1c] mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/employer/packages')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f5f3f3] hover:bg-[#0056b3]/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">shopping_cart</span>
                </div>
                <div>
                  <p className="font-bold text-[#1b1c1c]">Mua gói dịch vụ</p>
                  <p className="text-xs text-[#5e5e62]">Chọn gói phù hợp</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => navigate('/employer/transactions')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f5f3f3] hover:bg-[#0056b3]/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600">history</span>
                </div>
                <div>
                  <p className="font-bold text-[#1b1c1c]">Lịch sử giao dịch</p>
                  <p className="text-xs text-[#5e5e62]">Xem chi tiết</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f5f3f3] hover:bg-[#0056b3]/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">receipt_long</span>
                </div>
                <div>
                  <p className="font-bold text-[#1b1c1c]">Yêu cầu xuất hóa đơn</p>
                  <p className="text-xs text-[#5e5e62]">VAT, hóa đơn điện tử</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-[#c2c6d4]/50 overflow-hidden">
        <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
          <h3 className="font-bold text-[#1b1c1c]">Lịch sử giao dịch</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3f3] border-b border-[#c2c6d4]">
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Loại</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Số tiền</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Mô tả</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Trạng thái</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const type = typeConfig[tx.type] || typeConfig.PACKAGE_PURCHASE;
              const status = statusConfig[tx.status] || statusConfig.PENDING;
              return (
                <tr key={tx._id} className="border-b border-[#c2c6d4]/30 hover:bg-[#f5f3f3]/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${type.bg} ${type.text}`}>
                      <span className="material-symbols-outlined text-[14px]">{type.icon}</span>
                      {type.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-black ${tx.type === 'WALLET_DEPOSIT' ? 'text-emerald-600' : 'text-[#1b1c1c]'}`}>
                      {tx.type === 'WALLET_DEPOSIT' ? '+' : '-'}{formatPrice(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#5e5e62]">{tx.description}</td>
                  <td className="py-4 px-4">
                    <span
                      title={describeTransaction(tx)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-help ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#5e5e62]">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deposit Drawer - SePay Checkout */}
      {showDepositModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={handleCloseModal} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px]">add_card</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1b1c1c]">Nạp tiền qua SePay</h2>
                  <p className="text-sm text-[#5e5e62]">Thanh toán qua cổng SePay</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-[#f5f3f3] rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {!depositData ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[#5e5e62] mb-1">Số tiền nạp (VND)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none text-xl font-bold"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[500000, 1000000, 2000000, 5000000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                          Number(depositAmount) === amount
                            ? 'bg-[#0056b3] text-white'
                            : 'bg-[#f5f3f3] text-[#5e5e62] hover:bg-[#0056b3]/10'
                        }`}
                      >
                        {formatPrice(amount)}
                      </button>
                    ))}
                  </div>
                  {depositAmount && (
                    <div className="bg-[#f5f3f3] rounded-xl p-4">
                      <p className="text-xs text-[#5e5e62]">Số tiền nạp</p>
                      <p className="text-2xl font-black text-emerald-600">{formatPrice(Number(depositAmount))}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || Number(depositAmount) <= 0}
                      className="flex-1 bg-[#0056b3] text-white py-3 rounded-xl font-bold hover:bg-[#0056b3]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tiếp tục thanh toán
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-emerald-600 text-[32px]">qr_code</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-2">Quét mã QR để thanh toán</h3>
                  <p className="text-sm text-[#5e5e62] mb-4">Sử dụng app ngân hàng quét mã bên dưới</p>

                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-xl border border-[#c2c6d4] inline-block mb-4">
                    <img src={depositData.qrUrl} alt="QR Thanh toán" className="w-48 h-48 mx-auto" />
                  </div>

                  {/* Transfer details */}
                  <div className="bg-[#f5f3f3] rounded-xl p-4 text-left space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5e5e62]">Số tiền:</span>
                      <span className="font-black text-emerald-600">{formatPrice(depositData.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5e5e62]">Ngân hàng:</span>
                      <span className="font-bold text-[#1b1c1c]">{depositData.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5e5e62]">Số tài khoản:</span>
                      <span className="font-bold text-[#1b1c1c]">{depositData.bankAccount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5e5e62]">Nội dung CK:</span>
                      <span className="font-black text-[#0056b3]">{depositData.transferContent}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#5e5e62] mb-4">
                    Hệ thống sẽ tự động cộng tiền vào ví khi nhận được thanh toán
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      Đã thanh toán xong
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Request Invoice Modal */}
      <RequestInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        transactions={transactions}
      />
    </div>
  );
};

export default EmployerWallet;