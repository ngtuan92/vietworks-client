import { useState, useEffect } from 'react';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField, ActionButton } from '../shared/AdminPrimitives';
import { Send, BellRing, Loader2 } from 'lucide-react';
import adminNotificationService from '../../../services/adminNotificationService';

const NotificationCenter = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'ALL',
    actionUrl: ''
  });

  const loadBroadcasts = async () => {
    try {
      setLoadingList(true);
      const res = await adminNotificationService.getBroadcasts({ limit: 10 });
      setBroadcasts(res.data?.broadcasts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    try {
      setLoadingSubmit(true);
      setError(''); setSuccess('');
      await adminNotificationService.sendBroadcast({
        title: formData.title,
        message: formData.message,
        targetType: formData.targetType,
        actionUrl: formData.actionUrl
      });
      setSuccess('Đã gửi thông báo hàng loạt thành công!');
      setFormData({ title: '', message: '', targetType: 'ALL', actionUrl: '' });
      loadBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi thông báo');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader 
        title="Quản lý Thông báo" 
        description="Gửi và quản lý thông báo hàng loạt hoặc cá nhân qua Web và Email." 
        actions={
          <ActionButton tone="primary">
            <span className="flex items-center gap-1.5"><BellRing className="w-4 h-4" /> Báo cáo hiệu suất</span>
          </ActionButton>
        }
      />

      <SectionCard title="Tạo thông báo mới (Broadcast)">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold">{success}</div>}
        
        <FilterGrid>
          <InputField label="Tiêu đề (*)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tiêu đề thông báo..." />
          <SelectField label="Đối tượng (*)" value={formData.targetType} onChange={e => setFormData({...formData, targetType: e.target.value})} options={[
            { label: 'Tất cả người dùng', value: 'ALL' },
            { label: 'Tất cả Ứng viên', value: 'JOBSEEKER' },
            { label: 'Tất cả Nhà tuyển dụng', value: 'EMPLOYER' }
          ]} placeholder="Chọn đối tượng" />
          <InputField label="Liên kết (URL) tùy chọn" value={formData.actionUrl} onChange={e => setFormData({...formData, actionUrl: e.target.value})} placeholder="VD: /jobs/123" />
        </FilterGrid>
        <div className="mt-6">
          <TextAreaField label="Nội dung (*)" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required placeholder="Nhập nội dung chi tiết của thông báo..." rows={4} />
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
                <span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {b.targetType}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-700 font-bold text-sm">{b.admin?.name || b.adminId || 'Admin'}</td>
              <td className="px-6 py-4 font-semibold text-slate-800">{b.totalRecipients || 0}</td>
              <td className="px-6 py-4 text-slate-500 font-medium text-sm">{new Date(b.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </SimpleTable>
      </SectionCard>
    </div>
  );
};

export default NotificationCenter;
