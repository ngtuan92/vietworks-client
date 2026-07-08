import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';

const targetRoleOptions = [
  { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
  { value: 'JOBSEEKER', label: 'Ứng viên' },
];

const employerPackageTypes = [
  { value: 'PREMIUM_JOB', label: 'Tin nổi bật + Gấp' },
  { value: 'CV_UNLOCK', label: 'Mở khóa CV' },
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
  packageType: 'PREMIUM_JOB',
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
  benefits: {
    jobPostsAllowed: 0,
    featuredDays: 0,
    cvAccessLimit: 0,
    aiPremiumAccess: false,
    priorityDisplay: true,
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
          packageType: pkg.packageType || 'PREMIUM_JOB',
          unit: pkg.unit || 'CV',
          jobPostsAllowed: pkg.jobPostsAllowed ?? (pkg.benefits?.jobPostsAllowed ?? 1),
          featuredDays: pkg.featuredDays ?? (pkg.benefits?.featuredDays ?? 0),
          cvAccessLimit: pkg.cvAccessLimit ?? (pkg.benefits?.cvAccessLimit ?? 0),
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

  const removeVietnameseTones = (str) => {
    let result = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    result = result.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    result = result.replace(/đ/g,"d");
    result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    result = result.replace(/Đ/g, "D");
    return result;
  };

  const generateCode = (name) => {
    return removeVietnameseTones(name).toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !isEdit) {
        next.code = generateCode(value);
      }
      return next;
    });
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
        quantity: form.quantity ?? 1,
        unit: form.unit,
        description: form.description,
        benefits: {
          jobPostsAllowed: form.jobPostsAllowed || 0,
          featuredDays: form.featuredDays || 0,
          cvAccessLimit: form.cvAccessLimit || 0,
          aiPremiumAccess: form.benefits?.aiPremiumAccess || false,
          priorityDisplay: form.benefits?.priorityDisplay || false,
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
        <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/packages')}
          className="p-2 rounded-lg hover:bg-slate-50 transition-all"
        >
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#003f87] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#003f87] rounded-full"></span>
            {isEdit ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ mới'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/50 p-6 space-y-6">
        {/* Target Audience Selection */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-3">Đối tượng sử dụng</label>
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
                      : 'border-slate-200/50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${
                      targetRole === opt.value
                        ? opt.value === 'EMPLOYER' ? 'text-indigo-600' : 'text-emerald-600'
                        : 'text-slate-500'
                    }`}>
                      {opt.value === 'EMPLOYER' ? 'apartment' : 'person'}
                    </span>
                    <span className={`font-bold ${
                      targetRole === opt.value ? 'text-slate-900' : 'text-slate-500'
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
          <label className="block text-sm font-bold text-slate-500 mb-2">Loại gói *</label>
          <select
            value={form.packageType}
            onChange={(e) => handleChange('packageType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none bg-white"
          >
            {packageTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Name & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Tên gói *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
              required
              placeholder="VD: Gói Cơ Bản"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => handleChange('sortOrder', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-500 mb-2">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none resize-none"
            rows={2}
            placeholder="Mô tả ngắn về gói dịch vụ..."
          />
        </div>

        {/* Price & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Giá (VND) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Thời hạn (ngày) *</label>
            <input
              type="number"
              value={form.durationDays}
              onChange={(e) => handleChange('durationDays', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-2">Trạng thái</label>
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
              <span className="font-medium text-slate-900">
                {form.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
          </div>
        </div>

        {/* Employer-specific fields */}
        {targetRole === 'EMPLOYER' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Số tin được đăng</label>
              <input
                type="number"
                value={form.jobPostsAllowed}
                onChange={(e) => handleChange('jobPostsAllowed', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Ngày nổi bật</label>
              <input
                type="number"
                value={form.featuredDays}
                onChange={(e) => handleChange('featuredDays', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Số CV được xem</label>
              <input
                type="number"
                value={form.cvAccessLimit}
                onChange={(e) => handleChange('cvAccessLimit', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003f87] outline-none"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Jobseeker-specific fields */}
        {targetRole === 'JOBSEEKER' && form.packageType === 'CV_BOOST' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200">
              <input
                id="aiPremiumAccess"
                type="checkbox"
                checked={form.benefits?.aiPremiumAccess || false}
                onChange={(e) => setForm((prev) => ({ ...prev, benefits: { ...prev.benefits, aiPremiumAccess: e.target.checked } }))}
                className="w-4 h-4"
              />
              <label htmlFor="aiPremiumAccess" className="text-sm font-bold text-slate-500 cursor-pointer">
                Kèm AI Premium (review CV bằng AI)
              </label>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200">
              <input
                id="priorityDisplay"
                type="checkbox"
                checked={form.benefits?.priorityDisplay || false}
                onChange={(e) => setForm((prev) => ({ ...prev, benefits: { ...prev.benefits, priorityDisplay: e.target.checked } }))}
                className="w-4 h-4"
              />
              <label htmlFor="priorityDisplay" className="text-sm font-bold text-slate-500 cursor-pointer">
                Ưu tiên hiển thị (priority display)
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#003f87] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#003f87]/90 transition-all flex items-center gap-2 disabled:opacity-50"
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
            className="px-6 py-3 rounded-xl font-bold border border-[slate-200] hover:bg-[slate-50] transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPackageForm;
