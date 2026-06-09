import { Link } from 'react-router-dom';
import LoginForm from '../../../components/jobseeker/auth/LoginForm';
import SocialLogin from '../../../components/jobseeker/auth/SocialLogin';
import { ArrowRight, Building2 } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-[1520px] grid lg:grid-cols-[1.18fr_0.82fr] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(2,25,56,0.12)] border border-slate-200 overflow-hidden">
        <section className="p-8 md:p-12 lg:p-14 xl:p-16">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">
              VietWorks
            </Link>
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Nền tảng tuyển dụng & CV
            </span>
          </div>

          <h1 className="mt-8 text-4xl xl:text-[42px] leading-tight font-extrabold text-slate-900">Đăng nhập VietWorks</h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl">
            VietWorks kết nối ứng viên với doanh nghiệp, cung cấp công cụ tạo CV, quản lý hồ sơ và quy trình tuyển dụng trên một nền tảng thống nhất.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <LoginForm />
          </div>

          <div className="my-8 max-w-2xl flex items-center gap-4 text-sm text-slate-400">
            <div className="h-px bg-slate-200 flex-1" />
            <span>Hoặc tiếp tục với</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="max-w-2xl">
            <SocialLogin />
          </div>

          <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Chưa có tài khoản?</p>
             
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 whitespace-nowrap shadow-sm"
              >
                Đăng ký ứng viên
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/employer/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 whitespace-nowrap shadow-sm"
              >
                Đăng ký Employer
                <Building2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="hidden lg:flex relative overflow-hidden hero-gradient text-white p-10 xl:p-12 flex-col justify-between">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-cyan-300 blur-3xl" />
          </div>

          <div className="relative z-10">
            <span className="rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm inline-flex backdrop-blur-sm">
              VietWorks
            </span>
            <h2 className="mt-8 text-3xl xl:text-4xl font-extrabold leading-tight">
              Tuyển dụng thông minh. CV chuyên nghiệp. Trải nghiệm thống nhất.
            </h2>
            <p className="mt-4 text-white/85 text-[15px] leading-7">
              VietWorks hỗ trợ ứng viên xây dựng CV và ứng tuyển nhanh. Với nhà tuyển dụng, VietWorks cung cấp dashboard quản lý tin, ứng viên và quy trình ATS.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <InfoCard value="CV" label="CV Builder" />
            <InfoCard value="Jobs" label="Việc làm chất lượng" />
            <InfoCard value="ATS" label="Quản lý ứng viên" />
            <InfoCard value="Email" label="Xác thực bảo mật" />
          </div>
        </section>
      </main>
    </div>
  );
};

const InfoCard = ({ value, label }) => (
  <div className="rounded-2xl border border-white/20 bg-white/12 p-5 backdrop-blur-sm">
    <div className="text-2xl font-extrabold tracking-tight">{value}</div>
    <div className="text-sm text-white/85 mt-1">{label}</div>
  </div>
);

export default Login;
