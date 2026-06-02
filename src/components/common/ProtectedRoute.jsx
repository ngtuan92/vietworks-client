import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const isEmployerRoute = location.pathname.startsWith('/employer');
  const loginPath = isEmployerRoute ? '/employer/login' : '/login';

  const handleLoginRedirect = () => {
    setShowModal(false);
    navigate(loginPath, { replace: true, state: { from: location } });
  };

  const handleCancelRedirect = () => {
    setShowModal(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  if (!isAuthenticated) {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100">
          {/* Header Bar with Lock Icon */}
          <div className="flex items-center justify-center p-8 bg-[#0056b3]/5 border-b border-gray-100">
            <FiLock className="w-16 h-16 text-[#0056b3] animate-pulse" />
          </div>

          {/* Content Body */}
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Yêu cầu đăng nhập
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn cần đăng nhập để truy cập chức năng này. Vui lòng đăng nhập với tài khoản phù hợp để tiếp tục.
            </p>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button
              onClick={handleCancelRedirect}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              Hủy / Quay lại
            </button>
            <button
              onClick={handleLoginRedirect}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#0056b3] border border-[#004085] rounded-xl hover:bg-[#004085] shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'EMPLOYER') {
      return <Navigate to="/employer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
