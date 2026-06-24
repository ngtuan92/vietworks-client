import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import api from '../../../services/api';
import { createBoostCvPayment, getBoostCvPackages } from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';

const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price || 0)}đ`;

const boostFeatures = (pkg) => {
  const benefits = pkg.benefits || {};
  return [
    { ok: !!benefits.priorityDisplay, text: 'Đẩy CV lên TOP khi nhà tuyển dụng tìm kiếm' },
    { ok: !!benefits.priorityDisplay, text: `Ưu tiên hiển thị hồ sơ trong ${pkg.durationDays || 30} ngày` },
    { ok: !!benefits.aiPremiumAccess, text: 'AI phân tích và gợi ý tối ưu CV' },
    { ok: !!benefits.aiPremiumAccess, text: 'Mẫu CV cao cấp và huy hiệu nổi bật' },
  ];
};

const freeFeatures = [
  { ok: true, text: 'Tạo và lưu CV cơ bản' },
  { ok: true, text: 'Ứng tuyển không giới hạn' },
  { ok: false, text: 'Đẩy CV lên top tìm kiếm' },
  { ok: false, text: 'Ưu tiên hiển thị hồ sơ' },
];

const Check = ({ ok }) => (
  <span className={`material-symbols-outlined mt-0.5 shrink-0 text-[18px] ${ok ? 'text-emerald-500' : 'text-slate-300'}`}>
    {ok ? 'check_circle' : 'cancel'}
  </span>
);

const getCvName = (cv) => cv.title || cv.name || cv.fileName || cv.originalName || 'CV chưa đặt tên';

const UpgradePremium = () => {
  const navigate = useNavigate();
  const { error: notifyError } = useNotification();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyPkg, setBuyPkg] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [cvsLoaded, setCvsLoaded] = useState(false);
  const [selectedCv, setSelectedCv] = useState('');
  const [qrData, setQrData] = useState(null);
  const [paying, setPaying] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    getBoostCvPackages()
      .then((data) => {
        if (mounted) setPackages(data || []);
      })
      .catch((error) => {
        console.error('Không thể tải danh sách gói Boost CV:', error);
        if (mounted) {
          const text = 'Không thể tải danh sách gói. Vui lòng thử lại sau.';
          setMessage(text);
          notifyError(text);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const popularId = useMemo(() => {
    if (!packages.length) return null;
    return [...packages].sort((a, b) => (b.price || 0) - (a.price || 0))[0]?._id;
  }, [packages]);

  const openBuy = async (pkg) => {
    setBuyPkg(pkg);
    setSelectedCv('');
    setQrData(null);
    setUpgradeInfo(null);
    setMessage('');
    setCvsLoaded(false);

    try {
      const response = await api.get('/jobseeker/cvs');
      setCvs(response.data?.data || []);
    } catch (error) {
      console.error('Không thể tải danh sách CV:', error);
      setCvs([]);
      const text = 'Không thể tải danh sách CV. Vui lòng đăng nhập và thử lại.';
      setMessage(text);
      notifyError(text);
    } finally {
      setCvsLoaded(true);
    }
  };

  const closeBuy = () => {
    setBuyPkg(null);
    setQrData(null);
    setSelectedCv('');
    setUpgradeInfo(null);
    setMessage('');
  };

  const callPaymentApi = async (cvId, packageId, action = 'new') => {
    try {
      const response = await createBoostCvPayment(cvId, packageId, action);
      if (response.success) {
        setQrData(response.data);
        setUpgradeInfo(null);
        setMessage('');
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.code === 'ALREADY_HAS_ACTIVE_PACKAGE') {
        setUpgradeInfo({
          currentPackage: errorData.data?.currentPackage,
          packageId,
          cvId,
        });
      } else {
        const text = errorData?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        setMessage(text);
        notifyError(text);
      }
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (!selectedCv || !buyPkg?._id) return;
    setPaying(true);
    await callPaymentApi(selectedCv, buyPkg._id, 'new');
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradeInfo) return;
    setPaying(true);
    await callPaymentApi(upgradeInfo.cvId, upgradeInfo.packageId, 'upgrade');
  };

  const { paid } = useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: (orderCode) => {
      setTimeout(() => {
        navigate(`/jobseeker/payment-success?orderCode=${orderCode}`);
      }, 1500);
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-[#003f87] px-4 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
            <span className="material-symbols-outlined text-base">rocket_launch</span>
            Nâng cấp hồ sơ ứng viên
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
            Tăng cơ hội được nhà tuyển dụng nhìn thấy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-50 md:text-lg">
            Chọn gói Boost CV phù hợp để hồ sơ của bạn nổi bật hơn trong Talent Pool và tăng khả năng được liên hệ.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-6xl px-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 font-semibold text-slate-600">Đang tải danh sách gói...</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <PlanCard
              title="Miễn phí"
              price={0}
              duration="Không giới hạn"
              description="Dành cho ứng viên mới bắt đầu tạo hồ sơ và ứng tuyển cơ bản."
              features={freeFeatures}
              buttonText="Đang sử dụng"
              disabled
            />

            {packages.map((pkg) => (
              <PlanCard
                key={pkg._id}
                title={pkg.name}
                price={pkg.price}
                duration={`${pkg.durationDays || 30} ngày`}
                description={pkg.description || 'Tăng mức độ hiển thị CV trước nhà tuyển dụng.'}
                features={boostFeatures(pkg)}
                popular={pkg._id === popularId}
                buttonText="Mua gói này"
                onClick={() => openBuy(pkg)}
              />
            ))}
          </div>
        )}
      </section>

      {buyPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">Thanh toán Boost CV</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{buyPkg.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{formatPrice(buyPkg.price)} / {buyPkg.durationDays || 30} ngày</p>
              </div>
              <button onClick={closeBuy} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {message}
              </div>
            )}

            {!qrData ? (
              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Chọn CV muốn Boost</label>
                  {!cvsLoaded ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Đang tải danh sách CV...</div>
                  ) : cvs.length ? (
                    <select
                      value={selectedCv}
                      onChange={(event) => setSelectedCv(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="">-- Chọn CV --</option>
                      {cvs.map((cv) => (
                        <option key={cv._id} value={cv._id}>{getCvName(cv)}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                      Bạn chưa có CV. Vui lòng tạo hoặc tải CV lên trước khi mua Boost CV.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Số tiền thanh toán</span>
                    <span className="text-xl font-black text-emerald-600">{formatPrice(buyPkg.price)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={!selectedCv || paying}
                  className="w-full rounded-2xl bg-[#003f87] py-3.5 font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0b4e9f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying ? 'Đang tạo mã thanh toán...' : 'Tạo mã QR thanh toán'}
                </button>
              </div>
            ) : (
              <div className="mt-5 text-center">
                <div className="mb-4 inline-block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <img src={qrData.qrUrl} alt="QR SePay" className="mx-auto h-52 w-52" />
                </div>

                <div className="mb-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
                  <InfoRow label="Số tiền" value={formatPrice(qrData.amount)} highlight />
                  <InfoRow label="Ngân hàng" value={qrData.bankName} />
                  <InfoRow label="Số tài khoản" value={qrData.bankAccount} />
                  <InfoRow label="Nội dung chuyển khoản" value={qrData.transferContent} primary />
                </div>

                {paid ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <span className="material-symbols-outlined text-[42px] text-emerald-600">check_circle</span>
                    <p className="mt-1 font-black text-emerald-700">Thanh toán thành công!</p>
                    <p className="text-sm text-emerald-600">Đang chuyển sang trang xác nhận...</p>
                    <button
                      onClick={() => navigate(`/jobseeker/payment-success?orderCode=${qrData.orderCode}`)}
                      className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-700"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#003f87] border-t-transparent" />
                      Đang chờ thanh toán... hệ thống sẽ tự xác nhận khi nhận tiền.
                    </div>
                    <button onClick={closeBuy} className="w-full rounded-xl border border-slate-200 py-3 font-bold text-slate-600 transition hover:bg-slate-50">
                      Đóng
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {upgradeInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <span className="material-symbols-outlined text-3xl">upgrade</span>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-900">CV đang có gói hoạt động</h2>
              <p className="mt-2 text-sm text-slate-600">
                CV này đang dùng gói <b className="text-slate-900">{upgradeInfo.currentPackage?.name}</b>
                {upgradeInfo.currentPackage?.daysRemaining != null && (
                  <> còn <b>{upgradeInfo.currentPackage.daysRemaining}</b> ngày.</>
                )}
              </p>
              <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">
                Nâng cấp sẽ hủy gói cũ và bắt đầu gói mới ngay lập tức. Phần thời gian còn lại của gói cũ sẽ không được hoàn lại.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUpgradeInfo(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={paying}
                className="flex-1 rounded-xl bg-[#003f87] py-2.5 font-bold text-white hover:bg-[#0b4e9f] disabled:opacity-50"
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

const PlanCard = ({ title, price, duration, description, features, popular, buttonText, disabled, onClick }) => (
  <div className={`relative rounded-3xl border bg-white p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl ${popular ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'}`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#003f87] px-4 py-1.5 text-xs font-black text-white shadow-lg">
        Phổ biến nhất
      </div>
    )}
    <div className="mb-6">
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-2 min-h-[44px] text-sm text-slate-500">{description}</p>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-black text-slate-900">{formatPrice(price)}</span>
        <span className="pb-1 text-sm font-semibold text-slate-400">/ {duration}</span>
      </div>
    </div>

    <div className="space-y-3 border-t border-slate-100 pt-5">
      {features.map((feature) => (
        <div key={feature.text} className="flex gap-2 text-sm font-semibold text-slate-600">
          <Check ok={feature.ok} />
          <span>{feature.text}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-7 w-full rounded-2xl py-3 font-black transition ${disabled ? 'cursor-default bg-slate-100 text-slate-400' : 'bg-[#003f87] text-white shadow-lg shadow-blue-900/20 hover:bg-[#0b4e9f]'}`}
    >
      {buttonText}
    </button>
  </div>
);

const InfoRow = ({ label, value, highlight, primary }) => (
  <div className="flex justify-between gap-4">
    <span className="text-slate-500">{label}:</span>
    <span className={`text-right font-bold ${highlight ? 'text-emerald-600' : primary ? 'text-[#003f87]' : 'text-slate-900'}`}>{value}</span>
  </div>
);

export default UpgradePremium;


