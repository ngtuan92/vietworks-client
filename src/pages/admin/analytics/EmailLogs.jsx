import { useEffect, useState } from 'react';
import { Mail, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import adminNotificationService from '../../../services/adminNotificationService';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = async (p = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await adminNotificationService.getEmailLogs({ page: p, limit: 20 });
      setLogs(res.data?.logs || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử email');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(page);
  }, [page]);

  const STATUS_ICON = {
    SENT: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    FAILED: <XCircle className="w-5 h-5 text-red-500" />,
    PENDING: <Clock className="w-5 h-5 text-blue-500" />
  };

  const STATUS_BG = {
    SENT: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    FAILED: 'bg-red-50 text-red-700 border-red-100',
    PENDING: 'bg-blue-50 text-blue-700 border-blue-100'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử gửi Email</h1>
        <p className="text-slate-600 mt-1">Quản lý và theo dõi trạng thái các email hệ thống đã gửi.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-500 font-semibold bg-red-50">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Gửi tới</th>
                  <th className="px-6 py-4">Tiêu đề (Subject)</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Lỗi (nếu có)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-semibold">Chưa có dữ liệu gửi email.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_BG[log.status] || STATUS_BG.PENDING}`}>
                          {STATUS_ICON[log.status]} {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.to}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={log.subject}>{log.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-red-500" title={log.errorDetails}>{log.errorDetails || '--'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Trước</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Sau</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailLogs;
