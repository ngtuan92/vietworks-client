import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../../services/authService';

const EmployerResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc thiếu token.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      await authService.resetPassword({ token, ...formData });
      navigate('/employer/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <Link to="/" className="text-xl font-bold text-[#003f87]">VietWorks</Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Đặt lại mật khẩu Employer</h1>
        <p className="mt-2 text-slate-600">Tạo mật khẩu mới cho tài khoản nhà tuyển dụng.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}
          <PasswordFields formData={formData} showPassword={showPassword} setShowPassword={setShowPassword} handleChange={handleChange} />
          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#003f87] text-white py-3 font-semibold disabled:opacity-50">
            {submitting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
          </button>
        </form>
      </main>
    </div>
  );
};

const PasswordFields = ({ formData, showPassword, setShowPassword, handleChange }) => (
  <>
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
      <div className="relative">
        <input id="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 outline-none focus:border-[#003f87]" placeholder="Ít nhất 8 ký tự" />
        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-3.5 text-slate-500">
          <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
        </button>
      </div>
    </div>
    <div>
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
      <input id="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" placeholder="Nhập lại mật khẩu mới" />
    </div>
  </>
);

export default EmployerResetPassword;
