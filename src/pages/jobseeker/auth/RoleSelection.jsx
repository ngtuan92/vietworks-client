import { Link } from 'react-router-dom';
import { ArrowRight, Building2, GraduationCap } from 'lucide-react';
import logoImg from '../../../assets/logo.jpg';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/">
          <img className="mx-auto h-12 w-auto object-contain" src={logoImg} alt="VietWorks Logo" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Chào mừng đến với VietWorks
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Vui lòng chọn vai trò của bạn để tiếp tục đăng ký
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white py-10 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Link to="/register-candidate" className="group relative rounded-2xl border-2 border-slate-200 bg-white p-8 hover:border-primary hover:bg-blue-50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tôi là Ứng viên</h3>
              <p className="text-sm text-slate-500">
                Tìm kiếm cơ hội việc làm, tạo CV và nhận gợi ý nghề nghiệp phù hợp.
              </p>
            </Link>

            <Link to="/employer/register" className="group relative rounded-2xl border-2 border-slate-200 bg-white p-8 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tôi là Nhà tuyển dụng</h3>
              <p className="text-sm text-slate-500">
                Đăng tin tuyển dụng, tìm kiếm nhân tài và quản lý ứng viên.
              </p>
            </Link>

          </div>
          <div className="mt-8 text-center text-sm text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
