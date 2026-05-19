import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    icon: 'domain',
    label: 'Công ty',
    children: [
      { label: 'Hồ sơ công ty', to: '/employer/company-profile' },
      { label: 'Địa điểm làm việc', to: '/employer/company-profile?tab=locations' },
      { label: 'Xác thực pháp lý', to: '/employer/company-profile?tab=legal' },
    ],
  },
  {
    icon: 'work',
    label: 'Tin tuyển dụng',
    children: [
      { label: 'Danh sách tin', to: '/employer/jobs' },
      { label: 'Tạo tin mới', to: '/employer/jobs/create', isPrimary: true, icon: 'add_circle' },
    ],
  },
  {
    icon: 'person_search',
    label: 'Ứng viên',
    children: [
      { label: 'Hồ sơ ứng tuyển', to: '/employer/candidates' },
      { label: 'Tìm kiếm ứng viên', to: '/employer/talent-pool' },
      { label: 'CV đã mở khóa', to: '/employer/unlocked-candidates' },
    ],
  },
  {
    icon: 'account_balance_wallet',
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
    icon: 'forum',
    label: 'Tương tác',
    badge: 3,
    children: [
      { label: 'Tin nhắn', to: '/employer/messages' },
      { label: 'Thông báo', to: '/employer/notifications' },
    ],
  },
  {
    icon: 'account_circle',
    label: 'Tài khoản',
    children: [
      { label: 'Cài đặt tài khoản', to: '/employer/account-settings' },
      { label: 'Đăng xuất', to: '/employer/login', isDanger: true, icon: 'logout' },
    ],
  },
];

const EmployerSidebar = () => {
  const [openGroup, setOpenGroup] = useState('Tin tuyển dụng');

  const toggle = (label) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#f5f3f3] border-r border-[#c2c6d4] flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0056b3] rounded-lg flex items-center justify-center text-white font-black text-xl">
          VW
        </div>
        <span className="text-xl font-black text-[#0056b3] tracking-tight">VietWorks</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin">
        <NavLink
          to="/employer/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-2.5 font-bold text-sm transition-all ${
              isActive ? 'bg-[#0056b3]/10 text-[#0056b3]' : 'text-[#5e5e62] hover:bg-[#e4e2e2]'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          Tổng quan
        </NavLink>

        {navItems.map((item) => (
          <div key={item.label}>
            <button
              type="button"
              onClick={() => toggle(item.label)}
              className="w-full flex items-center justify-between text-[#5e5e62] px-4 py-2.5 hover:bg-[#e4e2e2] rounded-lg transition-all text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge ? (
                  <span className="bg-[#0056b3] text-white text-[10px] px-1.5 rounded-full">
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
                  <NavLink
                    key={child.label}
                    to={child.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 py-2 text-sm transition-all ${
                        child.isDanger
                          ? 'text-[#ba1a1a] font-bold'
                          : child.isPrimary
                          ? 'text-[#0056b3] font-semibold'
                          : isActive
                          ? 'text-[#0056b3] font-semibold'
                          : 'text-[#5e5e62] hover:text-[#0056b3]'
                      }`
                    }
                  >
                    {child.icon ? (
                      <span className="material-symbols-outlined text-[16px]">{child.icon}</span>
                    ) : null}
                    {child.label}
                  </NavLink>
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
