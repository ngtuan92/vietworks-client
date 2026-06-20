import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const DEFAULT_PACKAGES = [
  { id: '7d', label: 'Gói 7 ngày', days: 7, price: 150000 },
  { id: '14d', label: 'Gói 14 ngày', days: 14, price: 250000 },
  { id: '30d', label: 'Gói 30 ngày', days: 30, price: 400000 },
];

const BuyFeaturedPackage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [jobId, setJobId] = useState('');
  const [packageId, setPackageId] = useState('7d');
  const [confirmCost, setConfirmCost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/employer/jobs', { params: { status: 'PUBLISHED', limit: 100 } }),
      api.get('/employer/wallet')
    ]).then(([jobsRes, walletRes]) => {
      if (jobsRes.data.success) setJobs(jobsRes.data.data || []);
      if (walletRes.data.success) setWalletBalance(walletRes.data.data.balance || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectedJob = jobs.find((j) => String(j._id) === String(jobId));
  const selectedPackage = DEFAULT_PACKAGES.find((p) => p.id === packageId);

  const endDate = useMemo(() => {
    if (!selectedPackage) return null;
    const now = new Date();
    now.setDate(now.getDate() + selectedPackage.days);
    return now.toISOString().split('T')[0];
  }, [selectedPackage]);

  const isTooLong = selectedJob && endDate
    ? new Date(endDate) > new Date(selectedJob.deadline)
    : false;
  const insufficient = selectedPackage ? walletBalance < selectedPackage.price : true;
  const canBuy = Boolean(selectedJob && selectedPackage && confirmCost && !isTooLong && !insufficient);

  const handleBuy = async () => {
    if (!canBuy) return;
    setBuying(true);
    try {
      const res = await api.post('/employer/jobs/' + selectedJob._id + '/boost/payment', {
        packageType: 'FEATURED_JOB',
        durationDays: selectedPackage.days
      });
      if (res.data.success) {
        navigate('/employer/wallet/payment-result?status=success&amount=' + selectedPackage.price);
      }
    } catch (error) {
      console.error('Buy featured package error:', error);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mua gói tin nổi bật</h1>
        <p className="text-slate-600 mt-1">Gắn gói premium cho một Job cụ thể.</p>
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
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - Hạn nộp: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '—'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn gói</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEFAULT_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setPackageId(pkg.id)}
                className={`text-left rounded-2xl border p-4 ${packageId === pkg.id ? 'border-primary bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="font-bold text-slate-900">{pkg.label}</div>
                <div className="text-sm text-slate-600 mt-1">{pkg.days} ngày</div>
                <div className="text-lg font-bold text-primary mt-2">{pkg.price.toLocaleString('vi-VN')} VNĐ</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
          <Info label="Số dư ví" value={`${walletBalance.toLocaleString('vi-VN')} VNĐ`} />
          <Info label="Giá gói" value={selectedPackage ? `${selectedPackage.price.toLocaleString('vi-VN')} VNĐ` : '—'} />
          <Info label="Số dư sau mua" value={selectedPackage ? `${(walletBalance - selectedPackage.price).toLocaleString('vi-VN')} VNĐ` : '—'} />
          <Info label="Ngày hết hạn Job" value={selectedJob?.deadline ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN') : '—'} />
          <Info label="Ngày hết hạn gói" value={endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '—'} />
        </div>

        {isTooLong ? <Warn text="Thời hạn gói vượt quá ngày hết hạn nộp hồ sơ của Job." /> : null}
        {insufficient ? <Warn text="Số dư ví không đủ để mua gói." /> : null}

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