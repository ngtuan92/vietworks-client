import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, StatusBadge } from '../shared/AdminPrimitives';
import jobAdminService from '../../../services/jobAdminService'; 

// CẬP NHẬT: Định nghĩa chuẩn key PENDING_APPROVAL đồng bộ với DB
const statusMap = {
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200/60',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  BANNED: 'bg-red-50 text-red-700 border-red-200/60',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
  DRAFT: 'bg-slate-50 text-slate-700 border-slate-200',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200/60'
};

const JobModeration = () => {
  // CẬP NHẬT: Mặc định vừa vào trang sẽ chọn lọc trạng thái 'PENDING_APPROVAL'
  const [filters, setFilters] = useState({ 
    keyword: '', 
    status: 'PENDING_APPROVAL' 
  });
  
  const [searchTrigger, setSearchTrigger] = useState('');
  const [jobList, setJobList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchAllJobsData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTrigger || undefined, 
        status: filters.status || undefined   
      };

      const response = await jobAdminService.getAllJobsPending(params);
      if (response && response.success) {
        setJobList(response.data || []);
        setPagination(response.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách công việc toàn hệ thống:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobsData();
  }, [pagination.page, filters.status, searchTrigger]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPagination(p => ({ ...p, page: 1 })); 
    setSearchTrigger(filters.keyword); 
  };

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader 
        title="Quản lý Tin Tuyển Dụng" 
        description="Quản lý, phê duyệt, từ chối hoặc cấm các tin tuyển dụng trên toàn hệ thống." 
      />
      
      <SectionCard title="Bộ lọc tìm kiếm">
        <form onSubmit={handleSearchSubmit}>
          <FilterGrid>
            <InputField 
              label="Từ khóa (Title)" 
              value={filters.keyword} 
              onChange={(v) => setFilters((p) => ({ ...p, keyword: v }))} 
              placeholder="Nhập tiêu đề công việc..." 
            />
            <SelectField 
              label="Trạng thái tin" 
              value={filters.status} 
              onChange={(v) => {
                setFilters((p) => ({ ...p, status: v }));
                setPagination(p => ({ ...p, page: 1 })); 
              }} 
              options={[
                ['', 'Tất cả trạng thái'],
                ['PENDING_APPROVAL', 'Đang chờ duyệt'],
                ['PUBLISHED', 'Đã duyệt/Đang mở'],
                ['CLOSED', 'Đã đóng'],
                ['BANNED', 'Bị khóa'],
                ['DRAFT', 'Bản nháp'],
                ['EXPIRED', 'Hết hạn']
              ]} 
            />
            <div className="flex items-end pb-1.5">
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white rounded-xl h-[44px] px-4 font-bold text-sm hover:bg-slate-800 transition active:scale-95 shadow-sm"
              >
                Tìm kiếm
              </button>
            </div>
          </FilterGrid>
        </form>
      </SectionCard>

      {loading ? (
        <div className="text-center py-10 text-slate-500 font-medium">Đang tải danh sách công việc...</div>
      ) : (
        <>
          <SimpleTable headers={['Công việc', 'Công ty', 'Người đăng', 'Ngày tạo', 'Trạng thái', 'Hành động']}>
            {jobList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400 italic">
                  Không tìm thấy công việc nào thỏa mãn điều kiện.
                </td>
              </tr>
            ) : (
              jobList.map((job) => (
                <tr key={job._id} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">
                    {job.title}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {job.companyId?.logo && (
                        <img 
                          src={job.companyId.logo} 
                          alt="logo" 
                          className="w-6 h-6 rounded-md object-cover border border-slate-100" 
                        />
                      )}
                      <span className="truncate max-w-[150px]">
                        {job.companyId?.name || <span className="text-slate-400 italic">N/A</span>}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="font-medium">{job.createdBy?.fullName || 'Hệ thống'}</div>
                    <div className="text-xs text-slate-400">{job.createdBy?.email}</div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  
                  <td className="px-4 py-3">
                    <StatusBadge value={job.status} map={statusMap} />
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/admin/jobs/${job._id}`} 
                        className="rounded-xl border border-slate-200 bg-white shadow-sm px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition active:scale-95 whitespace-nowrap"
                      >
                        Chi tiết
                      </Link>
                      
                      {/* NGHIỆP VỤ MỚI: Chỉ hiển thị nút Duyệt nếu trạng thái là PENDING_APPROVAL */}
                      {job.status === 'PENDING_APPROVAL' && (
                        <Link 
                          to={`/admin/jobs/${job._id}/review`} 
                          className="rounded-xl bg-slate-900 shadow-sm px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95 whitespace-nowrap"
                        >
                          Duyệt
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </SimpleTable>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 px-2">
              <div className="text-xs text-slate-500">
                Hiển thị bản ghi từ {((pagination.page - 1) * pagination.limit) + 1} đến {Math.min(pagination.page * pagination.limit, pagination.total)} trên tổng số {pagination.total} công việc.
              </div>
              <div className="flex items-center gap-1">
                <button 
                  type="button"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition"
                >
                  Trước
                </button>
                <div className="px-3 text-xs font-semibold text-slate-700">
                  Trang {pagination.page} / {pagination.pages}
                </div>
                <button 
                  type="button"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobModeration;