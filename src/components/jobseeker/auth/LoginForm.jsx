import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authService from '../../../services/authService';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const isRemembered = localStorage.getItem('remember_login') === '1';
    if (isRemembered) {
      setRemember(true);
      const savedEmail = localStorage.getItem('saved_email');
      const savedPwd = localStorage.getItem('saved_pwd');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPwd) {
        try {
          setPassword(atob(savedPwd));
        } catch (e) {
          console.warn('Lỗi giải mã mật khẩu đã lưu');
        }
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const data = await authService.login({ email: normalizedEmail, password });
      if (!data?.success || !data?.user?.role) {
        setError(data?.message || 'Đăng nhập thất bại.');
        return;
      }

      if (remember) {
        localStorage.setItem('remember_login', '1');
        localStorage.setItem('saved_email', normalizedEmail);
        localStorage.setItem('saved_pwd', btoa(password));
      } else {
        localStorage.setItem('remember_login', '0');
        localStorage.removeItem('saved_email');
        localStorage.removeItem('saved_pwd');
      }

      if (data.user.role === 'EMPLOYER') {
        navigate('/employer/dashboard');
        return;
      }
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
        return;
      }

      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo);
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);

      if (message.toLowerCase().includes('not verified') || message.toLowerCase().includes('otp')) {
        navigate(`/employer/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div> : null}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ví dụ: ban@example.com"
          required
          className="w-full rounded-xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            required
            className="w-full rounded-xl border border-slate-200 px-5 py-4 pr-12 text-base outline-none focus:border-primary"
          />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-4 text-slate-500 hover:text-primary transition-colors">
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <Link to="/forgot-password" className="text-primary font-medium hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      <button type="submit" className="w-full rounded-xl bg-primary text-white py-4 text-lg font-semibold hover:bg-primary/90">
        Đăng nhập
      </button>
    </form>
  );
};

export default LoginForm;
