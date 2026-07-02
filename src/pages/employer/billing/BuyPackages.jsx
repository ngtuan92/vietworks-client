import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import useSepayPolling from '../../../hooks/useSepayPolling';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

const BuyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [buyModal, setBuyModal] = useState(null);   // gói đang mua
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState(null); // dữ liệu sau khi mua thành công
  const [paymentMethod, setPaymentMethod] = useState('SEPAY'); // 'SEPAY' | 'WALLET'
  const [qrData, setQrData] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');

  useEffect(() => {
    fetchPackages();
    fetchWallet();
    fetchJobs();
  }, []);

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

  const confirmBuy = async () => {
    if (!buyModal) return;
    if (buyModal.packageType === 'PREMIUM_JOB' && !selectedJobId) {
      return alert('Vui lòng chọn tin đăng để áp dụng gói');
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
      } else {
        res = await api.post('/employer/cv-unlock/purchase', { 
          packageId: buyModal._id,
          paymentMethod 
        });
      }
      
      if (res.data.success) {
        if (paymentMethod === 'WALLET') {
          setBuyResult({
            ...res.data.data,
            isPremiumJob: buyModal.packageType === 'PREMIUM_JOB'
          });
          setWalletBalance(res.data.data.newBalance);
          window.dispatchEvent(new Event('vietworks:wallet-updated'));
        } else {
          setQrData(res.data.data);
        }
      }
    } catch (e) {
      const err = e.response?.data;
      alert(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
    }
  });

  // CHỈ hiển thị gói dành cho nhà tuyển dụng (loại gói Boost CV của ứng viên).
  // Thứ tự: Mở khóa CV (lẻ) → Combo 50/100 → Tin nổi bật.
  const PACKAGE_ORDER = ['CV_UNLOCK', 'CV_UNLOCK_BUNDLE', 'PREMIUM_JOB'];
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gói dịch vụ</h1>
          <p className="text-slate-600 mt-1">
            Mở khóa hồ sơ ứng viên hoặc đẩy tin tuyển dụng nổi bật. Số dư ví:{' '}
            <b className="text-[#003f87]">{formatPrice(walletBalance)}</b>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/employer/wallet/topup" className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Nạp tiền
          </Link>
          <Link to="/employer/my-subscriptions" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Gói của tôi
          </Link>
        </div>
      </div>

      {sortedPackages.length > 0 ? (
        <div className="flex flex-nowrap gap-3 items-stretch overflow-x-auto pb-2 -mx-1 px-1">
          {sortedPackages.map((pkg) => (
            <div key={pkg._id} className="flex-1 min-w-[200px] max-w-[280px]">
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

      {/* Modal mua gói mở khóa CV bằng ví */}
      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`bg-white rounded-2xl shadow-2xl w-full transition-all duration-300 ${qrData ? 'max-w-xl' : 'max-w-md'}`}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {buyResult ? 'Mua gói thành công' : 'Xác nhận mua gói'}
              </h2>
              <button onClick={closeBuy} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {buyResult ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-4">Đã kích hoạt!</h3>
                  <p className="text-slate-600 mt-2 text-sm">
                    {buyResult.isPremiumJob ? (
                      <>Gói <b>{buyModal.name}</b> đã được áp dụng thành công cho tin đăng.</>
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
                    <Link to="/employer/talent-pool" className="flex-1 py-2.5 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] text-center">Tìm ứng viên</Link>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-500">Bạn đang mua</p>
                  <h3 className="text-lg font-bold text-slate-900">{buyModal.name}</h3>

                  {buyModal.packageType === 'PREMIUM_JOB' && !qrData && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn tin đăng áp dụng</label>
                      <select
                        value={selectedJobId}
                        onChange={(e) => setSelectedJobId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        {jobs.map(job => (
                          <option key={job._id} value={job._id}>{job.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!qrData && (
                    <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Giá:</span><span className="font-black text-[#003f87]">{formatPrice(buyModal.price)}</span></div>
                      {buyModal.benefits?.cvAccessLimit > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Số lượt mở khóa:</span><span className="font-bold text-slate-900">{buyModal.benefits.cvAccessLimit} CV</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-slate-500">Số dư ví:</span><span className="font-bold text-slate-900">{formatPrice(walletBalance)}</span></div>
                    </div>
                  )}

                  {!qrData ? (
                    <>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('SEPAY')}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === 'SEPAY'
                              ? 'border-[#003f87] bg-blue-50/50'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="font-bold text-slate-900 mb-1">Mã QR</div>
                          <div className="text-xs text-slate-500">Quét mã thanh toán</div>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('WALLET')}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === 'WALLET'
                              ? 'border-[#003f87] bg-blue-50/50'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
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
                          onClick={confirmBuy}
                          disabled={buying}
                          className="mt-5 w-full py-3 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] transition-all disabled:opacity-50"
                        >
                          {buying ? 'Đang xử lý...' : `Thanh toán ${formatPrice(buyModal.price)}`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="mt-5">
                      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <div className="flex-shrink-0 text-center sm:w-48">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                            <img src={qrData.qrUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
                          </div>
                          <p className="mt-3 text-xs text-slate-500 font-medium">Sử dụng App ngân hàng quét mã</p>
                        </div>
                        
                        <div className="flex-1 p-5 bg-slate-50 rounded-xl border border-slate-100 text-left text-sm space-y-3 w-full">
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <span className="text-slate-500 text-xs">Ngân hàng:</span>
                            <span className="font-semibold text-slate-900">{qrData.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <span className="text-slate-500 text-xs">Số tài khoản:</span>
                            <span className="font-semibold text-slate-900">{qrData.bankAccount}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <span className="text-slate-500 text-xs">Chủ tài khoản:</span>
                            <span className="font-semibold text-slate-900 text-right uppercase">{qrData.bankOwner}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <span className="text-slate-500 text-xs">Số tiền:</span>
                            <span className="font-bold text-emerald-600 text-base">{formatPrice(qrData.amount)}</span>
                          </div>
                          <div className="flex flex-col pt-1">
                            <span className="text-slate-500 text-xs mb-1.5">Nội dung chuyển khoản:</span>
                            <span className="font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-3 py-2 rounded-lg text-center break-all select-all text-base tracking-wider">{qrData.transferContent}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/60 shadow-sm">
                        <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                        Hệ thống đang chờ thanh toán...
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const categoryConfig = {
  CV_UNLOCK:        { label: 'Mở khóa CV (lẻ)',    tone: 'bg-slate-100 text-slate-700' },
  CV_UNLOCK_BUNDLE: { label: 'Gói mở khóa CV',    tone: 'bg-indigo-100 text-indigo-700' },
  PREMIUM_JOB:      { label: 'Tin nổi bật + Gấp',  tone: 'bg-amber-100 text-amber-700' },
};

const PackageCard = ({ pkg, price, isFeatured, onBuy }) => {
  const cat = categoryConfig[pkg.packageType] || { label: pkg.packageType, tone: 'bg-slate-100 text-slate-700' };
  const durationLabel = pkg.durationDays ? `${pkg.durationDays} ngày` : 'Theo lượt dùng';

  return (
    <div className={`bg-white rounded-2xl p-4 flex flex-col h-full border transition-all hover:shadow-md ${
      isFeatured ? 'border-[#003f87] ring-1 ring-[#003f87]/30 shadow-sm' : 'border-slate-200'
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

