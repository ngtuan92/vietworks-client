import { LayoutDashboard, ChevronDown, Users, Building2, Briefcase, Database, FileText, CreditCard, Package, BellRing, BarChart2, Receipt, Settings, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSocket } from '../../../contexts/SocketContext';
import notificationService from '../../../services/notificationService';
import logoImg from '../../../assets/logo.png';

const iconClass = 'w-5 h-5';

const navItems = [
  {
    icon: <Users className={iconClass} />,
    label: 'Người dùng',
    children: [
      { label: 'Quản lý người dùng', to: '/admin/users' },
    ],
  },
  {
    icon: <Building2 className={iconClass} />,
    label: 'Công ty',
    children: [{ label: 'Quản lý công ty', to: '/admin/companies' }],
  },
  {
    icon: <Briefcase className={iconClass} />,
    label: 'Tin tuyển dụng',
    children: [{ label: 'Quản lý Job', to: '/admin/jobs' }],
  },
  {
    icon: <Database className={iconClass} />,
    label: 'Dữ liệu gốc',
    children: [{ label: 'Quản lý dữ liệu gốc', to: '/admin/master-data' }],
  },
  {
    icon: <FileText className={iconClass} />,
    label: 'Mẫu CV',
    children: [
      { label: 'Danh sách mẫu CV', to: '/admin/cv-templates' },
      { label: 'Thêm mẫu CV', to: '/admin/cv-templates/create', icon: <PlusCircle className="w-4 h-4" /> },
    ],
  },
  {
    icon: <CreditCard className={iconClass} />,
    label: 'Giao dịch & Hóa đơn',
    children: [
      { label: 'Tất cả giao dịch', to: '/admin/transactions' },
      { label: 'Đối soát SePay', to: '/admin/sepay-webhook-logs' },
      { label: 'Hóa đơn', to: '/admin/invoices' },
    ],
  },
  {
    icon: <Package className={iconClass} />,
    label: 'Gói dịch vụ',
    children: [
      { label: 'Danh sách gói', to: '/admin/packages' },
      { label: 'Thêm gói mới', to: '/admin/packages/create' },
    ],
  },
  {
    icon: <BellRing className={iconClass} />,
    label: 'Thông báo',
    children: [{ label: 'Quản lý thông báo', to: '/admin/notifications', id: 'notifications' }],
  },
  {
    icon: <BarChart2 className={iconClass} />,
    label: 'Báo cáo',
    children: [
      { label: 'Tăng trưởng người dùng', to: '/admin/analytics/user-growth' },
      { label: 'Job & Tuyển dụng', to: '/admin/analytics/charts' },
      { label: 'Doanh thu', to: '/admin/revenue-report' },
    ],
  },
  {
    icon: <Receipt className={iconClass} />,
    label: 'Yêu cầu hóa đơn',
    to: '/admin/invoices',
  },
  {
    icon: <Settings className={iconClass} />,
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
  const { confirm } = useNotification();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getMyNotifications({ limit: 1 });
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();

    const handleLocalRead = () => fetchUnread();
    window.addEventListener('vietworks:notification-read', handleLocalRead);

    if (socket) {
      socket.on('new_notification', fetchUnread);
    }
    
    return () => {
      window.removeEventListener('vietworks:notification-read', handleLocalRead);
      if (socket) socket.off('new_notification', fetchUnread);
    };
  }, [socket]);

  const isActive = (to) => {
    if (!to) return false;
    if (to.includes('?')) {
      return location.pathname + location.search === to;
    }
    return location.pathname === to;
  };

  const [openGroup, setOpenGroup] = useState(() => {
    for (const item of navItems) {
      if (item.children?.some((child) => isActive(child.to))) {
        return item.label;
      }
    }
    return 'Người dùng';
  });

  const toggle = (label) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async () => {
    confirm(
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị?',
      async () => {
        await logout();
        navigate('/login', { replace: true });
      },
      null,
      'Xác nhận đăng xuất',
      'Đăng xuất',
      'Hủy'
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-white/70 bg-white/82 shadow-[18px_0_55px_rgba(15,23,42,.08)] backdrop-blur-2xl">
      <div className="p-5 flex items-center gap-3 border-b border-slate-100/80">
        <img src={logoImg} alt="VietWorks Logo" className="h-10 w-auto object-contain" />
        <div>
          <span className="block text-xl font-black text-primary tracking-tight">VietWorks</span>
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Admin Suite</span>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link
          to="/admin/dashboard"
          className={`mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
              isActive('/admin/dashboard')
                ? 'bg-blue-50 text-primary premium-shadow'
                : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100/80 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Tổng quan
        </Link>

        {navItems.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              className={`mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                isActive(item.to)
                  ? 'bg-blue-50 text-primary premium-shadow'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => toggle(item.label)}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  openGroup === item.label ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="rounded-full bg-[#0056B3] px-1.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.label === 'Thông báo' && unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ transform: openGroup === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </button>

              <div
                style={{
                  maxHeight: openGroup === item.label ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease-out',
                }}
              >
                <div className="ml-5 border-l border-slate-200/80 pl-4 space-y-0.5 py-1.5">
                  {item.children.map((child) =>
                    child.action === 'logout' ? (
                      <button
                        key={child.label}
                        type="button"
                        onClick={handleLogout}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all ${
                          child.isDanger ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <span>{child.label}</span>
                      </button>
                    ) : (
                      <Link
                        key={child.label}
                        to={child.to}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                          isActive(child.to)
                            ? 'text-primary font-bold bg-blue-50/50'
                            : child.isDanger
                            ? 'text-red-600 font-bold hover:bg-red-50'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {child.icon ? child.icon : null}
                          <span>{child.label}</span>
                        </div>
                        {child.badge && (
                          <span className="rounded-md bg-[#0056B3]/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-800 transition-all group-hover:bg-[#0056B3] group-hover:text-white">
                            {child.badge}
                          </span>
                        )}
                        {child.id === 'notifications' && unreadCount > 0 && (
                          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 border border-red-200">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </nav>

      <div className="border-t border-slate-200/60 p-4 text-[11px] font-bold text-slate-400">
        Nhà quản trị hệ thống
      </div>
    </aside>
  );
};

export default AdminSidebar;




