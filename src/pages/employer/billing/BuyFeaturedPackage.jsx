import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { createBoostJobPayment } from '../../../services/paymentService';
import useSepayPolling from '../../../hooks/useSepayPolling';

// Lấy danh sách gói tin nổi bật (PREMIUM_JOB) từ API — admin quản lý,
// employer mua sẽ thấy đúng cùng danh sách. Mặc định hạn 1 tháng.

const formatVND = (n) => `${(n || 0).toLocaleString('vi-VN')} VNĐ`;

const BuyFeaturedPackage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [jobId, setJobId] = useState('');
  const [packageId, setPackageId] = useState('');
  const [confirmCost, setConfirmCost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/employer/jobs', { params: { status: 'PUBLISHED', limit: 100 } }),
      api.get('/employer/wallet'),
      api.get('/packages', { params: { targetRole: 'EMPLOYER', packageType: 'PREMIUM_JOB' } })
    ]).then(([jobsRes, walletRes, pkgRes]) => {
      if (jobsRes.data.success) setJobs(jobsRes.data.data || []);
      if (walletRes.data.success) setWalletBalance(walletRes.data.data.balance || 0);
      if (pkgRes.data.success) {
        const list = (pkgRes.data.data || []).filter(p => p.status === 'ACTIVE');
        setPackages(list);
        if (list[0]) setPackageId(list[0]._id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectedJob = jobs.find((j) => String(j._id) === String(jobId));
  const selectedPackage = packages.find((p) => String(p._id) === String(packageId));

  // Tìm subscription ACTIVE cho Job đã chọn trong gói đã chọn (nếu có)
  const selectedJobActiveSub = selectedJob && selectedPackage?.activeSubscriptions
    ? selectedPackage.activeSubscriptions.find(
        s => s.targetType === 'JOB' && String(s.targetId) === String(selectedJob._id)
      )
    : null;

  // Job nào đang dùng gói nào - tổng quan
  const jobActivePackageMap = useMemo(() => {
    const map = new Map(); // jobId → { packageName, daysRemaining }
    for (const pkg of packages) {
      for (const sub of (pkg.activeSubscriptions || [])) {
        if (sub.targetType === 'JOB' && sub.targetId) {
          map.set(String(sub.targetId), {
            packageId: pkg._id,
            packageName: pkg.name,
            daysRemaining: sub.daysRemaining
          });
        }
      }
    }
    return map;
  }, [packages]);

  const endDate = useMemo(() => {
    if (!selectedPackage) return null;
    const now = new Date();
    const days = selectedPackage.durationDays || 30;
    now.setDate(now.getDate() + days);
    return now.toISOString().split('T')[0];
  }, [selectedPackage]);

  const isTooLong = selectedJob && endDate
    ? new Date(endDate) > new Date(selectedJob.deadline)
    : false;
  const canBuy = Boolean(selectedJob && selectedPackage && confirmCost && !isTooLong);

  const callPaymentApi = async (jobIdParam, pkgIdParam, action = 'new') => {
    try {
      const res = await createBoostJobPayment(jobIdParam, pkgIdParam, action);
      if (res.success) {
        setQrData(res.data);
        setUpgradeInfo(null);
      }
    } catch (e) {
      const errData = e.response?.data;
      if (errData?.code === 'ALREADY_HAS_ACTIVE_PACKAGE') {
        setUpgradeInfo({
          currentPackage: errData.data?.currentPackage,
          jobId: jobIdParam,
          packageId: pkgIdParam
        });
      } else {
        alert(errData?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setBuying(false);
    }
  };

  const handleBuy = async () => {
    if (!canBuy) return;
    setBuying(true);
    await callPaymentApi(selectedJob._id, selectedPackage._id, 'new');
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradeInfo) return;
    setBuying(true);
    await callPaymentApi(upgradeInfo.jobId, upgradeInfo.packageId, 'upgrade');
  };

  // Polling - khi paid → navigate sang Payment Result
  const { paid } = useSepayPolling(qrData?.orderCode, {
    enabled: !!qrData?.orderCode,
    onPaid: (orderCode) => {
      setTimeout(() => {
        navigate(`/employer/wallet/payment-result?orderCode=${orderCode}`);
      }, 1500);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mua gói tin nổi bật</h1>
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
          <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
          <p className="mt-2 font-semibold">Chưa có gói tin nổi bật nào đang mở bán. Vui lòng liên hệ admin.</p>
          <button
            onClick={() => navigate('/employer/packages')}
            className="mt-4 px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mua gói tin nổi bật</h1>
        <p className="text-slate-600 mt-1">Gắn gói premium cho một Job cụ thể. Tất cả gói đều có hạn 1 tháng.</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Job</label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white"
          >
            <option value="">— Chọn Job —</option>
            {jobs.map((job) => {
              const active = jobActivePackageMap.get(String(job._id));
              return (
                <option key={job._id} value={job._id}>
                  {job.title} - Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '—'}
                  {active ? ` ✅ Đang dùng: ${active.packageName} (còn ${active.daysRemaining} ngày)` : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn gói</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {packages.map((pkg) => {
              // Job đã chọn có đang dùng chính gói này không?
              const isOwnedForSelectedJob = selectedJob && (pkg.activeSubscriptions || []).some(
                s => s.targetType === 'JOB' && String(s.targetId) === String(selectedJob._id)
              );
              return (
                <button
                  key={pkg._id}
                  type="button"
                  onClick={() => setPackageId(pkg._id)}
                  className={`text-left rounded-2xl border p-4 relative transition-all ${
                    isOwnedForSelectedJob
                      ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-300/40'
                      : packageId === pkg._id
                      ? 'border-primary bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isOwnedForSelectedJob && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Đang dùng
                    </span>
                  )}
                  <div className="font-bold text-slate-900">{pkg.name}</div>
                  <div className="text-sm text-slate-600 mt-1">{pkg.durationDays || 30} ngày</div>
                  <div className="text-lg font-bold text-primary mt-2">{formatVND(pkg.price)}</div>
                  {pkg.activeCount > 0 && (
                    <div className="text-xs text-emerald-600 mt-1">
                      ✓ Đang áp dụng cho {pkg.activeCount} job
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
          <Info label="Số dư ví" value={formatVND(walletBalance)} />
          <Info label="Giá gói" value={selectedPackage ? formatVND(selectedPackage.price) : '—'} />
          <Info label="Ngày hết hạn Job" value={selectedJob?.deadline ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN') : '—'} />
          <Info label="Ngày hết hạn gói" value={endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '—'} />
        </div>

        {isTooLong ? <Warn text="Thời hạn gói vượt quá ngày hết hạn nộp hồ sơ của Job." /> : null}

        {selectedJobActiveSub && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-emerald-600 mt-0.5">verified</span>
            <div>
              <div className="font-bold">Job này đang dùng gói "{selectedPackage?.name}"</div>
              <div className="text-xs mt-0.5">
                Còn {selectedJobActiveSub.daysRemaining} ngày. Nếu mua tiếp gói này, bạn sẽ được hỏi nâng cấp (gói cũ bị huỷ).
              </div>
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={confirmCost}
            onChange={(e) => setConfirmCost(e.target.checked)}
            className="mt-1"
          />
          Tôi xác nhận chi phí và điều khoản gói dịch vụ.
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate('/employer/wallet')}
            className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            disabled={!canBuy || buying}
            onClick={handleBuy}
            className={`px-4 py-2 rounded-xl font-semibold ${canBuy && !buying ? 'bg-[#003f87] text-white hover:bg-[#0b4e9f]' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
            {buying ? 'Đang xử lý...' : 'Mua gói'}
          </button>
        </div>
      </section>

      {/* QR SePay modal */}
      {qrData && (
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
              <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-4">
                <img src={qrData.qrUrl} alt="QR" className="w-48 h-48 mx-auto" />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Số tiền:</span><span className="font-black text-emerald-600">{formatVND(qrData.amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ngân hàng:</span><span className="font-bold text-slate-900">{qrData.bankName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Số TK:</span><span className="font-bold text-slate-900">{qrData.bankAccount}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Nội dung CK:</span><span className="font-black text-[#003f87]">{qrData.transferContent}</span></div>
              </div>
              {paid ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <span className="material-symbols-outlined text-emerald-600 text-[40px]">check_circle</span>
                  <p className="font-black text-emerald-700 mt-1">Thanh toán thành công!</p>
                  <p className="text-sm text-emerald-600">Đang chuyển sang trang xác nhận...</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span className="w-4 h-4 border-2 border-[#003f87] border-t-transparent rounded-full animate-spin" />
                  Đang chờ thanh toán...
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
              <h2 className="text-xl font-bold text-slate-900 mt-4">Tin tuyển dụng đang có gói active</h2>
              <p className="text-slate-600 mt-2 text-sm">
                Job này đang dùng gói <b className="text-slate-900">{upgradeInfo.currentPackage?.name}</b>
                {upgradeInfo.currentPackage?.daysRemaining != null && (
                  <> (còn <b>{upgradeInfo.currentPackage.daysRemaining}</b> ngày).</>
                )}
              </p>
              <p className="text-amber-600 mt-2 text-xs">
                ⚠️ Nâng cấp sẽ <b>huỷ gói cũ</b> và bắt đầu gói mới ngay. Phần thời gian còn lại không được hoàn lại.
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
                disabled={buying}
                className="flex-1 py-2.5 rounded-xl bg-[#003f87] text-white font-bold hover:bg-[#0b4e9f] disabled:opacity-50"
              >
                {buying ? 'Đang xử lý...' : 'Nâng cấp ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="text-slate-600">{label}</div>
    <div className="font-semibold text-slate-900">{value}</div>
  </div>
);

const Warn = ({ text }) => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{text}</div>
);

export default BuyFeaturedPackage;
