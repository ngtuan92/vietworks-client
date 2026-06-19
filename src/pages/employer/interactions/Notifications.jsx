import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Eye, Loader2, Trash2 } from 'lucide-react';
import notificationService from '../../../services/notificationService';

const TYPE_LABEL = {
  EMPLOYER_VIEWED_CV: 'CV',
  INTERVIEW_INVITATION: 'Phỏng vấn',
  APPLICATION_RESULT: 'Hồ sơ',
  JOB_APPROVED: 'Job',
  JOB_REJECTED: 'Job',
  COMPANY_VERIFIED: 'Company',
  COMPANY_REJECTED: 'Company',
  SYSTEM_UPDATE: 'Hệ thống',
  NEW_MESSAGE: 'Tin nhắn'
};

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await notificationService.getMyNotifications({ limit: 50 });
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

  const totalCount = items.length;
  const readCount = useMemo(() => items.filter((item) => item.status === 'READ').length, [items]);

  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(`read-${id}`);
      setError('');
      setSuccess('');
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((item) => item._id === id ? { ...item, status: 'READ' } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setSuccess('Đã đánh dấu thông báo là đã đọc.');
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

  const handleDelete = async (id) => {
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
        <StatCard label="Tổng thông báo" value={totalCount} icon={<Bell className="w-5 h-5" />} />
        <StatCard label="Chưa đọc" value={unreadCount} icon={<Eye className="w-5 h-5" />} highlight />
        <StatCard label="Đã đọc" value={readCount} icon={<CheckCheck className="w-5 h-5" />} />
      </section>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
      {success ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div> : null}

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Tiêu đề', 'Nội dung', 'Loại', 'Trạng thái', 'Thời gian', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Đang tải thông báo...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-slate-500">Chưa có thông báo nào.</td></tr>
              ) : items.map((item) => (
                <tr key={item._id} className={`border-t border-slate-100 hover:bg-slate-50/70 transition-colors ${item.status === 'UNREAD' ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 min-w-[280px]">
                    <div className="font-bold text-slate-900">{item.title}</div>
                  </td>
                  <td className="px-4 py-3 min-w-[360px] text-slate-600">{item.content}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{TYPE_LABEL[item.typeCode] || item.typeCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {item.status === 'UNREAD' ? 'Chưa đọc' : 'Đã đọc'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        disabled={item.status === 'READ' || actionLoading === `read-${item._id}`}
                        title="Đánh dấu đã đọc"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-500 disabled:hover:translate-y-0"
                      >
                        {actionLoading === `read-${item._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={actionLoading === `delete-${item._id}`}
                        title="Xóa thông báo"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:bg-red-50 disabled:hover:text-red-500 disabled:hover:translate-y-0"
                      >
                        {actionLoading === `delete-${item._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight = false }) => (
  <div className={`rounded-2xl border p-5 premium-shadow ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-200/60'}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${highlight ? 'bg-white text-primary' : 'bg-slate-50 text-slate-500'}`}>
      {icon}
    </div>
    <p className="text-sm text-slate-500 font-semibold">{label}</p>
    <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

export default Notifications;
