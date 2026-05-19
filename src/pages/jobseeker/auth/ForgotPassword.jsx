import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-[1520px] grid lg:grid-cols-[1.18fr_0.82fr] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(2,25,56,0.12)] border border-slate-200 overflow-hidden">
        <section className="p-8 md:p-12 lg:p-14 xl:p-16">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-[#003f87]">
              VietWorks
            </Link>
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Khôi phục tài khoản
            </span>
          </div>

          <h1 className="mt-8 text-4xl xl:text-[42px] leading-tight font-extrabold text-slate-900">Quên mật khẩu</h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl">
            Nhập email đăng ký để nhận hướng dẫn đặt lại mật khẩu.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {submitted ? (
              <div className="rounded-2xl bg-emerald-50 text-emerald-800 p-5">
                <p className="font-semibold">Đã gửi yêu cầu thành công.</p>
                <p className="text-sm mt-2">
                  Nếu email <b>{email}</b> tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu trong ít phút.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f] whitespace-nowrap shadow-sm"
                  >
                    Quay lại đăng nhập
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 whitespace-nowrap shadow-sm"
                  >
                    Gửi lại
                    <span className="material-symbols-outlined text-base">refresh</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-[#003f87]"
                    placeholder="you@example.com"
                  />
                </div>

                <button type="submit" className="w-full rounded-xl bg-[#003f87] text-white py-4 text-lg font-semibold hover:bg-[#0b4e9f]">
                  Gửi link đặt lại mật khẩu
                </button>

                <p className="text-center text-sm text-slate-600 pt-1">
                  Đã nhớ mật khẩu?{' '}
                  <Link to="/login" className="text-[#003f87] font-semibold">
                    Quay lại đăng nhập
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#022b5f] via-[#0a4b94] to-[#0e63bc] text-white p-10 xl:p-12 flex-col justify-between">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-cyan-300 blur-3xl" />
          </div>

          <div className="relative z-10">
            <span className="rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm inline-flex backdrop-blur-sm">
              VietWorks
            </span>
            <h2 className="mt-8 text-3xl xl:text-4xl font-extrabold leading-tight">Lấy lại quyền truy cập nhanh chóng.</h2>
            <p className="mt-4 text-white/85 text-[15px] leading-7">
              Mẹo: hãy kiểm tra hộp thư Spam/Quảng cáo nếu bạn chưa thấy email. Link đặt lại mật khẩu có thể hết hạn sau một thời gian.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm leading-7 backdrop-blur-sm">
            <p className="font-semibold">Lưu ý bảo mật</p>
            <p>- Không chia sẻ link đặt lại mật khẩu cho người khác.</p>
            <p>- Chỉ thao tác trên đúng website VietWorks.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;

