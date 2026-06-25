import { useState, useEffect } from 'react';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField, ActionButton } from '../shared/AdminPrimitives';
import { Send, BellRing, Loader2, CheckCircle2, Circle, ExternalLink, Filter, Trash2, Check, CheckCheck } from 'lucide-react';
import adminNotificationService from '../../../services/adminNotificationService';
import notificationService from '../../../services/notificationService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSocket } from '../../../contexts/SocketContext';
import { Link, useNavigate } from 'react-router-dom';

const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

const NotificationCenter = () => {
  const { error: notifyError, success: notifySuccess } = useNotification();
  const socket = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('SYSTEM_ALERTS');

  // --- Broadcast State ---
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'ALL',
    actionUrl: ''
  });
  const [urlMode, setUrlMode] = useState('');

  const PRESET_URLS = [
    { label: 'Không gắn liên kết', value: '' },
    // ỨNG VIÊN
    { label: '[Ứng viên] Trang Việc làm', value: '/jobs' },
    { label: '[Ứng viên] Trang Mẫu CV', value: '/cv-templates/gallery' },
    { label: '[Ứng viên] Quản lý Hồ sơ CV', value: '/manage-cv' },
    { label: '[Ứng viên] Trang Công ty nổi bật', value: '/companies' },
    { label: '[Ứng viên] Quản lý Việc làm đã ứng tuyển', value: '/applied-jobs' },
    { label: '[Ứng viên] Xem Việc làm phù hợp', value: '/matched-jobs' },
    { label: '[Ứng viên] Nâng cấp Premium', value: '/premium' },
    // NHÀ TUYỂN DỤNG
    { label: '[Nhà TD] Đăng tin tuyển dụng mới', value: '/employer/jobs/create' },
    { label: '[Nhà TD] Quản lý tin tuyển dụng', value: '/employer/jobs' },
    { label: '[Nhà TD] Quản lý ứng viên (ATS)', value: '/employer/candidates' },
    { label: '[Nhà TD] Trang Nạp tiền', value: '/employer/wallet' },
    { label: '[Nhà TD] Trang Mua gói dịch vụ', value: '/employer/packages' },
    { label: '[Nhà TD] Lịch sử Giao dịch', value: '/employer/transactions' },
    { label: '[Nhà TD] Hồ sơ công ty', value: '/employer/company-profile' },
    // KHÁC
    { label: 'Nhập URL tùy chỉnh...', value: 'CUSTOM' }
  ];

  // --- System Alerts State ---
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadBroadcasts = async () => {
    try {
      setLoadingList(true);
      const res = await adminNotificationService.getBroadcasts({ limit: 20 });
      setBroadcasts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadSystemAlerts = async (isLoadMore = false) => {
    try {
      setLoadingAlerts(true);
      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await notificationService.getMyNotifications({ limit: 15, page: currentPage, status: filterStatus });
      const newAlerts = res.data || [];
      
      if (isLoadMore) {
        setSystemAlerts(prev => [...prev, ...newAlerts]);
        setPage(currentPage);
      } else {
        setSystemAlerts(newAlerts);
        setPage(1);
      }
      
      setHasMore(currentPage < (res.pagination?.totalPages || 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'BROADCAST') {
      loadBroadcasts();
    } else {
      loadSystemAlerts();
    }
  }, [activeTab, filterStatus]);

  useEffect(() => {
    if (socket && activeTab === 'SYSTEM_ALERTS') {
      const handleNewNotification = () => loadSystemAlerts();
      socket.on('new_notification', handleNewNotification);
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket, activeTab, filterStatus]);

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      notifyError('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    try {
      setLoadingSubmit(true);
      await adminNotificationService.sendBroadcast({
        title: formData.title,
        content: formData.message,
        targetRole: formData.targetType,
        actionUrl: formData.actionUrl
      });
      notifySuccess('Đã gửi thông báo hàng loạt thành công!');
      setFormData({ title: '', message: '', targetType: 'ALL', actionUrl: '' });
      setUrlMode('');
      loadBroadcasts();
    } catch (err) {
      notifyError(err.response?.data?.message || 'Lỗi khi gửi thông báo');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadSystemAlerts();
    } catch (err) {
      notifyError('Không thể đánh dấu đã đọc');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      loadSystemAlerts();
      notifySuccess('Đã xóa thông báo');
    } catch (err) {
      notifyError('Lỗi xóa thông báo');
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(systemAlerts.map(a => a._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await notificationService.bulkDeleteNotifications(selectedIds);
      loadSystemAlerts();
      notifySuccess(`Đã xóa ${selectedIds.length} thông báo`);
      setIsSelectionMode(false);
      setSelectedIds([]);
    } catch (err) {
      notifyError('Lỗi xóa thông báo');
    }
  };

  const handleItemClick = (alert) => {
    if (isSelectionMode) {
      if (selectedIds.includes(alert._id)) {
        setSelectedIds(selectedIds.filter(itemId => itemId !== alert._id));
      } else {
        setSelectedIds([...selectedIds, alert._id]);
      }
      return;
    }
    if (alert.status === 'UNREAD') {
      handleMarkAsRead(alert._id);
    }
    const url = alert.actionUrl || alert.metadata?.actionUrl;
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        navigate(url);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadSystemAlerts();
      notifySuccess('Đã đánh dấu tất cả là đã đọc');
    } catch (err) {
      notifyError('Lỗi thao tác');
    }
  };

  // Group notifications
  const todayAlerts = systemAlerts.filter(a => isToday(a.createdAt));
  const olderAlerts = systemAlerts.filter(a => !isToday(a.createdAt));

  const renderAlertItem = (alert) => (
    <div 
      key={alert._id} 
      onClick={() => handleItemClick(alert)}
      className={`p-4 flex gap-4 transition-colors cursor-pointer group ${alert.status === 'UNREAD' ? 'bg-blue-50/30' : 'hover:bg-slate-50'} ${selectedIds.includes(alert._id) ? 'bg-blue-50/50' : ''}`}
    >
      {isSelectionMode && (
        <div className="flex items-start mt-1 mr-1">
          <input 
            type="checkbox" 
            checked={selectedIds.includes(alert._id)}
            readOnly
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary pointer-events-none" 
          />
        </div>
      )}
      <div className="mt-1">
        {alert.status === 'UNREAD' ? (
          <Circle className="w-3 h-3 text-blue-600 fill-blue-600" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-slate-300" />
        )}
      </div>
      <div className="flex-1">
        <h4 className={`text-sm ${alert.status === 'UNREAD' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
          {alert.title}
        </h4>
        <p className="text-sm text-slate-600 mt-1" dangerouslySetInnerHTML={{ __html: alert.message }} />
        <div className="flex items-center gap-3 mt-2">
          <p className="text-xs text-slate-400 font-medium">
            {new Date(alert.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {alert.status === 'UNREAD' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(alert._id);
            }}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="Đánh dấu đã đọc"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={(e) => handleDelete(e, alert._id)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Xóa thông báo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader 
        title="Quản lý Thông báo" 
        description="Quản lý cảnh báo hệ thống và gửi thông báo hàng loạt (Broadcast)." 
        actions={
          <div className="flex gap-3 items-center">
            {activeTab === 'SYSTEM_ALERTS' && (
              <>
                {isSelectionMode && selectedIds.length > 0 && (
                  <button onClick={handleBulkDelete} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-red-200 shadow-sm transition-all">
                    <Trash2 className="w-4 h-4" />
                    Xóa {selectedIds.length} mục
                  </button>
                )}
                <button 
                  onClick={toggleSelectionMode} 
                  className={`p-2 rounded-lg border transition-all ${isSelectionMode ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'}`}
                  title="Chọn thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleMarkAllAsRead} 
                  className="p-2 rounded-lg border bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="flex border-b border-slate-200 gap-8 mb-6">
        <button
          onClick={() => setActiveTab('SYSTEM_ALERTS')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'SYSTEM_ALERTS' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" />
          Thông báo hệ thống
        </button>
        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'BROADCAST' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Gửi Broadcast
        </button>
      </div>

      {activeTab === 'SYSTEM_ALERTS' && (
        <SectionCard 
          title="Danh sách thông báo" 
          className="p-0 overflow-hidden"
          right={
            <div className="flex items-center gap-4">
              {isSelectionMode && (
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer pl-3 pr-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={selectedIds.length === systemAlerts.length && systemAlerts.length > 0}
                    onChange={handleSelectAll}
                  />
                  Chọn tất cả
                </label>
              )}
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'ALL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setFilterStatus('UNREAD')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'UNREAD' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Chưa đọc
                </button>
                <button 
                  onClick={() => setFilterStatus('READ')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === 'READ' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Đã đọc
                </button>
              </div>
            </div>
          }
        >
          {!loadingAlerts && systemAlerts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BellRing className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-lg font-bold">Không có thông báo mới.</p>
              <p className="text-slate-400 mt-1">Các thông báo về hệ thống, doanh nghiệp đăng ký và thanh toán sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {todayAlerts.length > 0 && (
                <div className="border-b border-slate-100 last:border-0">
                  <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hôm nay
                  </div>
                  <div className="divide-y divide-slate-100">
                    {todayAlerts.map(renderAlertItem)}
                  </div>
                </div>
              )}
              
              {olderAlerts.length > 0 && (
                <div className="border-b border-slate-100 last:border-0">
                  <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Trước đó
                  </div>
                  <div className="divide-y divide-slate-100">
                    {olderAlerts.map(renderAlertItem)}
                  </div>
                </div>
              )}

              {loadingAlerts && (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                </div>
              )}

              {hasMore && !loadingAlerts && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                  <button 
                    onClick={() => loadSystemAlerts(true)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Xem thêm thông báo trước đó
                  </button>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === 'BROADCAST' && (
        <div className="space-y-7 animate-in fade-in zoom-in-95 duration-200">
          <SectionCard title="Tạo thông báo mới">
            <FilterGrid>
              <InputField label="Tiêu đề (*)" value={formData.title} onChange={val => setFormData({...formData, title: val})} placeholder="Nhập tiêu đề thông báo..." />
              <SelectField label="Đối tượng (*)" value={formData.targetType} onChange={val => setFormData({...formData, targetType: val})} options={[
                { label: 'Tất cả người dùng', value: 'ALL' },
                { label: 'Tất cả Ứng viên', value: 'JOBSEEKER' },
                { label: 'Tất cả Nhà tuyển dụng', value: 'EMPLOYER' }
              ]} placeholder="Chọn đối tượng" />
              <SelectField label="Liên kết đích (Tùy chọn)" value={urlMode} onChange={val => {
                setUrlMode(val);
                if (val !== 'CUSTOM') setFormData(prev => ({ ...prev, actionUrl: val }));
                else setFormData(prev => ({ ...prev, actionUrl: '' }));
              }} options={PRESET_URLS} placeholder="Chọn liên kết..." />
              {urlMode === 'CUSTOM' && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <InputField label="Nhập URL tùy chỉnh" value={formData.actionUrl} onChange={val => setFormData({...formData, actionUrl: val})} placeholder="VD: https://google.com" />
                </div>
              )}
            </FilterGrid>
            <div className="mt-6">
              <TextAreaField label="Nội dung (*)" value={formData.message} onChange={val => setFormData({...formData, message: val})} required placeholder="Nhập nội dung chi tiết của thông báo..." rows={4} />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button disabled={loadingSubmit} onClick={handleSend} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
                {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gửi thông báo
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Lịch sử Broadcast" className="p-0 overflow-hidden">
            <SimpleTable headers={['Tiêu đề', 'Đối tượng', 'Người gửi', 'Tổng nhận', 'Thời gian gửi']}>
              {loadingList ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : broadcasts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Chưa có lịch sử Broadcast.</td></tr>
              ) : broadcasts.map((b) => (
                <tr key={b.id || b._id} className="border-t border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{b.title}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      (b.targetRole || b.targetType) === 'ALL' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      (b.targetRole || b.targetType) === 'JOBSEEKER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      (b.targetRole || b.targetType) === 'EMPLOYER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {(b.targetRole || b.targetType) === 'ALL' ? 'Tất cả người dùng' : 
                       (b.targetRole || b.targetType) === 'JOBSEEKER' ? 'Ứng viên' : 
                       (b.targetRole || b.targetType) === 'EMPLOYER' ? 'Nhà tuyển dụng' : (b.targetRole || b.targetType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold text-sm">
                    {b.admin?.name || 'Hệ thống / Admin'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {b.sentCount || b.totalRecipients || 0} người
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-sm">{new Date(b.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </SimpleTable>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
