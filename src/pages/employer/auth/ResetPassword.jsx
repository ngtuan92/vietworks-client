import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmployerResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    navigate('/employer/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-[1100px] grid lg:grid-cols-[1.2fr_0.8fr] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <section className="p-8 md:p-12 lg:p-14">
          <Link to="/" className="text-2xl font-bold text-[#003f87]">VietWorks</Link>
          <h1 className="mt-10 text-4xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
          <p className="mt-3 text-lg text-slate-600">Tạo mật khẩu mới cho tài khoản Nhà tuyển dụng.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 max-w-2xl">
            {error ? <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-5 py-4 pr-12 text-base outline-none focus:border-[#003f87]"
                  placeholder="Ít nhất 8 ký tự"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-3.5 text-slate-500">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-[#003f87]"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button type="submit" className="w-full rounded-xl bg-[#003f87] text-white py-4 text-lg font-semibold hover:bg-[#0b4e9f]">
              Lưu mật khẩu mới
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-600">
            Quay lại <Link to="/employer/login" className="text-[#003f87] font-semibold">đăng nhập</Link>
          </p>
        </section>

        <section className="hidden lg:flex bg-gradient-to-br from-[#032f66] to-[#0c4f9b] text-white p-10 xl:p-12 flex-col justify-between">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">Đặt lại bảo mật cho doanh nghiệp.</h2>
            <p className="mt-4 text-white/80">
              Sử dụng mật khẩu mạnh để đảm bảo an toàn cho Dashboard tuyển dụng và dữ liệu giao dịch.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InfoCard title="Tối thiểu 8 ký tự" />
            <InfoCard title="Nên có chữ và số" />
            <InfoCard title="Không dùng lại mật khẩu cũ" />
          </div>
        </section>
      </main>
    </div>
  );
};

const InfoCard = ({ title }) => (
  <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
    <div className="font-semibold">{title}</div>
  </div>
);

export default EmployerResetPassword;
