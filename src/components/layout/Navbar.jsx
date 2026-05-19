import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [authVersion, setAuthVersion] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setAuthVersion((prev) => prev + 1);
    window.addEventListener('auth_changed', handler);
    return () => window.removeEventListener('auth_changed', handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [authVersion]);

  const isAuthenticated = Boolean(localStorage.getItem('accessToken')) && Boolean(user);
  const isEmployer = user?.role === 'EMPLOYER';
  const profileLabel = user?.fullName || user?.email || 'Tài khoản';
  const profileEmail = user?.email || '';
  const profileInitial = profileLabel.trim().charAt(0).toUpperCase() || 'U';

  const isActive = (path) => location.pathname === path;

  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await authService.logout();
    navigate('/');
  };

  const handleAccountSettings = () => {
    setIsMenuOpen(false);
    navigate(isEmployer ? '/employer/account-settings' : '/job-preferences');
  };

  const handleProfileHome = () => {
    setIsMenuOpen(false);
    navigate(isEmployer ? '/employer/dashboard' : '/job-preferences');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full h-16 px-gutter max-w-container-max mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-xl font-bold text-[#003f87]">
            VietWorks
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              className={`text-sm font-semibold transition-colors duration-200 pb-1 ${
                isActive('/jobs') ? 'text-[#003f87] border-b-2 border-[#003f87]' : 'text-black hover:text-[#003f87]'
              }`}
              to="/jobs"
            >
              Việc làm
            </Link>
            <button
              className="text-sm font-semibold text-black hover:text-[#003f87] transition-colors duration-200"
              onClick={() => handleProtectedNavigation('/manage-cv')}
            >
              Tạo CV
            </button>
            <Link
              className="text-sm font-semibold text-black hover:text-[#003f87] transition-colors duration-200"
              to="/companies"
            >
              Công ty
            </Link>
            <button
              className="text-sm font-semibold text-black hover:text-[#003f87] transition-colors duration-200"
              onClick={() => handleProtectedNavigation('/salary-insight')}
            >
              Tra cứu lương
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={isEmployer ? '/employer/dashboard' : '/employer/register'}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-95 shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span className="hidden sm:inline">Đăng tin tuyển dụng</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <div className="h-9 w-9 rounded-full bg-[#003f87] text-white flex items-center justify-center font-bold text-sm">
                  {profileInitial}
                </div>
                <div className="hidden sm:block text-left max-w-[180px]">
                  <p className="text-sm font-semibold text-slate-800 truncate">{profileLabel}</p>
                  <p className="text-xs text-slate-500 truncate">{isEmployer ? 'Nhà tuyển dụng' : 'Ứng viên'}</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-[20px]">
                  {isMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 mt-3 w-[280px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#003f87] text-white flex items-center justify-center font-bold">
                        {profileInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{profileLabel}</p>
                        <p className="text-xs text-slate-500 truncate">{profileEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleProfileHome}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">account_circle</span>
                      <span className="text-sm font-medium">Trang hồ sơ</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAccountSettings}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                      <span className="text-sm font-medium">Cài đặt tài khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-[#003f87] font-bold hover:bg-[#003f87]/10 rounded-lg transition-all active:scale-95"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-[#003f87] text-white font-bold rounded-lg hover:opacity-90 shadow-sm active:scale-95 transition-all"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
