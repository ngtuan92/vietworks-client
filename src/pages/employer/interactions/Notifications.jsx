import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Eye, Loader2, Trash2, ChevronRight, Clock } from 'lucide-react';
import notificationService from '../../../services/notificationService';
import { useSocket } from '../../../contexts/SocketContext';
import { navigateToNotificationTarget } from '../../../utils/notificationNavigation';
import useAuth from '../../../hooks/useAuth';

const TYPE_LABEL = {
  EMPLOYER_VIEWED_CV: 'CV',
  NEW_APPLICATION: 'Ứng tuyển',
  INTERVIEW_INVITATION: 'Phỏng vấn',
  APPLICATION_RESULT: 'Hồ sơ',
  JOB_APPROVED: 'Việc làm',
  JOB_REJECTED: 'Việc làm',
  COMPANY_VERIFIED: 'Công ty',
  COMPANY_REJECTED: 'Công ty',
  SYSTEM_UPDATE: 'Hệ thống',
  NEW_MESSAGE: 'Tin nhắn'
};

const Notifications = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [visibleLimit, setVisibleLimit] = useState(10);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await notificationService.getMyNotifications({ limit: 100 });
      setItems(res?.data || []);
      setUnreadCount(res?.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      loadNotifications();
    });
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      setItems((prev) => {
        if (prev.some((item) => String(item._id) === String(notification._id))) return prev;
        return [notification, ...prev];
      });
      if (notification.status === 'UNREAD') {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const totalCount = items.length;
  const readCount = useMemo(() => items.filter((item) => item.status === 'READ').length, [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'UNREAD') return items.filter(i => i.status === 'UNREAD');
    if (filter === 'READ') return items.filter(i => i.status === 'READ');
    return items;
  }, [items, filter]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleLimit), [filteredItems, visibleLimit]);
  const hasMore = visibleLimit < filteredItems.length;

  const handleShowMore = () => setVisibleLimit(prev => prev + 10);

  const groupedItems = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };
    
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();
    
    visibleItems.forEach(item => {
      const itemDate = new Date(item.createdAt);
      const itemStr = itemDate.toDateString();
      
      if (itemStr === todayStr) {
        groups.today.push(item);
      } else if (itemStr === yesterdayStr) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });
    
    return groups;
  }, [visibleItems]);

  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(`read-${id}`);
      setError('');
      setSuccess('');
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((item) => item._id === id ? { ...item, status: 'READ' } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu đã đọc');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('read-all');
      setError('');
      setSuccess('');
      const res = await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, status: 'READ' })));
      setUnreadCount(0);
      setSuccess(res?.message || 'Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu tất cả thông báo');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoading(`delete-${id}`);
      setError('');
      setSuccess('');
      const target = items.find((item) => item._id === id);
      await notificationService.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      if (target?.status === 'UNREAD') {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
      setSuccess('Đã xóa thông báo khỏi danh sách.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa thông báo');
    } finally {
      setActionLoading('');
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.status === 'UNREAD') {
      await handleMarkAsRead(item._id);
    }
    navigateToNotificationTarget(navigate, item, user);
  };

  const renderGroup = (title, groupItems) => {
    if (groupItems.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <Clock className="w-4 h-4" /> {title}
        </h3>
        <div className="space-y-3">
          {groupItems.map(item => (
            <div 
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                item.status === 'UNREAD' 
                ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-50 hover:shadow-md hover:border-blue-200' 
                : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:shadow-sm hover:border-slate-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                item.status === 'UNREAD' ? 'bg-white text-primary premium-shadow' : 'bg-slate-100 text-slate-500'
              }`}>
                {item.status === 'UNREAD' ? <Bell className="w-6 h-6 animate-pulse" /> : <CheckCheck className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-base truncate font-bold ${item.status === 'UNREAD' ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </h4>
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0 mt-1">
                    {formatDateTimeShort(item.createdAt)}
                  </span>
                </div>
                <p className={`text-sm mt-1 line-clamp-2 ${item.status === 'UNREAD' ? 'text-slate-700' : 'text-slate-500'}`}>
                  {item.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {TYPE_LABEL[item.typeCode] || item.typeCode}
                  </span>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item._id); }}
                      disabled={item.status === 'READ' || actionLoading === `read-${item._id}`}
                      title="Đánh dấu đã đọc"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-500"
                    >
                      {actionLoading === `read-${item._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      disabled={actionLoading === `delete-${item._id}`}
                      title="Xóa thông báo"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-red-50 disabled:hover:text-red-500"
                    >
                      {actionLoading === `delete-${item._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-600 mt-1">Theo dõi thông báo ATS, CV, phỏng vấn và hệ thống.</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={!unreadCount || actionLoading === 'read-all'}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === 'read-all' ? <Loader2 className="w-5 h-5 animate-spin text-slate-500" /> : <CheckCheck className="w-5 h-5 text-slate-500" />}
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Tổng thông báo" value={totalCount} icon={<Bell className="w-5 h-5" />} active={filter === 'ALL'} onClick={() => { setFilter('ALL'); setVisibleLimit(10); }} />
        <StatCard label="Chưa đọc" value={unreadCount} icon={<Eye className="w-5 h-5" />} highlight active={filter === 'UNREAD'} onClick={() => { setFilter('UNREAD'); setVisibleLimit(10); }} />
        <StatCard label="Đã đọc" value={readCount} icon={<CheckCheck className="w-5 h-5" />} active={filter === 'READ'} onClick={() => { setFilter('READ'); setVisibleLimit(10); }} />
      </section>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div> : null}

      <section className="bg-transparent">
        {loading ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/60 premium-shadow">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Đang tải thông báo...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/60 premium-shadow">
            {filter === 'ALL' ? 'Chưa có thông báo nào.' : filter === 'UNREAD' ? 'Tuyệt vời! Bạn đã đọc hết tất cả thông báo.' : 'Bạn chưa có thông báo nào đã đọc.'}
          </div>
        ) : (
          <div className="space-y-2">
            {renderGroup('Hôm nay', groupedItems.today)}
            {renderGroup('Hôm qua', groupedItems.yesterday)}
            {renderGroup('Trước đó', groupedItems.earlier)}
            
            {hasMore && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleShowMore}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 hover:text-primary transition-colors shadow-sm"
                >
                  Hiển thị các thông báo trước đó
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight = false, active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`rounded-2xl border p-5 transition-all cursor-pointer ${
      active ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md hover:-translate-y-0.5 premium-shadow'
    } ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200/60'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${highlight && active ? 'bg-primary text-white shadow-md' : highlight ? 'bg-white text-primary' : active ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
      {icon}
    </div>
    <p className="text-sm text-slate-500 font-semibold">{label}</p>
    <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const formatDateTimeShort = (value) => {
  if (!value) return '--';
  const d = new Date(value);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default Notifications;



