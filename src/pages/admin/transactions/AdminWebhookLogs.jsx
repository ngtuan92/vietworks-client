import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../../services/adminService';
import { CheckCircle2, XCircle, Clock, RefreshCw, Search, Filter } from 'lucide-react';

const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + ' đ';
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';

const BadgePill = ({ ok, trueLabel, falseLabel }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
    {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {ok ? trueLabel : falseLabel}
  </span>
);

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5`}>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
  </div>
);

const AdminWebhookLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [replayingId, setReplayingId] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    processed: '',
    isVerifiedSignature: '',
    orderCode: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await adminService.getSepayWebhookLogs(params);
      if (res.success) {
        setLogs(res.data);
        setStats(res.stats);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Fetch webhook logs error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReplay = async (log) => {
    if (log.processed) {
      showToast('Log này đã được xử lý trước đó.', 'info');
      return;
    }
    setReplayingId(log._id);
    try {
      const res = await adminService.replaySepayWebhookLog(log._id);
      if (res.success) {
        showToast(res.data.replayed ? 'Replay thành công — giao dịch đã được xử lý.' : 'Replay thất bại — kiểm tra log gốc.');
        fetchLogs();
      }
    } catch (err) {
      showToast('Lỗi khi replay: ' + (err?.response?.data?.message || err.message), 'error');
    } finally {
      setReplayingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.type === 'error' ? 'bg-rose-600 text-white' : toast.type === 'info' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đối soát SePay</h1>
        <p className="text-slate-500 mt-1 text-sm">Lịch sử webhook SePay nhận về — kiểm tra chữ ký, trạng thái xử lý và replay nếu cần.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng webhook" value={stats?.total} color="text-slate-900" />
        <StatCard label="Đã xử lý" value={stats?.processed} color="text-emerald-600" />
        <StatCard label="Chữ ký hợp lệ" value={stats?.verified} color="text-blue-600" />
        <StatCard label="Chưa xử lý" value={stats?.unprocessed} color="text-rose-600" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700">
          <Filter className="w-4 h-4" /> Bộ lọc
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Trạng thái xử lý</label>
            <select
              value={filters.processed}
              onChange={(e) => handleFilterChange('processed', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="true">Đã xử lý</option>
              <option value="false">Chưa xử lý</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Chữ ký</label>
            <select
              value={filters.isVerifiedSignature}
              onChange={(e) => handleFilterChange('isVerifiedSignature', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="true">Hợp lệ</option>
              <option value="false">Không hợp lệ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mã đơn (orderCode)</label>
            <input
              value={filters.orderCode}
              onChange={(e) => handleFilterChange('orderCode', e.target.value)}
              placeholder="SEVQR..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setFilters({ processed: '', isVerifiedSignature: '', orderCode: '', startDate: '', endDate: '', page: 1, limit: 20 })}
            className="text-xs text-slate-500 hover:text-primary font-semibold transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Order Code', 'Số tiền', 'Nội dung CK', 'Ngày giao dịch', 'Chữ ký', 'Xử lý', 'Lỗi', 'Replay'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Chưa có webhook log nào.</td></tr>
              ) : logs.map(log => (
                <tr key={log._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">{log.orderCode}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-700">{formatVND(log.transferAmount)}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-600 text-xs" title={log.content}>{log.content || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">{formatDate(log.transactionDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <BadgePill ok={log.isVerifiedSignature} trueLabel="Hợp lệ" falseLabel="Sai" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <BadgePill ok={log.processed} trueLabel="Đã xử lý" falseLabel="Chưa xử lý" />
                  </td>
                  <td className="px-4 py-3 text-xs text-rose-600 max-w-[180px] truncate" title={log.errorMessage}>
                    {log.errorMessage || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {!log.processed ? (
                      <button
                        onClick={() => handleReplay(log)}
                        disabled={replayingId === log._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${replayingId === log._id ? 'animate-spin' : ''}`} />
                        Replay
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        {log.processedAt ? formatDate(log.processedAt) : 'Đã xử lý'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
            <span>Tổng {pagination.total} log · Trang {pagination.page}/{pagination.pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs"
              >
                ← Trước
              </button>
              <button
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWebhookLogs;
