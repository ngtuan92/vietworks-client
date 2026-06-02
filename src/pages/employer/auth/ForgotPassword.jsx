import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/authService';

const EmployerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4">
      <main className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <Link to="/" className="text-2xl font-extrabold text-[#003f87]">VietWorks</Link>
        <h1 className="mt-8 text-3xl font-extrabold text-slate-900">Quên mật khẩu Employer</h1>
        <p className="mt-3 text-slate-600">Nhập email nhà tuyển dụng để nhận link đặt lại mật khẩu.</p>

        {submitted ? (
          <div className="mt-8 rounded-2xl bg-emerald-50 text-emerald-800 p-5">
            <p className="font-semibold">Yêu cầu đã được ghi nhận.</p>
            <p className="text-sm mt-2">Nếu email <b>{email}</b> tồn tại trong hệ thống, link đặt lại mật khẩu sẽ được gửi tới email này.</p>
            <Link to="/employer/login" className="inline-flex mt-4 px-5 py-3 rounded-xl bg-[#003f87] text-white font-semibold">Quay lại đăng nhập</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error ? <div className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</div> : null}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-5 py-4 outline-none focus:border-[#003f87]" placeholder="hr@company.com" />
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#003f87] text-white py-4 font-semibold disabled:opacity-50">
              {submitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default EmployerForgotPassword;
