import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Building2, ArrowRight, Sparkles } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const RegisterSelection = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <Link to="/">
          <img className="mx-auto h-12 w-auto" src={logoImg} alt="VietWorks" />
        </Link>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          Chào mừng đến với VietWorks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-center text-sm text-slate-600"
        >
          Vui lòng chọn loại tài khoản bạn muốn đăng ký
        </motion.p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
          
          {/* Candidate Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-8 flex flex-col h-full border border-slate-100 shadow-xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              {/* Top accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <User className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Ứng viên
                <Sparkles className="w-5 h-5 text-blue-500" />
              </h3>
              
              <p className="text-slate-500 flex-grow leading-relaxed">
                Tạo hồ sơ ấn tượng, khám phá hàng ngàn cơ hội việc làm IT chất lượng cao và kết nối với các công ty hàng đầu.
              </p>
              
              <ul className="mt-6 space-y-3 mb-8 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Tạo CV chuyên nghiệp</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Nhận gợi ý việc làm phù hợp</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Tra cứu lương thị trường</li>
              </ul>
              
              <Link
                to="/register-candidate"
                className="w-full py-3.5 px-4 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm"
              >
                Đăng ký Ứng viên
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Employer Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-8 flex flex-col h-full border border-slate-100 shadow-xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              {/* Top accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Building2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Nhà tuyển dụng
              </h3>
              
              <p className="text-slate-500 flex-grow leading-relaxed">
                Tiếp cận cộng đồng ứng viên IT chất lượng, quản lý quy trình tuyển dụng hiệu quả và xây dựng thương hiệu công ty.
              </p>
              
              <ul className="mt-6 space-y-3 mb-8 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Đăng tin tuyển dụng không giới hạn</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Truy cập kho hồ sơ tài năng</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Công cụ quản lý ứng viên (ATS)</li>
              </ul>
              
              <Link
                to="/employer/register"
                className="w-full py-3.5 px-4 bg-slate-50 hover:bg-amber-50 text-amber-600 font-bold rounded-xl border border-slate-200 hover:border-amber-200 transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 shadow-sm"
              >
                Đăng ký Nhà tuyển dụng
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-sm text-slate-500"
        >
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all">
            Đăng nhập ngay
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default RegisterSelection;
