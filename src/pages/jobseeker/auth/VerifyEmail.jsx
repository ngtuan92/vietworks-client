import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resent, setResent] = useState(false);

  const email = searchParams.get('email') || 'your-email@example.com';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <main className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <Link to="/" className="text-xl font-bold text-[#003f87]">VietWorks</Link>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">Vui lòng xác thực email</h1>
        <p className="mt-2 text-slate-600">
          Chúng tôi đã gửi link xác thực đến: <b>{email}</b>
        </p>

        {resent ? (
          <div className="mt-5 rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm">
            Đã gửi lại email xác thực thành công.
          </div>
        ) : null}

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <button onClick={() => setResent(true)} className="rounded-xl bg-[#003f87] text-white py-3 font-semibold">Gửi lại email</button>
          <button onClick={() => navigate('/register')} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-700">Đổi email</button>
        </div>

        <button onClick={() => { localStorage.removeItem('accessToken'); navigate('/login'); }} className="w-full mt-3 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700">
          Đăng xuất
        </button>

        <p className="mt-6 text-sm text-slate-500">
          Sau khi xác thực thành công, bạn có thể <Link to="/login" className="text-[#003f87] font-semibold">đăng nhập lại</Link>.
        </p>
      </main>
    </div>
  );
};

export default VerifyEmail;
