import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../../services/jobService';
import { getSimilarAppliedJobs } from '../../../services/jobseekerService';
import SimilarJobsSection from '../../../components/jobseeker/jobs/SimilarJobsSection';

const statusConfig = {
  UNREAD: { label: 'Chưa đọc', bg: 'bg-gray-100', text: 'text-gray-600' },
  APPLIED: { label: 'Đã ứng tuyển', bg: 'bg-blue-100', text: 'text-blue-600' },
  VIEWED: { label: 'Đã xem', bg: 'bg-blue-100', text: 'text-blue-700' },
  APPROVED: { label: 'Được duyệt', bg: 'bg-green-100', text: 'text-green-600' },
  INTERVIEW_INVITED: { label: 'Đã mời phỏng vấn', bg: 'bg-purple-100', text: 'text-purple-600' },
  REJECTED: { label: 'Từ chối', bg: 'bg-red-100', text: 'text-red-600' },
  HIRED: { label: 'Được tuyển', bg: 'bg-green-100', text: 'text-green-700' },
};

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (filterStatus) params.status = filterStatus;

        const result = await jobService.getMyApplications(params);
        if (cancelled) return;
        if (result.success) {
          setApplications(result.data.applications);
          setPagination(result.data.pagination);
        } else {
          setError(result.message || 'Không thể tải danh sách ứng tuyển');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch applications:', error);
          setError('Đã xảy ra lỗi khi tải danh sách. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filterStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    if (salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
    return `${salary.minMillion || 0} - ${salary.maxMillion || 0} triệu`;
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/applied-jobs/${applicationId}/status`);
  };

  return (
    <div className="bg-background min-h-screen font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2">Việc đã ứng tuyển</h1>
          <p className="text-on-surface-variant">Theo dõi tình trạng các hồ sơ ứng tuyển của bạn</p>
        </div>

        {/* Filter */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-outline-variant">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-on-surface font-semibold">Lọc theo trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === ''
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Tất cả
              </button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === key
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => setFilterStatus((s) => s)}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-surface rounded-xl p-12 text-center border border-outline-variant">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">description</span>
            <h3 className="text-xl font-semibold text-on-surface mb-2">Chưa có đơn ứng tuyển</h3>
            <p className="text-on-surface-variant mb-6">Bạn chưa ứng tuyển công việc nào</p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg hover:opacity-90 transition-all"
            >
              Tìm việc ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.APPLIED;
              return (
                <div
                  key={app.id}
                  className="bg-surface rounded-xl p-6 border border-outline-variant hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Company Avatar */}
                    <div className="w-16 h-16 bg-surface-container-low rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {app.company?.avatarUrl ? (
                        <img
                          src={app.company.avatarUrl}
                          alt={app.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">business</span>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-on-surface text-lg mb-1">
                            {app.job?.title || 'Việc đã xóa'}
                          </h3>
                          <p className="text-on-surface-variant flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-base">business</span>
                            {app.company?.name || 'Công ty đã xóa'}
                            {app.company?.isVerified && (
                              <span className="material-symbols-outlined text-primary text-base">verified</span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">location_on</span>
                              {app.job?.location
                                ? `${app.job.location.districtName}, ${app.job.location.provinceName}`
                                : 'Không xác định'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">payments</span>
                              {formatSalary(app.job?.salary)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            Ứng tuyển: {formatDate(app.appliedAt)}
                          </span>
                        </div>
                      </div>

                      {/* CV Info */}
                      {app.cv && (
                        <div className="mt-4 pt-4 border-t border-outline-variant">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-on-surface-variant text-base">
                              {app.cv.type === 'ONLINE' ? 'dashboard' : 'attach_file'}
                            </span>
                            <span className="text-on-surface-variant">
                              CV: {app.cv.title || app.cv.fileName}
                            </span>
                            <span className="px-2 py-0.5 bg-surface-container-low rounded text-xs text-on-surface-variant">
                              {app.cv.type === 'ONLINE' ? 'Online' : 'Upload'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-outline-variant flex flex-wrap gap-3">
                        <button
                          onClick={() => handleViewJob(app.job?.id)}
                          className="px-4 py-2 bg-primary-container text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          Xem việc
                        </button>
                        <button
                          onClick={() => handleViewApplication(app.id)}
                          className="px-4 py-2 border border-outline text-on-surface font-medium rounded-lg hover:bg-surface-container-low transition-all text-sm flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">description</span>
                          Chi tiết hồ sơ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <SimilarJobsSection
              title="Việc làm tương tự"
              subtitle="Các công việc cùng ngành với những việc bạn đã ứng tuyển"
              fetchFn={getSimilarAppliedJobs}
              limit={6}
            />
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  pagination.page === i + 1
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AppliedJobs;
