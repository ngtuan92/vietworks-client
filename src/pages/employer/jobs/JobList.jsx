import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Send, Trash2, Plus, X, RefreshCw, AlertTriangle } from 'lucide-react';
import jobService from '../../../services/jobService';
import companyLocationService from '../../../services/companyLocationService';
import JobDetailModal from './JobDetailModal';
import employerCompanyService from '../../../services/employerCompanyService';
import { useNotification } from '../../../contexts/NotificationContext';

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

  REJECTED: {
    label: 'Từ chối',
    className: 'bg-red-50 text-red-700 border border-red-200'
  }
};


const visibleStatusFilters = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'EXPIRED', 'CLOSED', 'REJECTED'];
const JobList = () => {
  const navigate = useNavigate();
  const { confirm, success, error } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // State lưu bộ lọc tìm kiếm
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    package: '',
    isUrgent: '',
    page: 1,
    limit: 10
  });

  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    employerCompanyService.getMyCompanyProfile()
      .then(res => {
        if (res?.data) {
          setVerificationStatus(res.data.verificationStatus);
        }
      })
      .catch(console.error);
  }, []);

  const formatSalary = (salaryField) => {
    if (!salaryField) return 'Thỏa thuận';

    if (typeof salaryField === 'object') {
      const { minMillion, maxMillion, currency } = salaryField;

      if (minMillion && maxMillion) {
        return `${minMillion} - ${maxMillion} triệu ${currency || 'VND'}`;
      } else if (minMillion) {
        return `Từ ${minMillion} triệu ${currency || 'VND'}`;
      } else if (maxMillion) {
        return `Đến ${maxMillion} triệu ${currency || 'VND'}`;
      }
      return 'Thỏa thuận';
    }
    return salaryField;
  };

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.package && { package: filters.package }),
        ...(filters.isUrgent && { isUrgent: filters.isUrgent === 'true' })
      };

      console.log('Fetching jobs with params:', params); // Debug

      const response = await jobService.getMyJobs(params);
      console.log('Response:', response); // Debug

      if (response.success) {
        setJobs(response.data || []);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || response.pagination?.pages || 1
        });
      } else {
        error(response.message || 'Không thể tải danh sách công việc');
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
      error('Không thể tải danh sách công việc: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  }, [filters, error]);

  useEffect(() => {
    Promise.resolve().then(fetchJobs);
  }, [fetchJobs]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await companyLocationService.getProvinces();
        setProvinces(res || []);
      } catch (err) {
        console.error('Lỗi khi tải tỉnh/thành', err);
      }
    };
    fetchProvinces();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSubmitReview = async (jobId) => {
    confirm('Bạn có chắc muốn gửi duyệt tin này không?', async () => {
      try {
        await jobService.submitJobForReview(jobId);
        success('Gửi duyệt thành công!');
        fetchJobs();
      } catch (err) {
        error('Gửi duyệt thất bại: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleDeleteJob = async (jobId) => {
    confirm('Bạn có chắc chắn muốn xóa tin nháp này không? Hành động này không thể hoàn tác.', async () => {
      try {
        await jobService.deleteJob(jobId);
        success('Xóa tin tuyển dụng thành công!');
        fetchJobs();
      } catch (err) {
        error('Xóa thất bại: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleCloseJob = async (jobId) => {
    confirm('Bạn có chắc muốn đóng tin tuyển dụng này? Job sẽ không còn hiển thị công khai.', async () => {
      try {
        await jobService.closeJob(jobId);
        success('Đóng tin tuyển dụng thành công!');
        fetchJobs();
      } catch (err) {
        error('Đóng thất bại: ' + (err.response?.data?.message || err.message));
      }
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      location: '',
      package: '',
      isUrgent: '',
      page: 1,
      limit: 10
    });
    setSearchTerm('');
  };

  const renderStatusBadge = (status) => {
    const meta = statusMeta[status] || {
      label: status || 'Không xác định',
      className: 'bg-slate-100 text-slate-700 border border-slate-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.className}`}>
        {meta.label}
      </span>
    );
  };

  const renderReasonText = (job) => {
    if (job.status === 'REJECTED' && job.rejectedReason) {
      return (
        <div className="flex items-start gap-1 text-xs text-red-600 mt-1.5 max-w-[200px] whitespace-normal bg-red-50 p-2 rounded-lg border border-red-100">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
          <span className="leading-relaxed">
            <strong>Lý do từ chối:</strong> {job.rejectedReason}
          </span>
        </div>
      );
    }

    if (job.status === 'BANNED' && job.bannedReason) {
      return (
        <div className="flex items-start gap-1 text-xs text-red-600 mt-1.5 max-w-[200px] whitespace-normal bg-red-50 p-2 rounded-lg border border-red-100">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
          <span className="leading-relaxed">
            <strong>Lý do khóa:</strong> {job.bannedReason}
          </span>
        </div>
      );
    }

    return null;
  };

  // Render job tags and package info
  const renderJobTagsAndInfo = (job) => {
    const items = [];

    // Urgent badge
    if (job.isUrgent) {
      items.push(
        <span
          key="urgent"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm shrink-0 animate-pulse"
        >
          Gấp
        </span>
      );
    }

    // Package info
    if (job.activeBoost) {
      items.push(
        <span key="package" className="text-[11px] text-amber-700 font-semibold shrink-0">
          {job.activeBoost.packageName} • Còn {job.activeBoost.daysRemaining} ngày
        </span>
      );
    }

    return items.length > 0 ? (
      <div className="flex items-center gap-2 flex-wrap mt-1">
        {items}
      </div>
    ) : null;
  };

  // Render pagination
  const renderPagination = () => {
    const { page, totalPages, total, limit } = pagination;

    if (totalPages <= 1) return null;

    // Tính toán range hiển thị
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Tạo mảng số trang hiển thị
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (page <= 3) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (page >= totalPages - 2) {
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          for (let i = page - 2; i <= page + 2; i++) {
            pages.push(i);
          }
        }
      }
      return pages;
    };

    return (
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-slate-500">
          Hiển thị {startItem} - {endItem} trong tổng số {total} tin
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Trước
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${page === pageNum
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách tin tuyển dụng</h1>
          <p className="text-slate-600 mt-1">Quản lý toàn bộ Job của công ty theo trạng thái và hiệu quả tuyển dụng.</p>
        </div>
        <button
          onClick={() => {
            if (verificationStatus !== 'VERIFIED') {
              error('Tài khoản công ty chưa được xác thực. Vui lòng xác thực công ty trước khi tạo tin tuyển dụng.');
              return;
            }
            navigate('/employer/jobs/create');
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Plus className="w-5 h-5" />
          Tạo tin mới
        </button>
      </div>

      {/* Bộ lọc */}
      <section className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên job..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-slate-800"
            >
              <option value="">Tất cả trạng thái</option>
              {visibleStatusFilters.map(st => (
                <option key={st} value={st}>{statusMeta[st].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Địa điểm</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-slate-800"
            >
              <option value="">Chọn địa điểm...</option>
              {provinces.map((prov) => {
                const val = prov.name || prov.provinceName;
                return (
                  <option key={prov.code || prov.provinceCode || val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loại tin</label>
            <select
              value={filters.package}
              onChange={(e) => handleFilterChange('package', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-slate-800"
            >
              <option value="">Chọn loại tin...</option>
              <option value="Thường">Thường</option>
              <option value="GẤP">GẤP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tuyển gấp</label>
            <select
              value={filters.isUrgent}
              onChange={(e) => handleFilterChange('isUrgent', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-slate-800"
            >
              <option value="">Tất cả</option>
              <option value="true">Có tuyển gấp</option>
              <option value="false">Không tuyển gấp</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4 gap-2">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset bộ lọc
          </button>
        </div>
      </section>

      {/* Bảng danh sách Job */}
      <section className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                {['Tên tin tuyển dụng', 'Trạng thái', 'Tiến độ tuyển', 'Mức lương', 'Hạn nộp', 'Ngày tạo', 'Hành động'].map((head) => (
                  <th key={head} className="text-left px-5 py-3.5 font-semibold whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    Không tìm thấy tin tuyển dụng nào phù hợp.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  return (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{job.title}</span>
                          </div>
                          {/* Tags and Package info */}
                          {renderJobTagsAndInfo(job)}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(job.status)}
                        {renderReasonText(job)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700 font-medium">{job.hiredCount || 0} / {job.neededCount || job.headcount || 1} đã nhận</span>
                          {job.isHiringFull && (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded w-fit">Đã tuyển đủ</span>
                          )}
                        </div>
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
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobId(job._id)}
                            title="Xem chi tiết"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

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

                          {job.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleCloseJob(job._id)}
                              title="Đóng job"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-700 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
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

        {/* Phân trang */}
        {renderPagination()}
      </section>

      {/* Modal chi tiết */}
      {selectedJobId && (
        <JobDetailModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onSuccess={() => {
            setSelectedJobId(null);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

export default JobList;