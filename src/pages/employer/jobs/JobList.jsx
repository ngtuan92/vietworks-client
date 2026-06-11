import React, { useState, useEffect } from 'react';
import { Eye, Send, Trash2, Plus } from 'lucide-react';
import jobService from '../../../services/jobService'; // Đường dẫn tới file API của bạn
import JobDetailModal from './JobDetailModal';

// Ánh xạ màu sắc và text hiển thị tiếng Việt tương ứng cho từng trạng thái
const statusMeta = {
  DRAFT: {
    label: 'Bản nháp',
    className: 'bg-slate-100 text-slate-700 border border-slate-200'
  },
  PENDING_APPROVAL: {
    label: 'Chờ duyệt',
    className: 'bg-amber-50 text-amber-700 border border-amber-200'
  },
  PUBLISHED: {
    label: 'Đang hiển thị',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  },
  EXPIRED: {
    label: 'Hết hạn',
    className: 'bg-orange-50 text-orange-700 border border-orange-200'
  },
  CLOSED: {
    label: 'Đã đóng',
    className: 'bg-slate-200 text-slate-600'
  },
  BANNED: {
    label: 'Vi phạm/Khóa',
    className: 'bg-red-50 text-red-700 border border-red-200'
  },
  LOCKED: {
    label: 'Đã khóa',
    className: 'bg-red-50 text-red-700 border border-red-200'
  }
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null); // Quản lý job đang xem chi tiết

  // State lưu bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    package: '',
    createdAtFrom: '',
    createdAtTo: '',
    deadlineFrom: '',
    deadlineTo: '',
    page: 1,
    limit: 10
  });

  const formatSalary = (salaryField) => {
    // Nếu không có dữ liệu lương
    if (!salaryField) return 'Thỏa thuận';
    
    // Nếu backend trả về Object theo cấu trúc trong thông báo lỗi
    if (typeof salaryField === 'object') {
      const { type, minMillion, maxMillion, currency } = salaryField;
      
      if (minMillion && maxMillion) {
        return `${minMillion} - ${maxMillion} triệu ${currency || 'VND'}`;
      } else if (minMillion) {
        return `Từ ${minMillion} triệu ${currency || 'VND'}`;
      } else if (maxMillion) {
        return `Đến ${maxMillion} triệu ${currency || 'VND'}`;
      }
      return 'Thỏa thuận';
    }

    // Nếu backend trả về String sẵn thì in ra luôn
    return salaryField;
  };

  // Hàm fetch data từ API getMyJobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Chuẩn hóa params gửi lên backend theo đúng cấu trúc API query
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status })
        // Bạn có thể mở rộng backend để nhận thêm search, location... nếu cần
      };

      const response = await jobService.getMyJobs(params);
      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      alert('Không thể tải danh sách công việc: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters.page, filters.status]); // Tự động gọi lại khi đổi trang hoặc đổi nhanh trạng thái

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 })); // Reset về trang 1 khi lọc
  };

  // Xử lý Gửi duyệt nhanh tại hàng
  const handleSubmitReview = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn gửi duyệt tin này không?')) return;
    try {
      await jobService.submitJobForReview(jobId);
      alert('Gửi duyệt thành công!');
      fetchJobs();
    } catch (error) {
      alert('Gửi duyệt thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý Xóa nhanh tại hàng
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin nháp này không? Hành động này không thể hoàn tác.')) return;
    try {
      await jobService.deleteJob(jobId);
      alert('Xóa tin tuyển dụng thành công!');
      fetchJobs();
    } catch (error) {
      alert('Xóa thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách tin tuyển dụng</h1>
          <p className="text-slate-600 mt-1">Quản lý toàn bộ Job của công ty theo trạng thái và hiệu quả tuyển dụng.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
          <Plus className="w-5 h-5" />
          Tạo tin mới
        </button>
      </div>

      {/* Khu vực Bộ lọc (Filters) */}
      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa</label>
            <input 
              type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tên job..." className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
            <select 
              value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary bg-white text-slate-800"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.keys(statusMeta).map(st => (
                <option key={st} value={st}>{statusMeta[st].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Địa điểm</label>
            <select 
              value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary bg-white text-slate-800"
            >
              <option value="">Chọn địa điểm...</option>
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loại tin</label>
            <select 
              value={filters.package} onChange={(e) => handleFilterChange('package', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary bg-white text-slate-800"
            >
              <option value="">Chọn loại tin...</option>
              <option value="Thường">Thường</option>
              <option value="Nổi bật">Nổi bật</option>
              <option value="GẤP">GẤP</option>
            </select>
          </div>
        </div>
        
        {/* Nút tìm kiếm thủ công nếu cần kích hoạt toàn bộ filter cùng lúc */}
        <div className="flex justify-end mt-4">
          <button onClick={fetchJobs} className="px-4 py-2 bg-slate-800 text-white font-medium text-sm rounded-lg hover:bg-slate-700">
            Áp dụng bộ lọc
          </button>
        </div>
      </section>

      {/* Bảng danh sách Job */}
      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                {['Tên tin tuyển dụng', 'Trạng thái', 'Mức lương', 'Hạn nộp', 'Ngày tạo', 'Hành động'].map((head) => (
                  <th key={head} className="text-left px-5 py-3.5 font-semibold whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">Không tìm thấy tin tuyển dụng nào phù hợp.</td>
                </tr>
              ) : (
                jobs.map((job) => {
                  // Lấy dữ liệu giao diện cấu hình tương ứng cho status của bản ghi hiện tại
                  const currentStatus = statusMeta[job.status] || { label: job.status, className: 'bg-slate-100 text-slate-700' };
                  
                  return (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 max-w-[300px]">
                        <div className="font-semibold text-slate-900 truncate">{job.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">ID: {job._id}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${currentStatus.className}`}>
                          {currentStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                        {formatSalary(job.salary)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center gap-2">
                          {/* Nút Xem chi tiết luôn xuất hiện ở mọi status */}
                          <button 
                            onClick={() => setSelectedJobId(job._id)}
                            title="Xem chi tiết"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Các hành động đặc quyền cho DRAFT */}
                          {job.status === 'DRAFT' && (
                            <>
                              <button 
                                onClick={() => handleSubmitReview(job._id)}
                                title="Gửi duyệt"
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteJob(job._id)}
                                title="Xóa"
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang */}
        {pagination.pages > 1 && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Hiển thị bản ghi từ hệ thống (Tổng số: {pagination.total})</span>
            <div className="flex gap-1">
              <button 
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm font-medium text-slate-700">Trang {filters.page} / {pagination.pages}</span>
              <button 
                disabled={filters.page === pagination.pages}
                onClick={() => handleFilterChange('page', filters.page + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Render Modal chi tiết khi click */}
      {selectedJobId && (
        <JobDetailModal 
          jobId={selectedJobId} 
          onClose={() => setSelectedJobId(null)} 
          onSuccess={() => {
            setSelectedJobId(null);
            fetchJobs(); // Làm mới danh sách khi có thay đổi từ modal
          }}
        />
      )}
    </div>
  );
};

export default JobList;