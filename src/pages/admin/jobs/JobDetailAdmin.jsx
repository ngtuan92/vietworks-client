import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs, StatusBadge } from '../shared/AdminPrimitives';
// Nhập hàm API từ file service của bạn
import jobAdminService from '../../../services/jobAdminService'; 

const tabs = ['Job Content', 'Company', 'Applicants', 'Service Package', 'Review History', 'Violation Reports'];

// Cấu hình màu sắc cho trạng thái tin tuyển dụng
const statusMap = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  BANNED: 'bg-red-50 text-red-700 border-red-200/60',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
  DRAFT: 'bg-slate-50 text-slate-700 border-slate-200',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200/60'
};

const JobDetailAdmin = () => {
  const { jobId } = useParams(); // Lấy ID công việc từ URL
  const navigate = useNavigate();
  
  const [active, setActive] = useState(tabs[0]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API lấy dữ liệu chi tiết
  useEffect(() => {
    let isMounted = true; // Tránh cập nhật state khi component đã unmount

    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null); // Reset lại trạng thái lỗi cũ trước khi tải

        const response = await jobAdminService.getJobById(jobId);
        
        if (!isMounted) return;

        // Kiểm tra phản hồi từ backend
        if (response && response.success) {
          setJob(response.data);
        } else {
          setError(response?.message || 'Không thể định dạng dữ liệu tin tuyển dụng.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Lỗi chi tiết từ API:", err);
        
        // Bóc tách message từ Object lỗi của Axios/Backend trả về
        const backendMessage = err?.message || err?.response?.data?.message;
        const fallbackMessage = typeof err === 'string' ? err : 'Hệ thống không thể kết nối tới server.';
        
        setError(backendMessage || fallbackMessage);
      } finally {
        if (isMounted) {
          setLoading(false); // ĐẢM BẢO LUÔN ĐƯỢC CHẠY ĐỂ TẮT LOADING
        }
      }
    };

    if (jobId) {
      fetchJobDetail();
    } else {
      setError("Không tìm thấy mã ID công việc (jobId) trên URL.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Trạng thái đang tải dữ liệu
  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải chi tiết tin tuyển dụng...</div>;
  }

  // Trạng thái lỗi không tìm thấy hoặc lỗi server
  if (error || !job) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-[#0056B3] font-medium">{error || 'Không tìm thấy dữ liệu'}</div>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-600 underline">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-rise-in">
      {/* Tiêu đề trang tích hợp dữ liệu động (Đã đổi div sang span để sửa lỗi lồng thẻ HTML) */}
      <PageHeader 
        title={`Chi tiết: ${job.title}`} 
        description={
          <span className="flex flex-wrap items-center gap-3 mt-1 text-slate-600">
            <span>Người đăng: <b>{job.createdBy?.fullName || 'N/A'}</b> ({job.createdBy?.email})</span>
            <span>•</span>
            <span className="flex items-center gap-1">Trạng thái hiện tại: <StatusBadge value={job.status} map={statusMap} /></span>
          </span>
        } 
        actions={
          <>
            <ActionButton tone="primary" onClick={() => console.log('Duyệt job', job._id)}>Approve</ActionButton>
            <ActionButton tone="soft" onClick={() => console.log('Từ chối job', job._id)}>Reject</ActionButton>
            <ActionButton tone="danger" onClick={() => console.log('Khóa job', job._id)}>Ban</ActionButton>
          </>
        } 
      />
      
      {/* Thanh Tabs điều hướng */}
      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {/* TAB 1: NỘI DUNG TIN TUYỂN DỤNG */}
      {active === 'Job Content' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Thông tin chung tin tuyển dụng">
            <div className="space-y-3 text-sm text-slate-700">
              <div><b>Tiêu đề:</b> {job.title}</div>
              
              {/* Sửa lỗi hiển thị Object salary */}
              <div>
                <b>Mức lương:</b>{' '}
                {job.salary ? (
                  job.salary.type === 'NEGOTIABLE' || !job.salary.minMillion ? (
                    'Thỏa thuận'
                  ) : job.salary.maxMillion ? (
                    `${job.salary.minMillion} - ${job.salary.maxMillion} triệu ${job.salary.currency || 'VND'}`
                  ) : (
                    `Từ ${job.salary.minMillion} triệu ${job.salary.currency || 'VND'}`
                  )
                ) : (
                  'Chưa cập nhật'
                )}
              </div>

              <div><b>Kinh nghiệm:</b> {job.experienceLevelId?.name || 'Không yêu cầu'}</div>
              <div><b>Cấp bậc:</b> {job.jobLevelId?.name || 'N/A'}</div>
              <div><b>Hạn nộp hồ sơ:</b> {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
              <div><b>Ngày tạo tin:</b> {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
              <div>
                <b>Kỹ năng yêu cầu:</b>{' '}
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map(skill => (
                      <span key={skill._id} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Không có yêu cầu cụ thể</span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Phân loại ngành nghề">
            <div className="space-y-3 text-sm text-slate-700">
              <div><b>Nhóm ngành:</b> {job.careerGroupId?.name || 'N/A'}</div>
              <div><b>Ngành nghề chi tiết:</b> {job.careerId?.name || 'N/A'}</div>
              <div><b>Vị trí chuyên môn:</b> {job.careerPositionId?.name || 'N/A'}</div>
            </div>
          </SectionCard>

          <div className="md:col-span-2">
            <SectionCard title="Mô tả công việc & Yêu cầu">
              <div className="space-y-4 text-sm text-slate-700 whitespace-pre-line">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Mô tả công việc:</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">{job.description || 'Không có mô tả'}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Yêu cầu ứng viên:</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">{job.requirements || 'Không có yêu cầu'}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Quyền lợi được hưởng:</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">{job.benefits || 'Không có thông tin quyền lợi'}</div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* TAB 2: THÔNG TIN CÔNG TY ĐĂNG TIN */}
      {active === 'Company' && (
        <SectionCard title="Thông tin công ty đối tác">
          {job.companyId ? (
            <div className="flex flex-col md:flex-row gap-6">
              {job.companyId.logo && (
                <img 
                  src={job.companyId.logo} 
                  alt={job.companyId.name} 
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              )}
              <div className="space-y-2 text-sm text-slate-700 flex-1">
                <div className="text-lg font-bold text-slate-900">{job.companyId.name}</div>
                <div><b>Quy mô doanh nghiệp:</b> {job.companyId.scale || 'N/A'}</div>
                <div>
                  <b>Website: </b> 
                  {job.companyId.website ? (
                    <a href={job.companyId.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {job.companyId.website}
                    </a>
                  ) : 'N/A'}
                </div>
                <div className="pt-2">
                  <b>Giới thiệu ngắn về công ty:</b>
                  <p className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {job.companyId.description || 'Chưa cập nhật nội dung giới thiệu.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic py-4 text-center">Tin tuyển dụng này không liên kết với thông tin công ty hệ thống.</div>
          )}
        </SectionCard>
      )}

      {/* TAB 5: LỊCH SỬ KIỂM DUYỆT TIN */}
      {active === 'Review History' && (
        <SectionCard title="Lịch sử phê duyệt hệ thống">
          <SimpleTable headers={['Admin thực hiện', 'Email liên hệ', 'Trạng thái sau duyệt']}>
            {job.reviewedBy ? (
              <tr className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{job.reviewedBy.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{job.reviewedBy.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={job.status} map={statusMap} />
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-6 text-slate-400 italic">
                  Tin này đang ở trạng thái sơ khai (Chưa từng có dữ liệu xử lý log của Admin trước đó).
                </td>
              </tr>
            )}
          </SimpleTable>
        </SectionCard>
      )}

      {/* CÁC TAB KHÁC CHỜ GHÉP API THÊM */}
      {active !== 'Job Content' && active !== 'Company' && active !== 'Review History' && (
        <SectionCard title={active}>
          <div className="text-slate-500 italic py-4">
            Dữ liệu của mục <b>{active}</b> cần được populate hoặc gọi từ API truy vấn riêng biệt (Ví dụ: dữ liệu Applicants từ `Application` model).
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default JobDetailAdmin;

