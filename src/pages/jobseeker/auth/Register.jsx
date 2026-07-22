import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SocialLogin from '../../../components/jobseeker/auth/SocialLogin';
import { Eye, EyeOff } from 'lucide-react';
import authService from '../../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedTerms: false,
    agreedPersonalData: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = useMemo(
    () => ({
      minLength: formData.password.length >= 8,
      hasLetter: /[A-Za-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    }),
    [formData.password],
  );

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setError('');
    setSuccess('');

    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên.';

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ.';
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

    if (!passwordChecks.minLength || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      errors.password = 'Mật khẩu quá yếu (ít nhất 8 ký tự, gồm chữ và số).';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    if (!formData.agreedTerms) errors.agreedTerms = 'Bạn cần đồng ý Điều khoản sử dụng.';
    if (!formData.agreedPersonalData) errors.agreedPersonalData = 'Bạn cần đồng ý Chính sách dữ liệu cá nhân.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.registerJobseeker({
        fullName: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      if (data.success) {
        setSuccess('Đăng ký thành công. Vui lòng đăng nhập.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid lg:grid-cols-2">
        <section className="p-8 md:p-12">
          <div className="mb-8">
            <Link to="/" className="text-2xl font-bold text-primary">VietWorks</Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-6">Tạo tài khoản ứng viên</h1>
            <p className="text-slate-600 mt-2">Bắt đầu hành trình nghề nghiệp mới cùng VietWorks.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div> : null}
            {success ? <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{success}</div> : null}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">Họ tên</label>
              <input id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${fieldErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
              {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="ví dụ: ban@gmail.com" className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
              <input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Ví dụ: 0912345678" className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
              {fieldErrors.phone && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Ít nhất 8 ký tự" className={`w-full rounded-xl border px-4 py-3 pr-11 outline-none transition-colors ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-3.5 text-slate-500 hover:text-primary transition-colors">
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu</label>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" className={`w-full rounded-xl border px-4 py-3 outline-none transition-colors ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'}`} />
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1">{fieldErrors.confirmPassword}</p>}
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

            <button type="submit" className="w-full rounded-xl bg-primary text-white py-3 font-semibold hover:bg-primary/90 transition-colors">Đăng ký</button>
          </form>

          <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
            <div className="h-px bg-slate-200 flex-1" />
            <span>Hoặc</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <SocialLogin mode="register" />

          <p className="text-center text-sm text-slate-600 mt-6">
            Đã có tài khoản? <Link to="/login" className="font-semibold text-primary">Đăng nhập</Link>
          </p>
        </section>

        <section className="hidden lg:flex hero-gradient text-white p-12 flex-col justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">Ứng viên • Đăng ký</span>
            <h2 className="text-4xl font-bold mt-8 leading-tight">Tạo hồ sơ chuyên nghiệp, tìm đúng cơ hội phù hợp.</h2>
            <p className="mt-4 text-white/80 max-w-lg">Đăng ký để quản lý CV, lưu việc làm, ứng tuyển nhanh và nhận gợi ý việc làm cá nhân hóa.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;
