import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

import { Megaphone, ChevronDown, ChevronUp, User, Settings, LogOut, Heart, CheckSquare, ThumbsUp, Sliders, Award, Bell, Building2, CreditCard, Receipt } from 'lucide-react';

import NotificationDropdown from './NotificationDropdown';
import logoImg from '../../assets/logo.png';

// Avatar người dùng: hiện ảnh nếu có (và tải được), nếu không thì hiện chữ cái đầu.
const UserAvatar = ({ avatarUrl, initial, className = '' }) => {
  const [error, setError] = useState(false);
  if (avatarUrl && !error) {
    return (
      <img
        src={avatarUrl}
        alt={initial}
        className={`${className} object-cover`}
        onError={() => setError(true)}
      />
    );
  }
  return <div className={className}>{initial}</div>;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isEmployer, isAdmin, logout } = useAuth();
  const { confirm } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileLabel = user?.fullName || user?.email || 'Tài khoản';
  const profileEmail = user?.email || '';
  const profileInitial = profileLabel.trim().charAt(0).toUpperCase() || 'U';
  const roleLabel = isAdmin ? 'Quản trị viên' : isEmployer ? 'Nhà tuyển dụng' : 'Ứng viên';
  const notificationPath = isAdmin ? '/admin/notifications' : isEmployer ? '/employer/notifications' : '/notifications';

  const isActive = (path) => location.pathname === path;

  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      confirm(
        'Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập để tiếp tục.',
        () => {
          navigate('/login', { state: { from: path } });
        },
        null,
        'Yêu cầu đăng nhập',
        'Đăng nhập',
        'Hủy'
      );
      return;
    }
    navigate(path);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    confirm(
      'Bạn có chắc chắn muốn đăng xuất?',
      async () => {
        await logout();
        navigate('/', { replace: true });
      },
      null,
      'Xác nhận đăng xuất',
      'Đăng xuất',
      'Hủy'
    );
  };

  const handleAccountSettings = () => {
    setIsMenuOpen(false);
    if (isAdmin) {
      navigate('/admin/account');
    } else if (isEmployer) {
      navigate('/employer/account-settings');
    } else {
      navigate('/profile');
    }
  };

  const handleProfileHome = () => {
    setIsMenuOpen(false);
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isEmployer) {
      navigate('/employer/dashboard');
    } else {
      navigate('/profile');
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm shadow-slate-200/50 sticky top-0 z-50 transition-all">
      <div className="flex justify-between items-center w-full h-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6 lg:gap-12 xl:gap-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="VietWorks Logo" className="h-9 w-auto object-contain rounded" />
            <span className="text-xl font-black text-primary tracking-tight">VietWorks</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 lg:gap-4 xl:gap-6">
            <Link
              className={`text-sm font-bold transition-all duration-300 px-3 lg:px-4 py-2 whitespace-nowrap relative ${isActive('/jobs') ? 'text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-[3px] after:bg-primary after:rounded-full' : 'text-slate-600 hover:text-primary hover:bg-slate-50/80 rounded-xl active:scale-95'}`}
              to="/jobs"
            >
              Việc làm
            </Link>
            <Link
              className={`text-sm font-bold transition-all duration-300 px-3 lg:px-4 py-2 whitespace-nowrap relative ${isActive('/companies') ? 'text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-[3px] after:bg-primary after:rounded-full' : 'text-slate-600 hover:text-primary hover:bg-slate-50/80 rounded-xl active:scale-95'}`}
              to="/companies"
            >
              Công ty
            </Link>
            <button
              className={`text-sm font-bold transition-all duration-300 px-3 lg:px-4 py-2 whitespace-nowrap relative cursor-pointer ${isActive('/manage-cv') ? 'text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-[3px] after:bg-primary after:rounded-full' : 'text-slate-600 hover:text-primary hover:bg-slate-50/80 rounded-xl active:scale-95'}`}
              onClick={() => handleProtectedNavigation('/manage-cv')}
            >
              Hồ sơ & CV
            </button>

            {isAuthenticated && !isEmployer && !isAdmin && (
              <div className="relative group">
                <button className={`flex items-center gap-1.5 text-sm font-bold transition-all duration-300 px-3 lg:px-4 py-2 whitespace-nowrap cursor-pointer text-slate-600 hover:text-primary hover:bg-slate-50/80 rounded-xl active:scale-95`}>
                  Việc của tôi <ChevronDown className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-56 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden p-2 flex flex-col gap-1">
                    <MenuLink to="/applied-jobs" icon={<CheckSquare className="w-4 h-4" />} label="Việc đã ứng tuyển" />
                    <MenuLink to="/saved-jobs" icon={<Heart className="w-4 h-4" />} label="Việc đã lưu" />
                    <MenuLink to="/matched-jobs" icon={<ThumbsUp className="w-4 h-4" />} label="Việc làm phù hợp" />
                    <MenuLink to="/ai-cv-review" icon={<Award className="w-4 h-4 text-yellow-500" />} label="AI CV Review" />
                    <MenuLink to="/followed-companies" icon={<Building2 className="w-4 h-4" />} label="Công ty đang theo dõi" />
                    <MenuLink to="/wallet" icon={<CreditCard className="w-4 h-4" />} label="Ví của tôi" />
                    <MenuLink to="/my-subscriptions" icon={<CreditCard className="w-4 h-4" />} label="Gói của tôi" />
                    <MenuLink to="/my-transactions" icon={<Receipt className="w-4 h-4" />} label="Lịch sử giao dịch" />
                  </div>
                </div>
              </div>
            )}

            <button
              className={`text-sm font-bold transition-all duration-300 px-3 lg:px-4 py-2 whitespace-nowrap relative cursor-pointer ${isActive('/salary-insight') ? 'text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-[3px] after:bg-primary after:rounded-full' : 'text-slate-600 hover:text-primary hover:bg-slate-50/80 rounded-xl active:scale-95'}`}
              onClick={() => handleProtectedNavigation('/salary-insight')}
            >
              Tra cứu lương
            </button>

            <Link to="/premium" className="text-sm font-bold flex items-center gap-1.5 px-4 lg:px-5 py-2 ml-1 rounded-full whitespace-nowrap bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <Award className="w-4 h-4 text-orange-500" />
              Gói Premium
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin || isEmployer ? (
                <Link to={notificationPath} className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors hidden sm:block">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Link>
              ) : (
                <NotificationDropdown />
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white p-1 pr-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group shrink-0"
                >
                  <UserAvatar
                    avatarUrl={user?.avatarUrl}
                    initial={profileInitial}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0 overflow-hidden"
                  />
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[100px] lg:max-w-[140px] truncate group-hover:text-primary transition-colors whitespace-nowrap">
                    {profileLabel}
                  </span>
                  {isMenuOpen ? <ChevronUp className="text-slate-400 w-4 h-4 shrink-0 group-hover:text-primary transition-colors" /> : <ChevronDown className="text-slate-400 w-4 h-4 shrink-0 group-hover:text-primary transition-colors" />}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-[260px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          avatarUrl={user?.avatarUrl}
                          initial={profileInitial}
                          className="h-11 w-11 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{profileLabel}</p>
                          <p className="text-xs text-slate-500 truncate">{profileEmail}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-primary">{roleLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {isEmployer || isAdmin ? (
                        <>
                          <button
                            type="button"
                            onClick={handleProfileHome}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition"
                          >
                            <User className="w-5 h-5" />
                            <span className="text-sm font-medium">Trang hồ sơ</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleAccountSettings}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Settings className="w-5 h-5" />
                            <span className="text-sm font-medium">Cài đặt tài khoản</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <MenuLink to="/profile" icon={<User className="w-4 h-4" />} label="Cài đặt tài khoản" onClick={() => setIsMenuOpen(false)} />
                          <MenuLink to="/job-preferences" icon={<Sliders className="w-4 h-4" />} label="Nhu cầu việc làm" onClick={() => setIsMenuOpen(false)} />
                          <MenuLink to="/my-transactions" icon={<CreditCard className="w-4 h-4" />} label="Lịch sử giao dịch" onClick={() => setIsMenuOpen(false)} />
                        </>
                      )}

                      <div className="h-px bg-slate-100 my-1 mx-2" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-primary font-bold hover:bg-primary/10 rounded-xl transition-all active:scale-95 text-sm hidden sm:block"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all text-sm"
              >
                Đăng ký
              </Link>
            </>
          )}

          <Link
            to={isEmployer ? '/employer/dashboard' : '/employer/register'}
            className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm group whitespace-nowrap shrink-0 ml-1"
          >
            <Megaphone className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
            <span className="hidden sm:inline">Đăng tin tuyển dụng</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

const MenuLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-700 hover:text-primary hover:bg-blue-50 transition"
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default Navbar;


