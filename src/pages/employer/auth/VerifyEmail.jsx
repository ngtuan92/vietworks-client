import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../../services/authService';

const EmployerVerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email] = useState(searchParams.get('email') || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const otpRefs = useRef([]);
  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);
  const isOtpComplete = otpValue.length === 6 && !otpDigits.some((item) => item === '');

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const focusOtpIndex = (index) => {
    const element = otpRefs.current[index];
    if (element) element.focus();
  };

  const setOtpAt = (index, value) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleOtpChange = (index, event) => {
    const raw = event.target.value ?? '';
    const digit = raw.replace(/[^\d]/g, '').slice(-1);
    setOtpAt(index, digit);
    if (digit && index < 5) focusOtpIndex(index + 1);
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (otpDigits[index]) {
        setOtpAt(index, '');
        return;
      }
      if (index > 0) {
        focusOtpIndex(index - 1);
        setOtpAt(index - 1, '');
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) focusOtpIndex(index - 1);
    if (event.key === 'ArrowRight' && index < 5) focusOtpIndex(index + 1);
  };

  const handleOtpPaste = (event) => {
    const text = (event.clipboardData?.getData('text') || '').trim();
    if (!text) return;
    const digits = text.replace(/[^\d]/g, '').slice(0, 6).split('');
    if (!digits.length) return;

    event.preventDefault();
    setOtpDigits(() => {
      const next = Array(6).fill('');
      for (let index = 0; index < 6; index += 1) next[index] = digits[index] || '';
      return next;
    });
    focusOtpIndex(Math.min(digits.length, 6) - 1);
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !isOtpComplete) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    try {
      setIsVerifying(true);
      const data = await authService.verifyEmployerOtp({
        email: email.trim().toLowerCase(),
        otp: otpValue
      });
      if (data.success) {
        setSuccess('Xác thực thành công. Đang chuyển vào hệ thống...');
        setTimeout(() => navigate('/employer/dashboard'), 700);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || isResending) return;
    setError('');
    setSuccess('');

    try {
      setIsResending(true);
      const data = await authService.resendEmployerOtp({ email: email.trim().toLowerCase() });
      if (data.success) {
        setSuccess('Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.');
        setCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        focusOtpIndex(0);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Gửi lại OTP thất bại.';
      setError(message);
      const matched = message.match(/(\d+)\s*s/);
      if (matched?.[1]) setCooldown(Number(matched[1]));
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate('/employer/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-6">
      <main className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
        <section className="p-7 md:p-10 lg:p-12">
          <Link to="/" className="text-2xl font-bold text-primary">
            VietWorks
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Xác thực email nhà tuyển dụng</h1>
              <p className="mt-2 text-slate-600">
                Mã OTP gồm 6 số đã được gửi tới email đăng ký. Vui lòng nhập mã để kích hoạt tài khoản.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email xác thực</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 break-all">{email || 'Không có email'}</p>
          </div>

          {error ? <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
          {success ? <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div> : null}

          <form onSubmit={handleVerify} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="otp-0">
                Mã OTP
              </label>
              <div className="flex gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onFocus={(event) => event.target.select()}
                    className="h-14 w-11 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 sm:h-16 sm:w-14"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">Bạn có thể dán nhanh toàn bộ 6 số vào ô đầu tiên.</p>
            </div>

            <button
              type="submit"
              disabled={!isOtpComplete || isVerifying}
              className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-white transition hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">Chưa nhận được mã?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="text-sm font-semibold text-primary disabled:text-slate-400"
            >
              {isResending ? 'Đang gửi...' : cooldown > 0 ? `Gửi lại sau 00:${String(cooldown).padStart(2, '0')}` : 'Gửi lại mã OTP'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
          >
            Đăng xuất
          </button>
        </section>

        <section className="hidden bg-gradient-to-br from-[#032f66] via-[#0b4e9f] to-[#1e63b8] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold leading-tight">Bảo mật tài khoản doanh nghiệp ngay từ bước đầu.</h2>
            <p className="mt-4 text-sm leading-7 text-white/85">
              Xác thực email giúp bảo đảm quyền sở hữu tài khoản, giảm rủi ro giả mạo và mở khóa đầy đủ tính năng tuyển dụng.
            </p>
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/10 p-6 text-sm leading-7">
            <p className="font-semibold">Lưu ý</p>
            <p>- Mã OTP có hiệu lực trong thời gian ngắn.</p>
            <p>- Nếu chưa thấy email, hãy kiểm tra Spam/Quảng cáo.</p>
            <p>- Chỉ nhập mã tại đúng trang xác thực của VietWorks.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployerVerifyEmail;
