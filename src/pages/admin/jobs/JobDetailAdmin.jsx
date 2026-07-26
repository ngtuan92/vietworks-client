import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs, StatusBadge } from '../shared/AdminPrimitives';
import jobAdminService from '../../../services/jobAdminService'; 

const tabs = ['Nội dung tin', 'Công ty'];

// Cấu hình màu sắc đồng bộ với key PENDING_APPROVAL trong DB
const statusMap = {
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200/60',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  BANNED: 'bg-red-50 text-red-700 border-red-200/60',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
  DRAFT: 'bg-slate-50 text-slate-700 border-slate-200',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200/60'
};

const JobDetailAdmin = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [active, setActive] = useState(tabs[0]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await jobAdminService.getJobById(jobId);
        
        if (!isMounted) return;

        if (response && response.success) {
          setJob(response.data);
        } else {
          setError(response?.message || 'Không thể định dạng dữ liệu tin tuyển dụng.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Lỗi chi tiết từ API:", err);
        const backendMessage = err?.message || err?.response?.data?.message;
        const fallbackMessage = typeof err === 'string' ? err : 'Hệ thống không thể kết nối tới server.';
        setError(backendMessage || fallbackMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
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

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải chi tiết tin tuyển dụng...</div>;
  }

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
            {/* NGHIỆP VỤ MỚI: Chỉ hiển thị nút duyệt nếu trạng thái là PENDING_APPROVAL */}
            {job.status === 'PENDING_APPROVAL' && (
              <ActionButton 
                tone="primary" 
                onClick={() => navigate(`/admin/jobs/${job._id}/review`)}
              >
                Đi đến kiểm duyệt
              </ActionButton>
            )}
            
            <ActionButton 
              tone="soft" 
              onClick={() => navigate(-1)}
            >
              Quay lại
            </ActionButton>
          </>
        }
      />
      
      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {/* TAB 1: NỘI DUNG TIN TUYỂN DỤNG */}
      {active === 'Nội dung tin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Thông tin chung tin tuyển dụng">
            <div className="space-y-3 text-sm text-slate-700">
              <div><b>Tiêu đề:</b> {job.title}</div>
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
              <div><b>Kinh nghiệm:</b> {job.experience || 'Không yêu cầu'}</div>
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
                  <div 
                    className="bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: job.description || 'Không có mô tả' }}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Yêu cầu ứng viên:</h4>
                  <div 
                    className="bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: job.requirements || 'Không có yêu cầu' }}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Quyền lợi được hưởng:</h4>
                  <div 
                    className="bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: job.benefits || 'Không có thông tin quyền lợi' }}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* TAB 2: THÔNG TIN CÔNG TY ĐĂNG TIN */}
      {active === 'Công ty' && (
        <SectionCard title="Thông tin công ty đối tác">
          {job.companyId ? (
            <div className="flex flex-col md:flex-row gap-6">
              {job.companyId.avatarUrl && (
                <img 
                  src={job.companyId.avatarUrl} 
                  alt={job.companyId.name} 
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              )}
              <div className="space-y-2 text-sm text-slate-700 flex-1">
                <div className="text-lg font-bold text-slate-900">{job.companyId.name}</div>
                <div><b>Quy mô doanh nghiệp:</b> {job.companyId.size || 'N/A'}</div>
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
                  <div 
                    className="mt-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: job.companyId.description || 'Chưa cập nhật nội dung giới thiệu.' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 italic py-4 text-center">Tin tuyển dụng này không liên kết với thông tin công ty hệ thống.</div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default JobDetailAdmin;