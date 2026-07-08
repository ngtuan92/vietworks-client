import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionButton, ModalShell, PageHeader, SectionCard, TextAreaField, StatusBadge } from '../shared/AdminPrimitives';
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
    if (!isAllChecked) {
      notifyError('Vui lòng xác nhận tất cả các mục trong danh sách kiểm duyệt!');
      return;
    }

    try {
      setSubmitting(true);
      
      // Kiểm tra dữ liệu job trước khi duyệt
      if (!job || !job.experience) {
        notifyError('Tin tuyển dụng thiếu thông tin kinh nghiệm. Vui lòng yêu cầu nhà tuyển dụng cập nhật!');
        return;
      }

      const response = await jobAdminService.approveJob(jobId, 'Đạt yêu cầu qua bảng danh sách kiểm duyệt hệ thống.');
      
      if (response.success) {
        success('Phê duyệt tin tuyển dụng thành công!');
        navigate('/admin/jobs');
      } else {
        notifyError(response?.message || 'Phê duyệt thất bại!');
      }
    } catch (err) {
      console.error('Approve error:', err);
      
      // Xử lý lỗi validation từ mongoose
      let errorMessage = 'Lỗi phê duyệt: ';
      if (err?.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err?.message) {
        if (err.message.includes('validation failed')) {
          // Parse lỗi validation
          const match = err.message.match(/Path `(\w+)` is required/);
          if (match) {
            const field = match[1];
            const fieldMap = {
              'experience': 'Kinh nghiệm',
              'title': 'Tiêu đề',
              'description': 'Mô tả công việc',
              'requirements': 'Yêu cầu',
              'benefits': 'Quyền lợi',
              'workingTime': 'Thời gian làm việc',
              'applyInstruction': 'Hướng dẫn ứng tuyển',
              'deadline': 'Hạn nộp'
            };
            errorMessage += `Thiếu trường bắt buộc: ${fieldMap[field] || field}. Vui lòng yêu cầu nhà tuyển dụng cập nhật!`;
          } else {
            errorMessage += 'Dữ liệu tin tuyển dụng không đầy đủ. Vui lòng kiểm tra lại!';
          }
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Hệ thống trục trặc. Vui lòng thử lại sau!';
      }
      
      notifyError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!reason) {
      notifyError('Vui lòng nhập lý do từ chối!');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await jobAdminService.rejectJob(jobId, reason, reviewNote || reason);
      if (response.success) {
        success('Đã từ chối duyệt tin. Tin tuyển dụng chuyển về dạng bản nháp!');
        setRejectOpen(false);
        navigate('/admin/jobs');
      } else {
        notifyError(response?.message || 'Từ chối thất bại!');
      }
    } catch (err) {
      console.error('Reject error:', err);
      notifyError('Lỗi từ chối duyệt: ' + (err?.response?.data?.message || err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBanSubmit = async () => {
    if (!reason) {
      notifyError('Vui lòng nhập lý do khóa tin!');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await jobAdminService.banJob(jobId, reason);
      if (response.success) {
        success('Đã khóa tin tuyển dụng thành công do vi phạm điều khoản!');
        setBanOpen(false);
        navigate('/admin/jobs');
      } else {
        notifyError(response?.message || 'Khóa tin thất bại!');
      }
    } catch (err) {
      console.error('Ban error:', err);
      notifyError('Lỗi khi khóa tin: ' + (err?.response?.data?.message || err?.message || 'Hệ thống trục trặc.'));
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
        description={
          <span className="flex items-center gap-2 mt-1">
            Đang kiểm duyệt hồ sơ: ID {job._id} • Trạng thái hiện tại: <StatusBadge value={job.status} />
          </span>
        } 
      />
      
      {/* Hiển thị cảnh báo nếu thiếu thông tin */}
      {(!job.experience || !job.description || !job.requirements) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Tin tuyển dụng thiếu thông tin bắt buộc!</p>
              <ul className="text-sm mt-1 list-disc list-inside">
                {!job.experience && <li>Thiếu kinh nghiệm</li>}
                {!job.description && <li>Thiếu mô tả công việc</li>}
                {!job.requirements && <li>Thiếu yêu cầu công việc</li>}
                {!job.benefits && <li>Thiếu quyền lợi</li>}
                {!job.workingTime && <li>Thiếu thời gian làm việc</li>}
                {!job.applyInstruction && <li>Thiếu hướng dẫn ứng tuyển</li>}
                {!job.deadline && <li>Thiếu hạn nộp</li>}
              </ul>
              <p className="text-sm mt-2">Vui lòng yêu cầu nhà tuyển dụng cập nhật đầy đủ thông tin trước khi phê duyệt.</p>
            </div>
          </div>
        </div>
      )}
      
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
              <div><b>Cấp bậc:</b> {job.jobLevelId?.name || 'N/A'} • <b>Kinh nghiệm:</b> {job.experience || 'Không yêu cầu'}</div>
              <div><b>Hạn nộp:</b> {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
            </div>

            <hr className="border-slate-100" />

            {job.description && (
              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-sm">Mô tả công việc</h4>
                <div 
                  className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            )}

            {job.requirements && (
              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-sm">Yêu cầu ứng viên</h4>
                <div 
                  className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}

            {job.benefits && (
              <div>
                <h4 className="mb-2 font-semibold text-slate-900 text-sm">Quyền lợi</h4>
                <div 
                  className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </div>
            )}
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
              disabled={!isAllChecked || submitting || !job.experience || !job.description || !job.requirements} 
              onClick={handleApprove}
              title={
                !job.experience || !job.description || !job.requirements 
                  ? 'Tin tuyển dụng thiếu thông tin bắt buộc' 
                  : ''
              }
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

          {/* Hiển thị lý do không thể duyệt */}
          {(!job.experience || !job.description || !job.requirements) && (
            <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              ⚠️ Không thể phê duyệt vì tin tuyển dụng thiếu thông tin bắt buộc. Vui lòng từ chối hoặc yêu cầu cập nhật.
            </div>
          )}
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