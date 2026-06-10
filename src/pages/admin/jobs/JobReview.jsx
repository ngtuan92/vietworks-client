import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionButton, ModalShell, PageHeader, SectionCard, TextAreaField } from '../shared/AdminPrimitives';
import jobAdminService from '../../../services/jobAdminService'; 

const checks = [
  'Company is verified',
  'Job title is clear',
  'Salary looks reasonable',
  'Description is complete',
  'Requirements are acceptable',
  'Location is clear',
  'No scam / MLM signal',
  'No platform policy violation',
];

const JobReview = () => {
  const { jobId } = useParams(); // Lấy ID từ URL tuyến đường /admin/jobs/:jobId/review
  const navigate = useNavigate();

  // Quản lý checklists và modals
  const [checked, setChecked] = useState(() => Object.fromEntries(checks.map((item) => [item, false])));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  
  // Quản lý nội dung text nhập vào
  const [reason, setReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  // Quản lý dữ liệu tin tuyển dụng cần preview
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Tự động tải dữ liệu thực tế của job lên màn hình preview
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

  // Kiểm tra xem người kiểm duyệt đã tích chọn toàn bộ checklist chưa
  const isAllChecked = checks.every((item) => checked[item]);

  // 2. Xử lý hành động PHÊ DUYỆT (Approve)
  const handleApprove = async () => {
    if (!isAllChecked) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.approveJob(jobId, 'Đạt yêu cầu qua bảng danh sách kiểm duyệt hệ thống.');
      if (response.success) {
        alert('Phê duyệt tin tuyển dụng thành công!');
        navigate('/admin/jobs'); // Điều hướng về trang danh sách kiểm duyệt
      }
    } catch (err) {
      alert('Lỗi phê duyệt: ' + (err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Xử lý hành động TỪ CHỐI (Reject)
  const handleRejectSubmit = async () => {
    if (!reason) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.rejectJob(jobId, reason, reviewNote || reason);
      if (response.success) {
        alert('Đã từ chối duyệt tin. Tin tuyển dụng chuyển về dạng bản nháp!');
        setRejectOpen(false);
        navigate('/admin/jobs');
      }
    } catch (err) {
      alert('Lỗi từ chối duyệt: ' + (err?.message || 'Hệ thống trục trặc.'));
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xử lý hành động KHÓA TIN (Ban)
  const handleBanSubmit = async () => {
    if (!reason) return;
    try {
      setSubmitting(true);
      const response = await jobAdminService.banJob(jobId, reason);
      if (response.success) {
        alert('Đã khóa tin tuyển dụng thành công do vi phạm điều khoản!');
        setBanOpen(false);
        navigate('/admin/jobs');
      }
    } catch (err) {
      alert('Lỗi khi khóa tin: ' + (err?.message || 'Hệ thống trục trặc.'));
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
        <div className="text-[#0056B3] font-medium">{error || 'Không tồn tại tin tuyển dụng.'}</div>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-600 underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader 
        title="Review Job Posting" 
        description={`Đang kiểm duyệt hồ sơ: ID ${job._id} • Trạng thái hiện tại: ${job.status}`} 
      />
      
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        {/* KHU VỰC PREVIEW DỮ LIỆU ĐỘNG TỪ BACKEND */}
        <SectionCard title="Candidate-side preview">
          <div className="space-y-4 rounded-[2rem] border border-slate-200/60 shadow-sm p-6 bg-white">
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

        {/* BẢNG ĐIỀU KHIỂN & CHECKLIST MODERATION */}
        <SectionCard title="Moderation checklist">
          <p className="text-xs text-slate-400 mb-4 font-medium italic">Lưu ý: Bạn phải tích xác nhận toàn bộ checklist mới có thể kích hoạt quyền Approve tin này lên hệ thống.</p>
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

          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton 
              tone="primary" 
              disabled={!isAllChecked || submitting} 
              onClick={handleApprove}
            >
              {submitting ? 'Processing...' : 'Approve'}
            </ActionButton>
            
            <ActionButton 
              tone="soft" 
              disabled={submitting} 
              onClick={() => { setReason(''); setRejectOpen(true); }}
            >
              Reject
            </ActionButton>
            
            <ActionButton 
              tone="danger" 
              disabled={submitting} 
              onClick={() => { setReason(''); setBanOpen(true); }}
            >
              Ban Job
            </ActionButton>
          </div>
        </SectionCard>
      </div>

      {/* MODAL TỪ CHỐI DUYỆT (REJECT) */}
      {rejectOpen && (
        <ModalShell 
          title="Reject Job Posting" 
          onClose={() => setRejectOpen(false)} 
          footer={
            <>
              <ActionButton onClick={() => setRejectOpen(false)}>Cancel</ActionButton>
              <ActionButton tone="danger" disabled={!reason || submitting} onClick={handleRejectSubmit}>
                Confirm reject
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

      {/* MODAL KHÓA TIN (BAN) */}
      {banOpen && (
        <ModalShell 
          title="Ban Job (Violation Violation)" 
          onClose={() => setBanOpen(false)} 
          footer={
            <>
              <ActionButton onClick={() => setBanOpen(false)}>Cancel</ActionButton>
              <ActionButton tone="danger" disabled={!reason || submitting} onClick={handleBanSubmit}>
                Confirm ban
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

