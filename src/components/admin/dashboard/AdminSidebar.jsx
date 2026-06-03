import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const navItems = [
  {
    icon: 'group',
    label: 'Người dùng',
    children: [
      { label: 'Tất cả người dùng', to: '/admin/users' },
      { label: 'Ứng viên', to: '/admin/users?role=JOBSEEKER' },
      { label: 'Nhà tuyển dụng', to: '/admin/users?role=EMPLOYER' },
      { label: 'Tài khoản bị khóa', to: '/admin/users?status=BANNED', isDanger: true },
    ],
  },
  {
    icon: 'domain',
    label: 'Công ty',
    children: [{ label: 'Quản lý công ty', to: '/admin/companies' }],
  },
  {
    icon: 'work',
    label: 'Tin tuyển dụng',
    children: [{ label: 'Quản lý Job', to: '/admin/jobs' }],
  },
  {
    icon: 'database',
    label: 'Dữ liệu gốc',
    children: [{ label: 'Quản lý dữ liệu gốc', to: '/admin/master-data' }],
  },
  {
    icon: 'description',
    label: 'Mẫu CV',
    children: [
      { label: 'Danh sách mẫu CV', to: '/admin/cv-templates' },
      { label: 'Thêm mẫu CV', to: '/admin/cv-templates/create', icon: 'add_circle' },
    ],
  },
  {
    icon: 'payments',
    label: 'Giao dịch & Hóa đơn',
    children: [
      { label: 'Tất cả giao dịch', to: '/admin/transactions' },
      { label: 'Yêu cầu nạp tiền', to: '#', badge: 8 },
      { label: 'Lịch sử thanh toán', to: '/admin/transactions' },
      { label: 'Hóa đơn', to: '/admin/invoices' },
    ],
  },
  {
    icon: 'inventory_2',
    label: 'Gói dịch vụ',
    children: [
      { label: 'Danh sách gói', to: '/admin/packages' },
      { label: 'Thêm gói mới', to: '/admin/packages/new', icon: 'add_circle' },
    ],
  },
  {
    icon: 'notifications_active',
    label: 'Thông báo',
    children: [{ label: 'Quản lý thông báo', to: '/admin/notifications' }],
  },
  {
    icon: 'bar_chart',
    label: 'Báo cáo',
    children: [
      { label: 'Thống kê hệ thống', to: '#' },
      { label: 'Thống kê người dùng', to: '/admin/analytics/user-growth' },
      { label: 'Thống kê tuyển dụng', to: '#' },
      { label: 'Thống kê doanh thu', to: '/admin/revenue-report' },
    ],
  },
  {
    icon: 'receipt_long',
    label: 'Yêu cầu hóa đơn',
    to: '/admin/invoices',
  },
  {
    icon: 'gavel',
    label: 'Vi phạm',
    children: [{ label: 'Quản lý báo cáo vi phạm', to: '/admin/violations' }],
  },
  {
    icon: 'admin_panel_settings',
    label: 'Tài khoản',
    children: [
      { label: 'Cài đặt Admin', to: '/admin/account' },
      { label: 'Đăng xuất', action: 'logout', isDanger: true },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (to) => {
    if (!to) return false;
    if (to.includes('?')) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to;
  };

  const [openGroup, setOpenGroup] = useState(() => {
    // Find if any group has an active child
    for (const item of navItems) {
      if (item.children) {
        if (item.children.some(child => isActive(child.to))) {
          return item.label;
        }
      }
    }
    return 'Người dùng';
  });

  const toggle = (label) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#c2c6d4] bg-[#f5f3f3]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0056b3] rounded-lg flex items-center justify-center text-white font-black text-xl">
          VW
        </div>
        <span className="text-xl font-black text-[#0056b3] tracking-tight">VietWorks</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-[#c2c6d4]">
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-bold text-sm transition-all mb-4 ${
            isActive('/admin/dashboard')
              ? 'bg-[#0056b3]/10 text-[#0056b3]'
              : 'text-[#5e5e62] hover:bg-[#e4e2e2]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          Tổng quan
        </Link>

        {navItems.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-bold text-sm transition-all mb-1 ${
                isActive(item.to)
                  ? 'bg-[#0056b3] text-white'
                  : 'text-[#5e5e62] hover:bg-[#e4e2e2]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ) : (
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
                  {item.badge && (
                    <span className="bg-[#ba1a1a] text-white text-[10px] px-1.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
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
                    child.action === 'logout' ? (
                      <button
                        key={child.label}
                        type="button"
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-between py-2 text-sm transition-all text-left ${
                          child.isDanger ? 'text-[#ba1a1a] hover:text-[#ba1a1a]' : 'text-[#5e5e62] hover:text-[#0056b3]'
                        }`}
                      >
                        <span>{child.label}</span>
                      </button>
                    ) : (
                      <Link
                        key={child.label}
                        to={child.to}
                        className={`flex items-center justify-between py-2 text-sm transition-all group ${
                          isActive(child.to)
                            ? 'text-[#0056b3] font-bold'
                            : child.isDanger
                            ? 'text-[#ba1a1a] font-bold'
                            : 'text-[#5e5e62] hover:text-[#0056b3]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {child.icon && (
                            <span className="material-symbols-outlined text-[16px]">{child.icon}</span>
                          )}
                          <span>{child.label}</span>
                        </div>
                        {child.badge && (
                          <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[9px] px-1.5 py-0.5 rounded-md font-bold group-hover:bg-[#ba1a1a] group-hover:text-white transition-all">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </nav>

      <div className="border-t border-[#c2c6d4] p-3 text-[11px] text-[#727784]">
        Quản trị viên hệ thống
      </div>
    </aside>
  );
};

export default AdminSidebar;