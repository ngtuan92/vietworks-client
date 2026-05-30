import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SocialLogin from '../../../components/jobseeker/auth/SocialLogin';
import authService from '../../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedTerms: false,
    agreedPersonalData: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordChecks.minLength || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      setError('Mật khẩu quá yếu. Vui lòng dùng ít nhất 8 ký tự, gồm chữ và số.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!formData.agreedTerms) {
      setError('Bạn cần đồng ý điều khoản sử dụng để tiếp tục.');
      return;
    }
    if (!formData.agreedPersonalData) {
      setError('Bạn cần đồng ý chính sách dữ liệu cá nhân để tiếp tục.');
      return;
    }

    try {
      const data = await authService.registerJobseeker({
        fullName: formData.fullName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      if (data.success) {
        setSuccess('Đăng ký thành công. Vui lòng đăng nhập.');
        setTimeout(() => navigate('/login'), 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid lg:grid-cols-2">
        <section className="p-8 md:p-12">
          <div className="mb-8">
            <Link to="/" className="text-2xl font-bold text-[#003f87]">VietWorks</Link>
            <h1 className="text-3xl font-bold text-slate-900 mt-6">Tạo tài khoản ứng viên</h1>
            <p className="text-slate-600 mt-2">Bắt đầu hành trình nghề nghiệp mới cùng VietWorks.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div> : null}
            {success ? <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">{success}</div> : null}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">Họ tên</label>
              <input id="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="example@gmail.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required placeholder="Ít nhất 8 ký tự" className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 outline-none focus:border-[#003f87]" />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-3.5 text-slate-500">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu</label>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required placeholder="Nhập lại mật khẩu" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input id="agreedTerms" type="checkbox" checked={formData.agreedTerms} onChange={handleChange} className="mt-1" />
              <span>Tôi đồng ý với Điều khoản sử dụng.</span>
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input id="agreedPersonalData" type="checkbox" checked={formData.agreedPersonalData} onChange={handleChange} className="mt-1" />
              <span>Tôi đồng ý với Chính sách dữ liệu cá nhân.</span>
            </label>

            <button type="submit" className="w-full rounded-xl bg-[#003f87] text-white py-3 font-semibold hover:bg-[#0b4e9f] transition-colors">Đăng ký</button>
          </form>

          <div className="my-6 flex items-center gap-4 text-sm text-slate-400">
            <div className="h-px bg-slate-200 flex-1" />
            <span>Hoặc</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <SocialLogin mode="register" />

          <p className="text-center text-sm text-slate-600 mt-6">
            Đã có tài khoản? <Link to="/login" className="font-semibold text-[#003f87]">Đăng nhập</Link>
          </p>
        </section>

        <section className="hidden lg:flex bg-gradient-to-br from-[#003f87] via-[#0f4f9d] to-[#0a2c59] text-white p-12 flex-col justify-between">
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
