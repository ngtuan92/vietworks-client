import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import useSepayPolling from '../../../hooks/useSepayPolling';
import Toast from '../../../components/shared/Toast';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

const BuyPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [buying, setBuying] = useState(false);
  const [buyModal, setBuyModal] = useState(null); // Gói đang chọn mua
  const [buyResult, setBuyResult] = useState(null); // dữ liệu sau khi mua thành công
  const [paymentMethod, setPaymentMethod] = useState('SEPAY'); // 'SEPAY' | 'WALLET'
  const [qrData, setQrData] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [upgradeInfo, setUpgradeInfo] = useState(null); // thông tin popup nâng cấp tin nổi bật

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [cvCredits, setCvCredits] = useState(0);

  useEffect(() => {
    fetchPackages();
    fetchWallet();
    fetchJobs();
    fetchCvCredits();
  }, []);

  const fetchCvCredits = async () => {
    try {
      const res = await api.get('/employer/cv-unlock/credits');
      if (res.data.success) {
        const total = res.data.data.reduce((sum, bag) => sum + bag.remainingCredits, 0);
        setCvCredits(total);
      }
    } catch { /* ignore */ }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/packages', { params: { isActive: true } });
      if (res.data.success) setPackages(res.data.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get('/employer/wallet');
      if (res.data.success) setWalletBalance(res.data.data?.balance || 0);
    } catch { /* ignore */ }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/employer/jobs', { params: { status: 'PUBLISHED' } });
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch { /* ignore */ }
  };

  const openBuy = (pkg) => {
    setBuyModal(pkg);
    setBuyResult(null);
    setQrData(null);
    setPaymentMethod('SEPAY');
    setSelectedJobId(jobs[0]?._id || '');
  };
  const closeBuy = () => { setBuyModal(null); setBuyResult(null); setQrData(null); };

  const confirmBuy = async (mode = 'new') => {
    if (!buyModal) return;
    if (buyModal.packageType === 'PREMIUM_JOB' && !selectedJobId) {
      return setToastMsg('Vui lòng chọn tin đăng để áp dụng gói');
    }
    
    setBuying(true);
    try {
      let res;
      if (buyModal.packageType === 'PREMIUM_JOB') {
        res = await api.post(`/employer/jobs/${selectedJobId}/boost/payment`, {
          packageId: buyModal._id,
          action: 'new',
          paymentMethod
        });
      } else if (buyModal.packageType === 'CV_UNLOCK') {
        res = await api.post('/employer/cv-unlock/purchase', {
          packageId: buyModal._id,
          action: 'new',
          paymentMethod
        });
      }

      if (res?.data?.success) {
        // Upgrade luôn instant qua ví; mua mới thì tuỳ paymentMethod
        if (paymentMethod === 'WALLET') {
          setBuyResult({
            ...res.data.data,
            isPremiumJob: buyModal.packageType === 'PREMIUM_JOB'
          });
          setWalletBalance(res.data.data.newBalance);
          window.dispatchEvent(new Event('vietworks:wallet-updated'));
          if (buyModal.packageType === 'CV_UNLOCK') {
            fetchCvCredits();
          }
        } else {
          setQrData(res.data.data);
        }
      }
    } catch (e) {
      const err = e.response?.data;
      if (err?.code === 'ALREADY_HAS_ACTIVE_PACKAGE' && buyModal.packageType === 'PREMIUM_JOB') {
        setUpgradeInfo({
          ...err.data, // currentPackage, newPackageName, remainingValue, upgradePrice, downgrade
          packageId: buyModal._id,
          jobId: selectedJobId
        });
      } else if (err?.code === 'DOWNGRADE_NOT_ALLOWED') {
        setToastMsg(err.message || 'Gói mới phải có giá trị cao hơn gói hiện tại.');
      } else {
        setToastMsg(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setBuying(false);
    }
  };

  const confirmJobUpgrade = async () => {
    setBuying(true);
    try {
      const res = await api.post(`/employer/jobs/${upgradeInfo.jobId}/boost/payment`, {
        packageId: upgradeInfo.packageId,
        action: 'upgrade',
        paymentMethod
      });
      if (res.data.success) {
        if (paymentMethod === 'WALLET') {
          setBuyResult({
            ...res.data.data,
            isPremiumJob: true,
            method: 'WALLET'
          });
          setWalletBalance(res.data.data.newBalance);
          window.dispatchEvent(new Event('vietworks:wallet-updated'));
          setUpgradeInfo(null);
          setBuyModal(null);
        } else {
          setQrData(res.data.data);
          setUpgradeInfo(null);
        }
      }
    } catch (e) {
      const errData = e.response?.data;
      if (errData?.code === 'INSUFFICIENT_BALANCE') {
        setToastMsg(errData.message || 'Số dư ví không đủ.');
        setPaymentMethod('SEPAY');
      } else {
        setToastMsg(errData?.message || 'Lỗi khi nâng cấp');
      }
    } finally {
      setBuying(false);
    }
  };

  useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: () => {
      setBuyResult({
        amount: qrData.amount,
        newBalance: walletBalance,
        creditsGranted: buyModal.benefits?.cvAccessLimit || 1,
        method: 'SEPAY',
        isPremiumJob: buyModal.packageType === 'PREMIUM_JOB'
      });
      setQrData(null);
      if (buyModal?.packageType === 'CV_UNLOCK') {
        fetchCvCredits();
      }
    }
  });

  // CHỈ hiển thị gói dành cho nhà tuyển dụng
  // Thứ tự: Tin nổi bật, Mở khóa CV.
  const PACKAGE_ORDER = ['PREMIUM_JOB', 'CV_UNLOCK'];
  const sortedPackages = packages
    .filter((p) => PACKAGE_ORDER.includes(p.packageType))
    .sort((a, b) => PACKAGE_ORDER.indexOf(a.packageType) - PACKAGE_ORDER.indexOf(b.packageType));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6 mt-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gói dịch vụ</h1>
          <p className="text-sm text-slate-500 mt-1">Đẩy tin tuyển dụng của bạn lên vị trí nổi bật, tiếp cận ứng viên tiềm năng nhanh chóng.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/employer/wallet/topup" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold text-sm hover:bg-[#0b4e9f] whitespace-nowrap">
            Nạp tiền (Số dư: {formatPrice(walletBalance)})
          </Link>
          <Link to="/employer/my-subscriptions" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-sm hover:bg-slate-50 whitespace-nowrap">
            Gói của tôi
          </Link>
        </div>
      </div>

      {sortedPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch pb-2">
          {sortedPackages.map((pkg) => (
            <div key={pkg._id} className="w-full">
              <PackageCard
                pkg={pkg}
                price={formatPrice(pkg.price)}
                isFeatured={pkg.packageType === 'PREMIUM_JOB'}
                onBuy={openBuy}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <span className="material-symbols-outlined text-[60px] text-slate-300">inventory_2</span>
          <p className="text-slate-500 mt-3 font-medium">Hiện chưa có gói dịch vụ nào</p>
        </div>
      )}

      {/* Modal xác nhận mua gói */}
      {buyModal && !qrData && !buyResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Xác nhận mua gói
              </h2>
              <button onClick={closeBuy} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {(() => {
                return (
                    <>
                      <p className="text-sm text-slate-500">Bạn đang mua</p>
                      <h3 className="text-lg font-bold text-slate-900">{buyModal.name}</h3>

                      {/* Chọn tin đăng áp dụng */}
                      {!qrData && buyModal.packageType === 'PREMIUM_JOB' && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn tin đăng áp dụng</label>
                          <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          >
                            {jobs.map((job) => (
                              <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {!qrData && (
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Giá:</span><span className="font-black text-[#003f87]">{formatPrice(buyModal.price)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Số dư ví:</span><span className="font-bold text-slate-900">{formatPrice(walletBalance)}</span></div>
                          {buyModal.packageType === 'CV_UNLOCK' && (
                            <>
                              <div className="my-2 border-t border-slate-200"></div>
                              <div className="flex justify-between"><span className="text-slate-500">Số CV đang có:</span><span className="font-bold text-slate-900">{cvCredits} lượt</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Tổng sau khi mua:</span><span className="font-bold text-emerald-600">{cvCredits + (buyModal.benefits?.cvAccessLimit || 0)} lượt</span></div>
                            </>
                          )}
                        </div>
                      )}

                      {!qrData && (
                        <>
                          {/* Chọn phương thức thanh toán cho MUA MỚI */}
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setPaymentMethod('SEPAY')}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                paymentMethod === 'SEPAY' ? 'border-[#003f87] bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                              }`}
                            >
                              <div className="font-bold text-slate-900 mb-1">Mã QR</div>
                              <div className="text-xs text-slate-500">Quét mã thanh toán</div>
                            </button>
                            <button
                              onClick={() => setPaymentMethod('WALLET')}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                paymentMethod === 'WALLET' ? 'border-[#003f87] bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                              }`}
                            >
                              <div className="font-bold text-slate-900 mb-1">Ví nội bộ</div>
                              <div className="text-xs text-slate-500">Trừ trực tiếp</div>
                            </button>
                          </div>

                          {paymentMethod === 'WALLET' && walletBalance < buyModal.price ? (
                            <div className="mt-5">
                              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mb-3">
                                Số dư ví không đủ (thiếu {formatPrice(buyModal.price - walletBalance)}).
                              </div>
                              <Link to="/employer/wallet/topup" className="block w-full py-3 rounded-xl bg-[#003f87] text-white font-bold text-center hover:bg-[#0b4e9f]">
                                Nạp thêm tiền
                              </Link>
                            </div>
                          ) : (
                            <button
                              onClick={() => confirmBuy('new')}
                              disabled={buying}
                              className="mt-5 w-full py-3 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] transition-all disabled:opacity-50"
                            >
                              {buying ? 'Đang xử lý...' : `Thanh toán ${formatPrice(buyModal.price)}`}
                            </button>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR SePay nổi */}
      {qrData && !buyResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">qr_code</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quét mã QR thanh toán</h2>
                  <p className="text-sm text-slate-500">Thanh toán qua SePay</p>
                </div>
              </div>
              <button onClick={() => setQrData(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 text-center">
              {buyModal && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left mb-5 text-sm">
                  <div className="font-bold text-[#003f87]">Gói đang mua: {buyModal.name}</div>
                  {buyModal.packageType === 'PREMIUM_JOB' && selectedJobId && (
                    <div className="text-slate-600 mt-1">
                      Áp dụng cho Job: <span className="font-semibold text-slate-900">{jobs.find(j => j._id === selectedJobId)?.title || 'Chưa xác định'}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-4">
                <img src={qrData.qrUrl} alt="QR" className="w-48 h-48 mx-auto" />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Số tiền:</span><span className="font-black text-emerald-600">{formatPrice(qrData.amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ngân hàng:</span><span className="font-bold text-slate-900">{qrData.bankName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Số TK:</span><span className="font-bold text-slate-900">{qrData.bankAccount}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Chủ tài khoản:</span><span className="font-bold text-slate-900 uppercase">{qrData.bankOwner}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Nội dung CK:</span><span className="font-black text-[#003f87]">{qrData.transferContent}</span></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="w-4 h-4 border-2 border-[#003f87] border-t-transparent rounded-full animate-spin" />
                Hệ thống đang chờ thanh toán...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal mua gói thành công */}
      {buyResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Mua gói thành công</h2>
              <button onClick={closeBuy} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-4">Đã kích hoạt!</h3>
              <p className="text-slate-600 mt-2 text-sm">
                {buyResult.isPremiumJob ? (
                  <>Gói tin nổi bật đã được áp dụng thành công cho tin đăng.</>
                ) : (
                  <>Bạn được cộng <b className="text-emerald-600">{buyResult.creditsGranted} lượt mở khóa CV</b>. Dùng ngay ở mục Tìm ứng viên.</>
                )}
              </p>
              <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm text-left">
                <div className="flex justify-between"><span className="text-slate-500">Đã thanh toán:</span><span className="font-bold text-slate-900">{formatPrice(buyResult.amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phương thức:</span><span className="font-bold text-slate-900">{buyResult.method === 'SEPAY' ? 'Mã QR (SePay)' : 'Ví VietWorks'}</span></div>
                {buyResult.method === 'WALLET' && (
                  <div className="flex justify-between"><span className="text-slate-500">Số dư còn lại:</span><span className="font-bold text-emerald-600">{formatPrice(buyResult.newBalance)}</span></div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={closeBuy} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">Đóng</button>
                <Link to={buyResult.isPremiumJob ? "/employer/jobs" : "/employer/talent-pool"} className="flex-1 py-2.5 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] text-center">
                  {buyResult.isPremiumJob ? 'Xem tin đăng' : 'Tìm ứng viên'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận upgrade tin nổi bật */}
      {upgradeInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${upgradeInfo.downgrade ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <span className="material-symbols-outlined text-3xl">{upgradeInfo.downgrade ? 'block' : 'upgrade'}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-4">
                {upgradeInfo.downgrade ? 'Không thể nâng cấp' : 'Xác nhận nâng cấp'}
              </h2>
              <p className="text-slate-600 mt-2 text-sm">
                Tin đăng này đang dùng gói <b className="text-slate-900">{upgradeInfo.currentPackage?.name}</b>
                {upgradeInfo.currentPackage?.daysRemaining != null && (
                  <> (còn <b>{upgradeInfo.currentPackage.daysRemaining}</b> ngày).</>
                )}
              </p>
            </div>

            {!upgradeInfo.downgrade ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Chi tiết nâng cấp</p>
                <div className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Giá gói mới ({upgradeInfo.newPackageName})</span>
                    <span className="font-bold text-slate-900">{formatPrice(upgradeInfo.upgradePrice + (upgradeInfo.currentPackage?.remainingValue || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">− Giá trị còn lại của gói cũ</span>
                    <span className="font-bold text-emerald-700">−{formatPrice(upgradeInfo.currentPackage?.remainingValue || 0)}</span>
                  </div>
                  <div className="my-2 border-t border-emerald-200"></div>
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-slate-900">Phải trả thêm</span>
                    <span className="font-black text-emerald-700">{formatPrice(upgradeInfo.upgradePrice)}</span>
                  </div>
                </div>
                <p className="mt-3 rounded-xl bg-white/70 p-2 text-[11px] font-semibold text-slate-600 text-left">
                  ⓘ Công thức: giá trị còn lại = giá gốc × (số ngày còn / tổng ngày). Phần thời gian chưa dùng hết được tính theo ngày.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 text-left">
                <p className="font-bold">Lý do:</p>
                <p className="mt-1">
                  Gói hiện tại còn giá trị <b>{formatPrice(upgradeInfo.currentPackage?.remainingValue || 0)}</b>,
                  cao hơn giá gói mới <b>{formatPrice(upgradeInfo.newPackage?.price || 0)}</b>.
                  Bạn không thể nâng cấp lên gói rẻ hơn khi gói cũ còn hạn.
                </p>
                <p className="mt-2 text-xs">Vui lòng chọn gói có giá cao hơn hoặc đợi gói hiện tại hết hạn.</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUpgradeInfo(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Huỷ
              </button>
              {!upgradeInfo.downgrade && (
                <button
                  onClick={confirmJobUpgrade}
                  disabled={buying || (paymentMethod === 'WALLET' && walletBalance < upgradeInfo.upgradePrice)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {buying ? 'Đang xử lý...' : 'Nâng cấp'}
                </button>
              )}
            </div>
            {!upgradeInfo.downgrade && paymentMethod === 'WALLET' && walletBalance < upgradeInfo.upgradePrice && (
              <p className="text-center text-xs text-rose-600 mt-3">
                Số dư không đủ. Vui lòng nạp thêm tiền.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const categoryConfig = {
  PREMIUM_JOB:      { label: 'Tin nổi bật + Gấp',  tone: 'bg-amber-100 text-amber-700' },
  CV_UNLOCK:        { label: 'Mở khóa CV', tone: 'bg-emerald-100 text-emerald-700' },
};

const PackageCard = ({ pkg, price, isFeatured, onBuy }) => {
  const cat = categoryConfig[pkg.packageType] || { label: pkg.packageType, tone: 'bg-slate-100 text-slate-700' };
  const durationLabel = pkg.durationDays ? `${pkg.durationDays} ngày` : 'Theo lượt dùng';

  return (
    <div className={`bg-white rounded-2xl p-4 flex flex-col h-full border-2 transition-all hover:shadow-md ${
      isFeatured ? 'border-[#003f87] shadow-sm' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.tone} truncate`}>{cat.label}</span>
        {isFeatured && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#003f87] text-white uppercase tracking-wider shrink-0">Hot</span>
        )}
      </div>

      <h3 className="text-base font-bold text-slate-900 line-clamp-2 min-h-[44px]">{pkg.name}</h3>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{pkg.description}</p>

      <div className="mt-3 mb-0"><span className="text-xl font-black text-[#003f87]">{price}</span></div>
      <p className="text-[11px] text-slate-500">/ {durationLabel}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600 flex-1">
        {(pkg.benefits?.cvAccessLimit > 0) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Mở khóa {pkg.benefits.cvAccessLimit} hồ sơ</span>
          </li>
        )}
        {(pkg.benefits?.featuredDays > 0) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Đẩy tin lên top {pkg.benefits.featuredDays} ngày</span>
          </li>
        )}
        {(pkg.benefits?.priorityDisplay) && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Gắn nhãn ưu tiên</span>
          </li>
        )}
        {pkg.durationDays > 0 && (
          <li className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
            <span className="leading-snug">Hạn {pkg.durationDays} ngày</span>
          </li>
        )}
      </ul>

      {isFeatured ? (
        <button
          onClick={() => onBuy(pkg)}
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold text-center bg-[#003f87] text-white hover:bg-[#0b4e9f] transition-all"
        >
          Mua gói
        </button>
      ) : (
        <button
          onClick={() => onBuy(pkg)}
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold text-center border border-[#003f87] text-[#003f87] hover:bg-blue-50 transition-all"
        >
          Mua ngay
        </button>
      )}
    </div>
  );
};

export default BuyPackages;

