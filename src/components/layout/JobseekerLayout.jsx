import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import useAuth from '../../hooks/useAuth';

const JobseekerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isJobseeker, isAdmin, isEmployer } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (isEmployer) {
        navigate('/employer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isEmployer, navigate]);

  return (
    <div className="min-h-screen bg-background font-body-md flex flex-col">
      {/* Navbar dùng chung */}
      <Navbar />

      {/* Banner cập nhật nhu cầu công việc - chỉ hiện với Jobseeker đã đăng nhập */}
      {isAuthenticated && isJobseeker && location.pathname !== '/job-preferences' && (
        <div className="bg-[#003f87]">
          <div className="max-w-[900px] mx-auto px-gutter py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-base">handshake</span>
              </div>
              <p className="text-white text-sm">
                Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất
              </p>
            </div>
            <button
              onClick={() => navigate('/job-preferences')}
              className="text-white font-semibold flex items-center gap-1 text-sm whitespace-nowrap cursor-pointer"
            >

              <span className="hover:underline">Cập nhật ngay</span> <span className="text-red-400 no-underline">*</span>
            </button>
          </div>
        </div>
      )}

      {/* Nội dung chính của các trang con */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Footer dùng chung */}
      <Footer />
    </div>
  );
};

export default JobseekerLayout;
