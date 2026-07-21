import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import companyLocationService from '../../../services/companyLocationService';
import authService from '../../../services/authService';

const EmployerRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    representativeName: '',
    gender: '',
    phone: '',
    companyName: '',
    city: '',
    ward: '',
    address: '',
    agreedTerms: false,
    agreedPersonalData: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API dropdown states
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');

  useEffect(() => {
    companyLocationService.getProvinces()
      .then(data => setProvinces(data))
      .catch(console.error);
  }, []);

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedWardCode('');
    
    const provObj = provinces.find(p => String(p.code) === String(code));
    
    if (code) {
      companyLocationService.getCommunes(code)
        .then(data => setWards(data))
        .catch(console.error);
    } else {
      setWards([]);
    }

    setFormData(prev => ({
      ...prev,
      city: provObj?.name || '',
      ward: ''
    }));
    if (fieldErrors.selectedProvinceCode) {
      setFieldErrors(prev => ({ ...prev, selectedProvinceCode: '' }));
    }
  };



  const handleWardChange = (e) => {
    const code = e.target.value;
    setSelectedWardCode(code);

    const wardObj = wards.find(w => String(w.code) === String(code));
    setFormData(prev => ({
      ...prev,
      ward: wardObj?.name || ''
    }));
  };

  const passwordChecks = useMemo(
    () => ({
      minLength: formData.password.length >= 8,
      hasLetter: /[A-Za-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    }),
    [formData.password]
  );

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ.';
    }

    if (!passwordChecks.minLength || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      errors.password = 'Mật khẩu quá yếu (ít nhất 8 ký tự, gồm chữ và số).';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (!formData.representativeName.trim()) {
      errors.representativeName = 'Vui lòng nhập họ tên người đại diện.';
    }

    const phone = formData.phone.trim();
    if (!phone) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else {
      const phoneDigits = phone.replace(/[^\d]/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11 || !/^[+\d][\d\s-]+$/.test(phone)) {
        errors.phone = 'Số điện thoại không hợp lệ (cần 10-11 chữ số).';
      }
    }

    if (!formData.companyName.trim()) {
      errors.companyName = 'Vui lòng nhập tên công ty.';
    }

    if (!selectedProvinceCode) {
      errors.selectedProvinceCode = 'Vui lòng chọn Tỉnh/Thành phố.';
    }

    if (!formData.agreedTerms) errors.agreedTerms = 'Bạn cần đồng ý Điều khoản sử dụng.';
    if (!formData.agreedPersonalData) errors.agreedPersonalData = 'Bạn cần đồng ý Chính sách dữ liệu cá nhân.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName: formData.representativeName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        representativeName: formData.representativeName.trim(),
        gender: formData.gender || 'OTHER',
        company: {
          name: formData.companyName.trim(),
          taxCode: `TEMP${Date.now()}`,
          industryIds: [import.meta.env.VITE_DEFAULT_COMPANY_INDUSTRY_ID || '000000000000000000000001'],
          size: import.meta.env.VITE_DEFAULT_COMPANY_SIZE || '1 - 10 nhân viên',
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          description: formData.companyName.trim(),
          locationData: {
            provinceCode: selectedProvinceCode,
            provinceName: formData.city,
            wardCode: selectedWardCode,
            wardName: formData.ward,
            addressLine: formData.address
          }
        }
      };

      const data = await authService.registerEmployer(payload);
      if (data.success) {
        setSuccess('Đăng ký thành công. Vui lòng xác thực email để kích hoạt tài khoản.');
        setTimeout(() => {
          navigate(`/employer/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`);
        }, 700);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[1500px] w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid lg:grid-cols-[1.4fr_0.8fr]">
          <section className="p-8 md:p-12 lg:p-14">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900">Đăng ký Nhà tuyển dụng</h1>
              <p className="mt-3 text-lg text-slate-600">Tạo tài khoản để đăng tin tuyển dụng và quản lý ứng viên.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error ? <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}
              {success ? <div className="rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm">{success}</div> : null}

              <div className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Thông tin bảo mật</h2>
                <div className="space-y-4">
                  <Field label="Email" id="email" type="email" value={formData.email} onChange={handleChange} placeholder="hr@company.com" error={fieldErrors.email} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <PasswordField
                      id="password"
                      label="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      error={fieldErrors.password}
                    />
                    <PasswordField
                      id="confirmPassword"
                      label="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      error={fieldErrors.confirmPassword}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Thông tin người đại diện</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Họ tên người đại diện" id="representativeName" value={formData.representativeName} onChange={handleChange} placeholder="Nguyễn Văn A" error={fieldErrors.representativeName} />
                  <Field label="Số điện thoại" id="phone" value={formData.phone} onChange={handleChange} placeholder="09xx xxx xxx" error={fieldErrors.phone} />
                  <SelectField label="Giới tính" id="gender" value={formData.gender} onChange={handleChange} options={[{ value: 'MALE', label: 'Nam' }, { value: 'FEMALE', label: 'Nữ' }, { value: 'OTHER', label: 'Khác' }]} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">Thông tin công ty</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Tên công ty" id="companyName" value={formData.companyName} onChange={handleChange} placeholder="Tên doanh nghiệp" error={fieldErrors.companyName} />
                  </div>
                  
                  {/* Tỉnh/Thành phố select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                      className={`w-full rounded-xl border px-5 py-4 text-base outline-none transition-colors ${fieldErrors.selectedProvinceCode ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'} bg-white text-slate-700`}
                    >
                      <option value="">Chọn Tỉnh/Thành phố...</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.selectedProvinceCode && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.selectedProvinceCode}</p>}
                  </div>



                  {/* Phường/Xã select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phường/Xã
                    </label>
                    <select
                      value={selectedWardCode}
                      onChange={handleWardChange}
                      disabled={!selectedProvinceCode}
                      className="w-full rounded-xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-primary bg-white text-slate-700 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn Phường/Xã...</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  </div>

                  <div className="mt-4">
                    <Field label="Địa chỉ chi tiết" id="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường" />
                  </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                  <input id="agreedTerms" type="checkbox" checked={formData.agreedTerms} onChange={handleChange} className="mt-1" />
                  <span className={fieldErrors.agreedTerms ? 'text-red-600' : ''}>Tôi đồng ý với Điều khoản sử dụng.</span>
                </label>
                {fieldErrors.agreedTerms && <p className="text-red-500 text-xs ml-7">{fieldErrors.agreedTerms}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                  <input id="agreedPersonalData" type="checkbox" checked={formData.agreedPersonalData} onChange={handleChange} className="mt-1" />
                  <span className={fieldErrors.agreedPersonalData ? 'text-red-600' : ''}>Tôi đồng ý với Chính sách dữ liệu cá nhân.</span>
                </label>
                {fieldErrors.agreedPersonalData && <p className="text-red-500 text-xs ml-7">{fieldErrors.agreedPersonalData}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full rounded-xl bg-primary text-white py-3 font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/95'}`}
              >
                {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản Nhà tuyển dụng'}
              </button>

              <p className="text-center text-sm text-slate-600">
                Bạn đã có tài khoản? <Link to="/employer/login" className="font-semibold text-primary">Đăng nhập tại đây</Link>
              </p>
            </form>
          </section>

          <section className="hidden lg:flex bg-gradient-to-br from-[#032f66] to-[#0c4f9b] text-white p-10 xl:p-12 flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold">Kết nối nhanh với ứng viên phù hợp.</h2>
              <p className="mt-4 text-white/80">Tạo tài khoản employer để quản lý tin tuyển dụng, hồ sơ và quy trình ATS ngay trên VietWorks.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <input id={id} {...props} className={`w-full rounded-xl border px-5 py-4 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, id, value, onChange, options, error }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <select id={id} value={value} onChange={onChange} className={`w-full rounded-xl border px-5 py-4 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`}>
      <option value="">Chọn</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
  </div>
);

const PasswordField = ({ id, label, value, onChange, placeholder, showPassword, setShowPassword, error }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-5 py-4 pr-12 text-base outline-none transition-colors ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`}
      />
      <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-3.5 text-slate-500">
        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
      </button>
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
  </div>
);

export default EmployerRegister;
