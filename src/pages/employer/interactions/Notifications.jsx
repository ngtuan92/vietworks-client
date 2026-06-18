import { useEffect, useState } from 'react';

import { CheckCheck, Eye, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState('');

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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((item) => item._id === id ? { ...item, status: 'READ' } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllLocal = async () => {
    const unreadItems = items.filter((item) => item.status === 'UNREAD');
    for (const item of unreadItems) {
      await handleMarkAsRead(item._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-600 mt-1">Theo dõi thông báo ATS, CV, phỏng vấn và hệ thống. Chưa đọc: {unreadCount}</p>
        </div>
        <button
          onClick={handleMarkAllLocal}
          disabled={!unreadCount}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-5 h-5 text-slate-500" />
          Đánh dấu đã đọc tất cả
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

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
                <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
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
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      disabled={item.status === 'READ'}
                      title="Đánh dấu đã đọc"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-500 disabled:hover:translate-y-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

export default Notifications;
