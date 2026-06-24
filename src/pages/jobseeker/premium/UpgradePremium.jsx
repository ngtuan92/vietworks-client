import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { createBoostCvPayment, getBoostCvPackages } from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + 'đ';

// Quyền lợi BÁM theo benefits thật của từng gói (nên mỗi gói hiện khác nhau)
const boostFeatures = (pkg) => {
  const b = pkg.benefits || {};
  return [
    { ok: !!b.priorityDisplay, text: 'Đẩy CV lên TOP khi nhà tuyển dụng tìm kiếm' },
    { ok: !!b.priorityDisplay, text: `Ưu tiên hiển thị hồ sơ trong ${pkg.durationDays || 30} ngày` },
    { ok: !!b.aiPremiumAccess, text: 'AI phân tích & gợi ý tối ưu CV' },
    { ok: !!b.aiPremiumAccess, text: 'Mẫu CV cao cấp + huy hiệu nổi bật' },
  ];
};

const freeFeatures = [
  { ok: true, text: 'Tạo & lưu CV cơ bản' },
  { ok: true, text: 'Ứng tuyển không giới hạn' },
  { ok: false, text: 'Đẩy CV lên top tìm kiếm' },
  { ok: false, text: 'Ưu tiên hiển thị hồ sơ' },
];

const Check = ({ ok }) => (
  <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${ok ? 'text-emerald-500' : 'text-slate-300'}`}>
    {ok ? 'check_circle' : 'cancel'}
  </span>
);

const UpgradePremium = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyPkg, setBuyPkg] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [cvsLoaded, setCvsLoaded] = useState(false);
  const [selectedCv, setSelectedCv] = useState('');
  const [qrData, setQrData] = useState(null);
  const [paying, setPaying] = useState(false);
  // Upgrade confirm modal
  const [upgradeInfo, setUpgradeInfo] = useState(null); // { currentPackage, packageId, cvId } | null

  useEffect(() => {
    getBoostCvPackages()
      .then((data) => setPackages(data || []))
      .catch((e) => console.error('Fetch boost packages error:', e))
      .finally(() => setLoading(false));
  }, []);

  const openBuy = async (pkg) => {
    setBuyPkg(pkg); setSelectedCv(''); setQrData(null); setCvsLoaded(false);
    try {
      const r = await api.get('/jobseeker/cvs');
      setCvs(r.data?.data || []);
    } catch {
      setCvs([]);
    } finally {
      setCvsLoaded(true);
    }
  };

  const closeBuy = () => { setBuyPkg(null); setQrData(null); setSelectedCv(''); setUpgradeInfo(null); };

  const callPaymentApi = async (cvId, packageId, action = 'new') => {
    try {
      const r = await createBoostCvPayment(cvId, packageId, action);
      if (r.success) {
        setQrData(r.data);
        setUpgradeInfo(null);
      }
    } catch (e) {
      const errData = e.response?.data;
      if (errData?.code === 'ALREADY_HAS_ACTIVE_PACKAGE') {
        // Hiện modal xác nhận upgrade
        setUpgradeInfo({
          currentPackage: errData.data?.currentPackage,
          packageId,
          cvId
        });
      } else {
        alert(errData?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (!selectedCv) return;
    setPaying(true);
    await callPaymentApi(selectedCv, buyPkg._id, 'new');
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradeInfo) return;
    setPaying(true);
    await callPaymentApi(upgradeInfo.cvId, upgradeInfo.packageId, 'upgrade');
  };

  // Polling - khi paid: hiện ✓ trong modal rồi navigate sang Payment Success
  const { paid } = useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: (orderCode) => {
      setTimeout(() => {
        navigate(`/payment-success?orderCode=${orderCode}`);
      }, 1500);
    }
  });

  // Gói đắt nhất = "Phổ biến nhất" (giống TopCV nhấn Premium VIP)
  const popularId = packages.length ? packages.reduce((a, b) => (b.price > a.price ? b : a), packages[0])._id : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
          Tài khoản Premium
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-black text-slate-900">Đưa hồ sơ của bạn lên TOP</h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Nâng cấp để CV của bạn được ưu tiên hiển thị trước nhà tuyển dụng, tăng cơ hội được mời phỏng vấn.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {/* Free tier */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Miễn phí</h3>
            <p className="text-sm text-slate-500 mt-1">Dành cho người mới bắt đầu</p>
            <div className="mt-4 mb-5">
              <span className="text-3xl font-black text-slate-900">0đ</span>
            </div>
            <ul className="space-y-3 flex-1">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check ok={f.ok} /> {f.text}
                </li>
              ))}
            </ul>
            <button disabled className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 text-slate-400 font-semibold cursor-default">
              Đang sử dụng
            </button>
          </div>

          {/* Paid boost packages */}
          {packages.map((pkg) => {
            const popular = pkg._id === popularId;
            const isOwned = !!pkg.isOwned;
            const activeCount = pkg.activeCount || 0;
            const maxDaysRemaining = Array.isArray(pkg.activeSubscriptions) && pkg.activeSubscriptions.length
              ? Math.max(...pkg.activeSubscriptions.map(s => s.daysRemaining ?? 0))
              : null;
            return (
              <div
                key={pkg._id}
                className={`rounded-2xl p-6 flex flex-col relative ${
                  isOwned
                    ? 'border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/40 to-white shadow-lg shadow-emerald-100'
                    : popular
                    ? 'border-2 border-[#003f87] bg-gradient-to-b from-blue-50/50 to-white shadow-lg shadow-blue-100'
                    : 'border border-slate-200 bg-white'
                }`}
              >
                {isOwned ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[14px]"></span>
                    Đang sử dụng
                  </span>
                ) : popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#003f87] text-white text-xs font-bold uppercase tracking-wider">
                    Khuyên Dùng
                  </span>
                ) : null}
                <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[40px]">{pkg.description || 'Đẩy CV lên top hiển thị.'}</p>
                <div className="mt-4 mb-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#003f87]">{formatPrice(pkg.price)}</span>
                  <span className="text-sm text-slate-400">/ {pkg.durationDays || 7} ngày</span>
                </div>

                {isOwned && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm">
                    <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Bạn đang dùng gói này
                    </div>
                    {activeCount > 0 && (
                      <div className="text-emerald-600 text-xs mt-0.5">
                        Áp dụng cho <b>{activeCount}</b> CV
                      </div>
                    )}
                    {maxDaysRemaining !== null && (
                      <div className="text-emerald-600 text-xs mt-0.5">
                        Còn <b>{maxDaysRemaining}</b> ngày
                      </div>
                    )}
                  </div>
                )}

                <ul className="space-y-3 flex-1">
                  {boostFeatures(pkg).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check ok={f.ok} /> {f.text}
                    </li>
                  ))}
                </ul>
                {isOwned ? (
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Link
                      to="/my-subscriptions"
                      className="py-2.5 rounded-xl font-bold text-center bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-sm flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Xem gói
                    </Link>
                    <button
                      onClick={() => openBuy(pkg)}
                      className="py-2.5 rounded-xl font-bold text-[#003f87] border border-[#003f87] hover:bg-blue-50 transition-all text-sm"
                    >
                      Mua thêm
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openBuy(pkg)}
                    className={`mt-6 w-full py-2.5 rounded-xl font-bold transition-all ${
                      popular
                        ? 'bg-[#003f87] text-white hover:bg-[#0b4e9f] shadow-md shadow-blue-200'
                        : 'border border-[#003f87] text-[#003f87] hover:bg-blue-50'
                    }`}
                  >
                    Nâng cấp ngay
                  </button>
                )}
              </div>
            );
          })}

          {packages.length === 0 && (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
              <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
              <p className="mt-2 font-semibold">Chưa có gói Boost CV nào đang mở bán</p>
            </div>
          )}
        </div>
      )}

      {/* Modal mua: chọn CV → QR SePay */}
      {buyPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{qrData ? 'Quét mã thanh toán' : 'Nâng cấp ' + buyPkg.name}</h2>
                <p className="text-sm text-slate-500">{formatPrice(buyPkg.price)} / {buyPkg.durationDays || 7} ngày</p>
              </div>
              <button onClick={closeBuy} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {!qrData ? (
                <>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chọn CV muốn đẩy top</label>
                  {!cvsLoaded ? (
                    <div className="py-6 text-center text-slate-400 text-sm">Đang tải CV...</div>
                  ) : cvs.length === 0 ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                      Bạn chưa có CV nào. Hãy <Link to="/manage-cv" className="font-bold underline">tạo CV</Link> trước khi nâng cấp.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {cvs.map((cv) => (
                        <button
                          key={cv._id}
                          onClick={() => setSelectedCv(cv._id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                            selectedCv === cv._id ? 'border-[#003f87] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-slate-400">description</span>
                          <span className="font-semibold text-slate-800 truncate">{cv.title || 'CV chưa đặt tên'}</span>
                          {selectedCv === cv._id && <span className="material-symbols-outlined text-[#003f87] ml-auto">check_circle</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handlePay}
                    disabled={!selectedCv || paying}
                    className="mt-5 w-full py-3 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paying ? 'Đang tạo thanh toán...' : 'Thanh toán qua SePay'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block mb-4">
                    <img src={qrData.qrUrl} alt="QR SePay" className="w-48 h-48 mx-auto" />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Số tiền:</span><span className="font-black text-emerald-600">{formatPrice(qrData.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Ngân hàng:</span><span className="font-bold text-slate-900">{qrData.bankName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Số TK:</span><span className="font-bold text-slate-900">{qrData.bankAccount}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Nội dung CK:</span><span className="font-black text-[#003f87]">{qrData.transferContent}</span></div>
                  </div>
                  {paid ? (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <span className="material-symbols-outlined text-emerald-600 text-[40px]">check_circle</span>
                      <p className="font-black text-emerald-700 mt-1">Thanh toán thành công!</p>
                      <p className="text-sm text-emerald-600">Đang chuyển sang trang xác nhận...</p>
                      <button
                        onClick={() => navigate(`/payment-success?orderCode=${qrData.orderCode}`)}
                        className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                        <span className="w-4 h-4 border-2 border-[#003f87] border-t-transparent rounded-full animate-spin" />
                        Đang chờ thanh toán... (tự xác nhận khi tiền vào)
                      </div>
                      <button onClick={closeBuy} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                        Đóng
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận upgrade */}
      {upgradeInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">upgrade</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-4">CV đang có gói active</h2>
              <p className="text-slate-600 mt-2 text-sm">
                CV này đang dùng gói <b className="text-slate-900">{upgradeInfo.currentPackage?.name}</b>
                {upgradeInfo.currentPackage?.daysRemaining != null && (
                  <> (còn <b>{upgradeInfo.currentPackage.daysRemaining}</b> ngày).</>
                )}
              </p>
              <p className="text-amber-600 mt-2 text-xs">
                ⚠️ Nâng cấp sẽ <b>huỷ gói cũ</b> và bắt đầu gói mới ngay lập tức. Phần thời gian còn lại của gói cũ sẽ không được hoàn lại.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUpgradeInfo(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={paying}
                className="flex-1 py-2.5 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] disabled:opacity-50"
              >
                {paying ? 'Đang xử lý...' : 'Nâng cấp ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UpgradePremium;
