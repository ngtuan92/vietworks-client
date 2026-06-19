import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import notificationService from '../../services/notificationService';

const TYPE_LABEL = {
  EMPLOYER_VIEWED_CV: 'CV',
  NEW_APPLICATION: 'Ứng tuyển',
  INTERVIEW_INVITATION: 'Phỏng vấn',
  APPLICATION_RESULT: 'Hồ sơ',
  JOB_APPROVED: 'Job',
  JOB_REJECTED: 'Job',
  COMPANY_VERIFIED: 'Company',
  COMPANY_REJECTED: 'Company',
  SYSTEM_UPDATE: 'Hệ thống',
  NEW_MESSAGE: 'Tin nhắn'
};

const formatDateTimeShort = (value) => {
  if (!value) return '--';
  const d = new Date(value);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}`;
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [filter, setFilter] = useState('ALL');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications({ limit: 50 });
      setItems(res?.data || []);
      setUnreadCount(res?.unreadCount || 0);
    } catch (err) {
      console.error('Lỗi tải thông báo', err);
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'UNREAD') return items.filter(i => i.status === 'UNREAD');
    if (filter === 'READ') return items.filter(i => i.status === 'READ');
    return items;
  }, [items, filter]);

  const visibleItems = useMemo(() => filteredItems.slice(0, visibleLimit), [filteredItems, visibleLimit]);
  const hasMore = visibleLimit < filteredItems.length;

  const handleShowMore = (e) => {
    e.stopPropagation();
    setVisibleLimit((prev) => prev + 10);
  };

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
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((item) => item._id === id ? { ...item, status: 'READ' } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      setActionLoading('read-all');
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, status: 'READ' })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading('');
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.status === 'UNREAD') {
      await handleMarkAsRead(item._id);
    }
    setIsOpen(false);
    
    const refId = item.referenceId || item.metadata?.applicationId || item.metadata?.jobId;
    if (!refId) return;

    if (['NEW_APPLICATION', 'EMPLOYER_VIEWED_CV', 'INTERVIEW_INVITATION', 'APPLICATION_RESULT'].includes(item.typeCode)) {
      navigate(`/applied-jobs`); // Navigate to user's applied jobs tracking
    } else if (['JOB_APPROVED', 'JOB_REJECTED'].includes(item.typeCode)) {
      navigate(`/jobs/${refId}`);
    }
  };

  const renderGroup = (title, groupItems) => {
    if (groupItems.length === 0) return null;
    return (
      <div className="mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h4 className="px-4 py-2 text-[13px] font-bold text-slate-800">{title}</h4>
        <div>
          {groupItems.map(item => (
            <div 
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-start gap-3 p-3 px-4 hover:bg-slate-100 transition-colors cursor-pointer ${
                item.status === 'UNREAD' ? 'bg-blue-50/50 relative' : ''
              }`}
            >
              {item.status === 'UNREAD' && (
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                item.status === 'UNREAD' ? 'bg-blue-100 text-primary' : 'bg-slate-200 text-slate-600'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] leading-tight line-clamp-2 ${item.status === 'UNREAD' ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                    {item.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs font-semibold ${item.status === 'UNREAD' ? 'text-primary' : 'text-slate-500'}`}>
                    {formatDateTimeShort(item.createdAt)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs text-slate-500">{TYPE_LABEL[item.typeCode] || item.typeCode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className={`relative p-2 rounded-full transition-colors hidden sm:block ${isOpen ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 z-50">
          <div className="px-4 py-3 border-b border-slate-100 flex flex-col gap-1 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Thông báo</h3>
              <button 
                onClick={handleMarkAllAsRead}
                disabled={!unreadCount || actionLoading === 'read-all'}
                title="Đánh dấu tất cả đã đọc"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'read-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('ALL'); setVisibleLimit(10); }}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                Tất cả
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('UNREAD'); setVisibleLimit(10); }}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === 'UNREAD' ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                Chưa đọc
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('READ'); setVisibleLimit(10); }}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${filter === 'READ' ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                Đã đọc
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pb-2">
            {loading && items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-sm font-medium">Đang tải thông báo...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <>
                {renderGroup('Hôm nay', groupedItems.today)}
                {renderGroup('Hôm qua', groupedItems.yesterday)}
                {renderGroup('Trước đó', groupedItems.earlier)}

                {hasMore && (
                  <div className="px-4 py-2 mt-2">
                    <button
                      onClick={handleShowMore}
                      className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
                    >
                      Hiển thị các thông báo trước đó
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
