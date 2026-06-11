import { useMemo, useState } from 'react';

const jobs = [
  { id: 1, title: 'Senior Backend Developer', status: 'PUBLISHED', deadline: '2026-06-10' },
  { id: 2, title: 'Product Designer', status: 'PENDING_APPROVAL', deadline: '2026-06-01' },
];

const packages = [
  { id: '7d', label: 'Gói 7 ngày', days: 7, price: 150000 },
  { id: '14d', label: 'Gói 14 ngày', days: 14, price: 250000 },
  { id: '30d', label: 'Gói 30 ngày', days: 30, price: 400000 },
];

const BuyFeaturedPackage = () => {
  const [jobId, setJobId] = useState('1');
  const [packageId, setPackageId] = useState('7d');
  const [confirmCost, setConfirmCost] = useState(false);
  const [balance] = useState(300000);

  const selectedJob = jobs.find((j) => String(j.id) === String(jobId));
  const selectedPackage = packages.find((p) => p.id === packageId);
  const canBuyByStatus = selectedJob?.status === 'PUBLISHED';

  const endDate = useMemo(() => {
    if (!selectedPackage) return null;
    const now = new Date();
    now.setDate(now.getDate() + selectedPackage.days);
    return now.toISOString().split('T')[0];
  }, [selectedPackage]);

  const isTooLong = selectedJob && endDate ? new Date(endDate) > new Date(selectedJob.deadline) : false;
  const insufficient = selectedPackage ? balance < selectedPackage.price : true;
  const canBuy = Boolean(selectedJob && selectedPackage && confirmCost && canBuyByStatus && !isTooLong && !insufficient);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mua gói tin nổi bật</h1>
        <p className="text-slate-600 mt-1">Gắn gói premium cho một Job cụ thể.</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Job</label>
          <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white">
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.status}) - Hạn nộp: {job.deadline}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn gói</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {packages.map((pkg) => (
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
          <Info label="Số dư ví" value={`${balance.toLocaleString('vi-VN')} VNĐ`} />
          <Info label="Giá gói" value={`${selectedPackage?.price.toLocaleString('vi-VN')} VNĐ`} />
          <Info label="Số dư sau mua" value={`${((balance - (selectedPackage?.price || 0)) || 0).toLocaleString('vi-VN')} VNĐ`} />
          <Info label="Ngày hết hạn Job" value={selectedJob?.deadline || '-'} />
          <Info label="Ngày hết hạn gói" value={endDate || '-'} />
        </div>

        {!canBuyByStatus ? <Warn text="Job chưa ở trạng thái Published, không thể mua gói." /> : null}
        {isTooLong ? <Warn text="Thời hạn gói vượt quá ngày hết hạn nộp hồ sơ của Job." /> : null}
        {insufficient ? <Warn text="Số dư ví không đủ để mua gói." /> : null}

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={confirmCost} onChange={(e) => setConfirmCost(e.target.checked)} className="mt-1" />
          Tôi xác nhận chi phí và điều khoản gói dịch vụ.
        </label>

        <div className="flex justify-end">
          <button
            disabled={!canBuy}
            className={`px-4 py-2 rounded-xl font-semibold ${canBuy ? 'bg-primary text-white hover:bg-primary/95' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
            Mua gói
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
