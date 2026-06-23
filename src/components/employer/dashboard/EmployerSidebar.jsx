import { LayoutDashboard, ChevronDown, Building2, Briefcase, Users, Wallet, MessageSquare, UserCircle, PlusCircle, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useNotification } from '../../../contexts/NotificationContext';
import logoImg from '../../../assets/logo.png';

const navItems = [
  {
    icon: <Building2 className="w-5 h-5" />,
    label: 'Công ty',
    children: [
      { label: 'Hồ sơ công ty', to: '/employer/company-profile' },
      { label: 'Địa điểm làm việc', to: '/employer/company-profile?tab=locations' },
      { label: 'Xác thực pháp lý', to: '/employer/company-profile?tab=legal' },
    ],
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    label: 'Tin tuyển dụng',
    children: [
      { label: 'Danh sách tin', to: '/employer/jobs' },
      { label: 'Tạo tin mới', to: '/employer/jobs/create', isPrimary: true, icon: <PlusCircle className="w-4 h-4" /> },
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Ứng viên',
    children: [
      { label: 'Hồ sơ ứng tuyển', to: '/employer/candidates' },
      { label: 'Tìm kiếm ứng viên', to: '/employer/talent-pool' },
      { label: 'CV đã mở khóa', to: '/employer/unlocked-candidates' },
    ],
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    label: 'Dịch vụ & Thanh toán',
    children: [
      { label: 'Mua gói dịch vụ', to: '/employer/packages' },
      { label: 'Gói của tôi', to: '/employer/my-subscriptions' },
      { label: 'Gói đang sử dụng', to: '/employer/active-packages' },
      { label: 'Ví của tôi', to: '/employer/wallet' },
      { label: 'Nạp tiền', to: '/employer/wallet/topup' },
      { label: 'Lịch sử giao dịch', to: '/employer/transactions' },
    ],
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Tương tác',
    badge: 3,
    children: [
      { label: 'Tin nhắn', to: '/employer/messages' },
      { label: 'Thông báo', to: '/employer/notifications' },
    ],
  },
  {
    icon: <UserCircle className="w-5 h-5" />,
    label: 'Tài khoản',
    children: [
      { label: 'Cài đặt tài khoản', to: '/employer/account-settings' },
      { label: 'Đăng xuất', to: '/employer/login', isDanger: true, icon: <LogOut className="w-4 h-4" /> },
    ],
  },
];

const EmployerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { confirm } = useNotification();
  const isActive = (to) => {
    if (!to) return false;
    if (to.includes('?')) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to;
  };

  const [openGroup, setOpenGroup] = useState(() => {
    for (const item of navItems) {
      if (item.children) {
        if (item.children.some(child => isActive(child.to))) {
          return item.label;
        }
      }
    }
    return 'Tin tuyển dụng';
  });

  const toggle = (label) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    confirm(
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản nhà tuyển dụng?',
      async () => {
        await logout();
        navigate('/employer/login', { replace: true });
      },
      null,
      'Xác nhận đăng xuất',
      'Đăng xuất',
      'Hủy'
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r border-slate-200/80 flex flex-col z-50">
      {/* Brand logo */}
      <div className="p-6 flex items-center gap-3">
        <img src={logoImg} alt="VietWorks Logo" className="h-10 w-auto object-contain" />
        <span className="text-xl font-black text-primary tracking-tight">VietWorks</span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar">
        <NavLink
          to="/employer/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 font-bold text-sm transition-all mb-4 ${
              isActive
                ? 'bg-blue-50 text-primary premium-shadow'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Tổng quan
        </NavLink>

        {navItems.map((item) => (
          <div key={item.label} className="mb-1">
            <button
              type="button"
              onClick={() => toggle(item.label)}
              className="w-full flex items-center justify-between text-slate-600 px-4 py-2.5 hover:bg-slate-100/80 hover:text-slate-900 rounded-xl transition-all text-sm font-bold"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-slate-600">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge ? (
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                ) : null}
                <ChevronDown
                  className="w-4 h-4 text-slate-400 transition-transform duration-200"
                  style={{ transform: openGroup === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>
            </button>

            <div
              style={{
                maxHeight: openGroup === item.label ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="pl-9 space-y-1 py-1">
                {item.children.map((child) => (
                  child.label === 'Đăng xuất' ? (
                    <button
                      key={child.label}
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 py-2 text-sm transition-all text-left cursor-pointer text-red-600 font-bold bg-transparent border-0 hover:text-red-700 hover:translate-x-0.5"
                    >
                      {child.icon ? child.icon : null}
                      <span>{child.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={child.label}
                      to={child.to}
                      className={() => {
                        const active = isActive(child.to);
                        return `flex items-center gap-2 py-2 text-sm transition-all hover:translate-x-0.5 ${
                          child.isDanger
                            ? 'text-red-600 font-bold hover:text-red-700'
                            : child.isPrimary
                            ? 'text-primary font-bold hover:text-primary'
                            : active
                            ? 'text-primary font-bold'
                            : 'text-slate-500 hover:text-primary'
                        }`;
                      }}
                    >
                      {child.icon ? child.icon : null}
                      <span>{child.label}</span>
                    </NavLink>
                  )
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
      
      {/* Footer in Sidebar */}
      <div className="border-t border-slate-200/60 p-4 text-[11px] font-bold text-slate-400">
        Nhà tuyển dụng chuyên nghiệp
      </div>
    </aside>
  );
};

export default EmployerSidebar;
