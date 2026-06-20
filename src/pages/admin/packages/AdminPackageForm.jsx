import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';

const targetRoleOptions = [
  { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
  { value: 'JOBSEEKER', label: 'Ứng viên' },
];

const employerPackageTypes = [
  { value: 'CV_UNLOCK', label: 'Mở khóa CV' },
  { value: 'PREMIUM_JOB', label: 'Boost Job' },
];

const jobseekerPackageTypes = [
  { value: 'CV_BOOST', label: 'Boost CV' },
];

const unitOptions = [
  { value: 'CV', label: 'CV' },
  { value: 'JOB', label: 'Bài đăng' },
];

const defaultEmployerForm = {
  code: '',
  name: '',
  description: '',
  price: 0,
  currency: 'VND',
  durationDays: 30,
  targetRole: 'EMPLOYER',
  packageType: 'CV_UNLOCK',
  unit: 'CV',
  jobPostsAllowed: 1,
  featuredDays: 0,
  cvAccessLimit: 0,
  benefits: {
    jobPostsAllowed: 1,
    featuredDays: 0,
    cvAccessLimit: 0,
    aiPremiumAccess: false,
    priorityDisplay: false,
  },
  isActive: true,
  sortOrder: 0,
};

const defaultJobseekerForm = {
  code: '',
  name: '',
  description: '',
  price: 0,
  currency: 'VND',
  durationDays: 30,
  targetRole: 'JOBSEEKER',
  packageType: 'CV_BOOST',
  unit: 'CV',
  boostDays: 7,
  visibilityMultiplier: 3,
  aiCredits: 50,
  benefits: {
    jobPostsAllowed: 0,
    featuredDays: 0,
    cvAccessLimit: 0,
    aiPremiumAccess: false,
    priorityDisplay: false,
  },
  isActive: true,
  sortOrder: 0,
};

const AdminPackageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [targetRole, setTargetRole] = useState('EMPLOYER');
  const [form, setForm] = useState(defaultEmployerForm);

  useEffect(() => {
    if (isEdit) {
      fetchPackage();
    }
  }, [id]);

  const fetchPackage = async () => {
    try {
      const res = await api.get(`/admin/packages/${id}`);
      if (res.data.success) {
        const pkg = res.data.data;
        setTargetRole(pkg.targetRole || 'EMPLOYER');
        setForm({
          code: pkg.code || '',
          name: pkg.name || '',
          description: pkg.description || '',
          price: pkg.price ?? 0,
          currency: pkg.currency || 'VND',
          durationDays: pkg.durationDays ?? 30,
          targetRole: pkg.targetRole || 'EMPLOYER',
          packageType: pkg.packageType || 'CV_UNLOCK',
          unit: pkg.unit || 'CV',
          jobPostsAllowed: pkg.jobPostsAllowed ?? (pkg.benefits?.jobPostsAllowed ?? 1),
          featuredDays: pkg.featuredDays ?? (pkg.benefits?.featuredDays ?? 0),
          cvAccessLimit: pkg.cvAccessLimit ?? (pkg.benefits?.cvAccessLimit ?? 0),
          boostDays: pkg.boostDays ?? 7,
          visibilityMultiplier: pkg.visibilityMultiplier ?? 3,
          aiCredits: pkg.aiCredits ?? 50,
          benefits: {
            jobPostsAllowed: pkg.benefits?.jobPostsAllowed ?? 1,
            featuredDays: pkg.benefits?.featuredDays ?? 0,
            cvAccessLimit: pkg.benefits?.cvAccessLimit ?? 0,
            aiPremiumAccess: pkg.benefits?.aiPremiumAccess ?? false,
            priorityDisplay: pkg.benefits?.priorityDisplay ?? false,
          },
          isActive: pkg.status === 'ACTIVE',
          sortOrder: pkg.sortOrder ?? 0,
        });
      }
    } catch (err) {
      setError('Không thể tải thông tin gói dịch vụ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetAudienceChange = (value) => {
    setTargetRole(value);
    if (value === 'EMPLOYER') {
      setForm({ ...defaultEmployerForm });
    } else {
      setForm({ ...defaultJobseekerForm });
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEdit ? `/admin/packages/${id}` : '/admin/packages';

      // Build payload with benefits
      const payload = {
        code: form.code,
        name: form.name,
        targetRole: form.targetRole,
        packageType: form.packageType,
        price: form.price,
        currency: form.currency,
        durationDays: form.durationDays,
        quantity: 1,
        unit: form.unit,
        description: form.description,
        benefits: {
          jobPostsAllowed: form.jobPostsAllowed || 0,
          featuredDays: form.featuredDays || 0,
          cvAccessLimit: form.cvAccessLimit || 0,
          aiPremiumAccess: form.aiPremiumAccess || false,
          priorityDisplay: form.priorityDisplay || false,
        },
        status: form.isActive ? 'ACTIVE' : 'INACTIVE',
        sortOrder: form.sortOrder || 0,
      };

      let res;
      if (isEdit) {
        res = await api.put(url, payload);
      } else {
        res = await api.post(url, payload);
      }

      if (res.data.success) {
        navigate('/admin/packages?tab=' + form.targetRole.toLowerCase());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const packageTypes = targetRole === 'EMPLOYER' ? employerPackageTypes : jobseekerPackageTypes;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/packages')}
          className="p-2 rounded-lg hover:bg-[#f5f3f3] transition-all"
        >
          <span className="material-symbols-outlined text-[#5e5e62]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            {isEdit ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">
            {isEdit ? 'Cập nhật thông tin gói dịch vụ' : 'Tạo gói dịch vụ mới cho người dùng'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#c2c6d4]/50 p-6 space-y-6">
        {/* Target Audience Selection */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-3">Đối tượng sử dụng</label>
            <div className="flex gap-4">
              {targetRoleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTargetAudienceChange(opt.value)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    targetRole === opt.value
                      ? opt.value === 'EMPLOYER'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-emerald-600 bg-emerald-50'
                      : 'border-[#c2c6d4]/50 hover:border-[#c2c6d4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${
                      targetRole === opt.value
                        ? opt.value === 'EMPLOYER' ? 'text-indigo-600' : 'text-emerald-600'
                        : 'text-[#5e5e62]'
                    }`}>
                      {opt.value === 'EMPLOYER' ? 'apartment' : 'person'}
                    </span>
                    <span className={`font-bold ${
                      targetRole === opt.value ? 'text-[#1b1c1c]' : 'text-[#5e5e62]'
                    }`}>
                      {opt.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Package Type */}
        <div>
          <label className="block text-sm font-bold text-[#5e5e62] mb-2">Loại gói</label>
          <select
            value={form.packageType}
            onChange={(e) => handleChange('packageType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none bg-white"
          >
            {packageTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Mã gói *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              required
              placeholder="VD: BASIC_MONTHLY"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Đơn vị *</label>
            <select
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none bg-white"
            >
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Tên gói *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              required
              placeholder="VD: Gói Cơ Bản"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-[#5e5e62] mb-2">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none resize-none"
            rows={2}
            placeholder="Mô tả ngắn về gói dịch vụ..."
          />
        </div>

        {/* Price & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Giá (VND) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Thời hạn (ngày) *</label>
            <input
              type="number"
              value={form.durationDays}
              onChange={(e) => handleChange('durationDays', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">Trạng thái</label>
            <div className="flex items-center gap-3 h-full px-4">
              <button
                type="button"
                onClick={() => handleChange('isActive', !form.isActive)}
                className={`p-2 rounded-lg transition-all ${
                  form.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {form.isActive ? 'toggle_on' : 'toggle_off'}
                </span>
              </button>
              <span className="font-medium text-[#1b1c1c]">
                {form.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        {/* Employer-specific fields */}
        {targetRole === 'EMPLOYER' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-2">Số tin được đăng</label>
              <input
                type="number"
                value={form.jobPostsAllowed}
                onChange={(e) => handleChange('jobPostsAllowed', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-2">Ngày nổi bật</label>
              <input
                type="number"
                value={form.featuredDays}
                onChange={(e) => handleChange('featuredDays', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-2">Số CV được xem</label>
              <input
                type="number"
                value={form.cvAccessLimit}
                onChange={(e) => handleChange('cvAccessLimit', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Jobseeker-specific fields */}
        {targetRole === 'JOBSEEKER' && form.packageType === 'BOOST_CV' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-2">Số ngày Boost</label>
              <input
                type="number"
                value={form.boostDays}
                onChange={(e) => handleChange('boostDays', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5e5e62] mb-2">Hệ số hiển thị (x)</label>
              <input
                type="number"
                value={form.visibilityMultiplier}
                onChange={(e) => handleChange('visibilityMultiplier', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
                min="1"
              />
              <p className="text-xs text-[#5e5e62] mt-1">VD: 3 = hiển thị gấp 3 lần bình thường</p>
            </div>
          </div>
        )}

        {targetRole === 'JOBSEEKER' && form.packageType === 'AI_PREMIUM' && (
          <div>
            <label className="block text-sm font-bold text-[#5e5e62] mb-2">
              AI Credits {form.aiCredits === -1 ? '( -1 = Không giới hạn)' : ''}
            </label>
            <input
              type="number"
              value={form.aiCredits}
              onChange={(e) => handleChange('aiCredits', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-[#c2c6d4] focus:border-[#0056b3] outline-none"
              placeholder="-1 = Không giới hạn"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#c2c6d4]">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0056b3] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                {isEdit ? 'Lưu thay đổi' : 'Tạo gói mới'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/packages')}
            className="px-6 py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3] transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageForm;
