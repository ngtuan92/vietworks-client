import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionButton, ModalShell, PageHeader, SectionCard, TextAreaField } from '../shared/AdminPrimitives';
import jobAdminService from '../../../services/jobAdminService'; 
import { useNotification } from '../../../contexts/NotificationContext';

const checks = [
  'Công ty đã được xác minh',
  'Tiêu đề công việc rõ ràng',
  'Mức lương hợp lý',
  'Mô tả công việc đầy đủ',
  'Yêu cầu công việc phù hợp',
  'Địa điểm làm việc rõ ràng',
  'Không có dấu hiệu lừa đảo / Đa cấp',
  'Không vi phạm chính sách nền tảng',
];

const JobReview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const [checked, setChecked] = useState(() => Object.fromEntries(checks.map((item) => [item, false])));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  
  const [reason, setReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await jobAdminService.getJobById(jobId);
        if (response && response.success) {
          setJob(response.data);
        } else {
          setError(response?.message || 'Không thể lấy thông tin tin tuyển dụng này.');
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết tin duyệt:", err);
        setError(err?.response?.data?.message || err?.message || 'Lỗi kết nối hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobDetail();
  }, [jobId]);

  const toggle = (item) => setChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  const isAllChecked = checks.every((item) => checked[item]);

  const handleApprove = async () => {
    if (!isAllChecked) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.approveJob(jobId, 'Đạt yêu cầu qua bảng danh sách kiểm duyệt hệ thống.');
      if (response.success) {
        success('Phê duyệt tin tuyển dụng thành công!');
        navigate('/admin/jobs');
      }
    } catch (err) {
      notifyError('Lỗi phê duyệt: ' + (err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!reason) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.rejectJob(jobId, reason, reviewNote || reason);
      if (response.success) {
        success('Đã từ chối duyệt tin. Tin tuyển dụng chuyển về dạng bản nháp!');
        setRejectOpen(false);
        navigate('/admin/jobs');
      }
    } catch (err) {
      notifyError('Lỗi từ chối duyệt: ' + (err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanSubmit = async () => {
    if (!reason) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.banJob(jobId, reason);
      if (response.success) {
        success('Đã khóa tin tuyển dụng thành công do vi phạm điều khoản!');
        setBanOpen(false);
        navigate('/admin/jobs');
      }
    } catch (err) {
      notifyError('Lỗi khi khóa tin: ' + (err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải thông tin kết cấu kiểm duyệt...</div>;
  }

  if (error || !job) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-primary font-medium">{error || 'Không tồn tại tin tuyển dụng.'}</div>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-600 underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10 animate-rise-in max-w-7xl mx-auto">
      <PageHeader 
        title="Duyệt Tin Tuyển Dụng" 
        description={`Đang kiểm duyệt hồ sơ: ID ${job._id} • Trạng thái hiện tại: ${job.status}`} 
      />
      
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        <SectionCard title="Xem trước giao diện Ứng viên">
          <div className="space-y-4 rounded-2xl border border-slate-200/60 shadow-sm p-6 bg-white">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>
              {job.salary && (
                <span className="text-blue-700 font-semibold text-lg">
                  {job.salary.type === 'NEGOTIABLE' 
                    ? 'Thỏa thuận' 
                    : `${job.salary.minMillion} - ${job.salary.maxMillion} triệu VND`}
                </span>
              )}
            </div>

            <div className="text-sm text-slate-600 space-y-1">
              <div><b>Công ty:</b> {job.companyId?.name || 'N/A'}</div>
              <div><b>Cấp bậc:</b> {job.jobLevelId?.name || 'N/A'} • <b>Kinh nghiệm:</b> {job.experienceLevelId?.name || 'Không yêu cầu'}</div>
              <div><b>Hạn nộp:</b> {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h4 className="mb-2 font-semibold text-slate-900 text-sm">Mô tả công việc</h4>
              <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                {job.description || 'Không có mô tả chi tiết'}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-slate-900 text-sm">Yêu cầu ứng viên</h4>
              <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                {job.requirements || 'Không có yêu cầu cụ thể'}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Danh sách kiểm duyệt">
          <p className="text-xs text-slate-400 mb-4 font-medium italic">Lưu ý: Bạn phải tích xác nhận toàn bộ checklist mới có thể kích hoạt quyền Phê duyệt tin này lên hệ thống.</p>
          <div className="space-y-3">
            {checks.map((item) => (
              <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-200/60 shadow-sm px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:shadow-md cursor-pointer transition-all active:scale-[0.98]">
                <input 
                  type="checkbox" 
                  checked={checked[item]} 
                  onChange={() => toggle(item)} 
                  className="mt-1 rounded border-slate-300 text-slate-800 focus:ring-slate-500" 
                />
                <span className={checked[item] ? "line-through text-slate-400" : ""}>{item}</span>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            <ActionButton 
              tone="primary" 
              disabled={!isAllChecked || submitting} 
              onClick={handleApprove}
            >
              {submitting ? 'Đang xử lý...' : 'Phê duyệt'}
            </ActionButton>
            
            <ActionButton 
              tone="soft" 
              disabled={submitting} 
              onClick={() => { setReason(''); setRejectOpen(true); }}
            >
              Từ chối duyệt
            </ActionButton>
            
            <ActionButton 
              tone="danger" 
              disabled={submitting} 
              onClick={() => { setReason(''); setBanOpen(true); }}
            >
              Khóa tin vi phạm
            </ActionButton>
          </div>
        </SectionCard>
      </div>

      {rejectOpen && (
        <ModalShell 
          title="Từ chối đăng tin" 
          onClose={() => setRejectOpen(false)} 
          footer={
            <>
              <ActionButton onClick={() => setRejectOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="danger" disabled={!reason || submitting} onClick={handleRejectSubmit}>
                Xác nhận từ chối
              </ActionButton>
            </>
          }
        >
          <div className="space-y-4">
            <TextAreaField 
              label="Lý do từ chối đăng tin (Bắt buộc - Gửi tới NTD)" 
              required 
              value={reason} 
              onChange={setReason} 
              placeholder="Giải thích rõ lý do không duyệt (ví dụ: Thiếu thông tin liên hệ, sai chính tả...) để nhà tuyển dụng chỉnh sửa lại." 
            />
            <TextAreaField 
              label="Ghi chú nội bộ hệ thống (Không bắt buộc)" 
              value={reviewNote} 
              onChange={setReviewNote} 
              placeholder="Log lưu lại cho các Admin khác đọc..." 
            />
          </div>
        </ModalShell>
      )}

      {banOpen && (
        <ModalShell 
          title="Khóa tin vi phạm nền tảng" 
          onClose={() => setBanOpen(false)} 
          footer={
            <>
              <ActionButton onClick={() => setBanOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="danger" disabled={!reason || submitting} onClick={handleBanSubmit}>
                Xác nhận khóa
              </ActionButton>
            </>
          }
        >
          <TextAreaField 
            label="Lý do khóa tin tuyển dụng (Bắt buộc)" 
            required 
            value={reason} 
            onChange={setReason} 
            placeholder="Mô tả chi tiết hành vi vi phạm (Ví dụ: lừa đảo, đa cấp, chứa nội dung độc hại...) để lưu hệ thống." 
          />
        </ModalShell>
      )}
    </div>
  );
};

export default JobReview;
