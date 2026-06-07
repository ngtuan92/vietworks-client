import { LayoutDashboard, ChevronDown, Building2, Briefcase, Users, Wallet, MessageSquare, UserCircle, PlusCircle, LogOut } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

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
  const { logout } = useAuth();
  const [openGroup, setOpenGroup] = useState('Tin tuyển dụng');

  const toggle = (label) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r border-slate-200 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">
          VW
        </div>
        <span className="text-xl font-black text-primary tracking-tight">VietWorks</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin">
        <NavLink
          to="/employer/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-2.5 font-bold text-sm transition-all ${
              isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Tổng quan
        </NavLink>

        {navItems.map((item) => (
          <div key={item.label}>
            <button
              type="button"
              onClick={() => toggle(item.label)}
              className="w-full flex items-center justify-between text-slate-600 px-4 py-2.5 hover:bg-slate-100 rounded-lg transition-all text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge ? (
                  <span className="bg-primary text-white text-[10px] px-1.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
                <span
                  className="material-symbols-outlined text-[18px] transition-transform duration-200"
                  style={{ transform: openGroup === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </div>
            </button>

            <div
              style={{
                maxHeight: openGroup === item.label ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-out',
              }}
            >
              <div className="pl-9 space-y-0.5 py-1">
                {item.children.map((child) => (
                  child.label === 'Đăng xuất' ? (
                    <button
                      key={child.label}
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-1.5 py-2 text-sm transition-all text-left cursor-pointer text-red-600 font-bold bg-transparent border-0 hover:text-red-600"
                    >
                      {child.icon ? child.icon : null}
                      {child.label}
                    </button>
                  ) : (
                    <NavLink
                      key={child.label}
                      to={child.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 py-2 text-sm transition-all ${
                          child.isDanger
                            ? 'text-red-600 font-bold'
                            : child.isPrimary
                            ? 'text-primary font-semibold'
                            : isActive
                            ? 'text-primary font-semibold'
                            : 'text-slate-600 hover:text-primary'
                        }`
                      }
                    >
                      {child.icon ? child.icon : null}
                      {child.label}
                    </NavLink>
                  )
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default EmployerSidebar;
