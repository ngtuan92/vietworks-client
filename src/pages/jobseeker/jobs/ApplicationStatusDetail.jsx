import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jobService from '../../../services/jobService';

const statusConfig = {
  UNREAD: { label: 'Chưa xem', bg: 'bg-gray-100', text: 'text-gray-600', icon: 'mark_email_unread' },
  APPLIED: { label: 'Đã nộp', bg: 'bg-blue-100', text: 'text-blue-600', icon: 'send' },
  VIEWED: { label: 'Đã xem', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'visibility' },
  APPROVED: { label: 'Được duyệt', bg: 'bg-green-100', text: 'text-green-600', icon: 'check_circle' },
  REJECTED: { label: 'Từ chối', bg: 'bg-red-100', text: 'text-red-600', icon: 'cancel' },
  HIRED: { label: 'Được tuyển', bg: 'bg-green-100', text: 'text-green-700', icon: 'workspace_premium' },
};

const ApplicationStatusDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await jobService.getApplicationStatus(id);
        if (result.success) {
          setApplication(result.data);
        } else {
          setError(result.message || 'Không thể tải thông tin');
        }
      } catch (err) {
        console.error('Error fetching application status:', err);
        setError('Đã xảy ra lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    if (salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
    return `${salary.minMillion || 0} - ${salary.maxMillion || 0} triệu`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">error</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông tin</h2>
          <p className="text-gray-600 mb-6">{error || 'Đã xảy ra lỗi'}</p>
          <button
            onClick={() => navigate('/applied-jobs')}
            className="px-6 py-2 bg-primary-container text-white rounded-lg hover:opacity-90"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[application.status] || statusConfig.APPLIED;

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/applied-jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Quay lại danh sách</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-fixed p-6 text-white">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status.bg}`}>
                <span className={`material-symbols-outlined text-3xl ${status.text}`}>{status.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trạng thái hồ sơ</h1>
                <p className={`text-lg font-semibold ${status.text}`}>{status.label}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Job & Company Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-surface-container-low rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {application.company?.avatarUrl ? (
                  <img
                    src={application.company.avatarUrl}
                    alt={application.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-400">business</span>
                )}
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {application.job?.title || 'Việc đã xóa'}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-base">business</span>
                  {application.company?.name || 'Công ty đã xóa'}
                  {application.company?.isVerified && (
                    <span className="material-symbols-outlined text-primary text-base">verified</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {application.job?.location && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {application.job.location.districtName}, {application.job.location.provinceName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">payments</span>
                    {formatSalary(application.job?.salary)}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface-container-low rounded-lg p-4">
                <h3 className="text-sm text-gray-500 mb-1">Ngày ứng tuyển</h3>
                <p className="font-semibold text-gray-900">{formatDate(application.appliedAt)}</p>
              </div>
              {application.viewedAt && (
                <div className="bg-surface-container-low rounded-lg p-4">
                  <h3 className="text-sm text-gray-500 mb-1">Ngày nhà tuyển dụng xem</h3>
                  <p className="font-semibold text-gray-900">{formatDate(application.viewedAt)}</p>
                </div>
              )}
              {application.cv && (
                <div className="bg-surface-container-low rounded-lg p-4">
                  <h3 className="text-sm text-gray-500 mb-1">CV đã sử dụng</h3>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      {application.cv.type === 'ONLINE' ? 'dashboard' : 'attach_file'}
                    </span>
                    {application.cv.title || application.cv.fileName}
                  </p>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                    {application.cv.type === 'ONLINE' ? 'CV Online' : 'CV Upload'}
                  </span>
                </div>
              )}
            </div>

            {/* Status History / Timeline */}
            {application.statusHistory && application.statusHistory.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử trạng thái</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {application.statusHistory.map((history, index) => {
                      const historyStatus = statusConfig[history.status] || { label: history.status, icon: 'circle' };
                      return (
                        <div key={index} className="relative flex items-start gap-4 pl-12">
                          <div className={`absolute left-2 w-5 h-5 rounded-full ${historyStatus.bg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-xs ${historyStatus.text}`}>
                              {historyStatus.icon === 'circle' ? 'circle' : historyStatus.icon}
                            </span>
                          </div>
                          <div className="bg-surface-container-low rounded-lg p-4 flex-grow">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold ${historyStatus.text}`}>{historyStatus.label}</span>
                              <span className="text-xs text-gray-500">{formatDate(history.changedAt)}</span>
                            </div>
                            {history.note && (
                              <p className="text-sm text-gray-600">{history.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Message from Employer */}
            {application.approvedMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">mail</span>
                  Lời nhắn từ nhà tuyển dụng
                </h3>
                <p className="text-green-800">{application.approvedMessage}</p>
              </div>
            )}

            {application.rejectionReason && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">info</span>
                  Lý do từ chối
                </h3>
                <p className="text-red-800">{application.rejectionReason}</p>
              </div>
            )}

            {application.interviewInvitation && (
              <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-base font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">event_available</span>
                  Thư mời phỏng vấn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Thời gian</p>
                    <p className="font-semibold text-blue-900 mt-1">{formatDate(application.interviewInvitation.time)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Hình thức</p>
                    <p className="font-semibold text-blue-900 mt-1">{application.interviewInvitation.format === 'ONLINE' ? 'Trực tuyến (Online)' : 'Trực tiếp (Offline)'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Địa điểm / Link</p>
                    {application.interviewInvitation.format === 'ONLINE' && application.interviewInvitation.location.includes('http') ? (
                      <a href={application.interviewInvitation.location} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline mt-1 block">{application.interviewInvitation.location}</a>
                    ) : (
                      <p className="font-semibold text-blue-900 mt-1">{application.interviewInvitation.location}</p>
                    )}
                  </div>
                  {application.interviewInvitation.contactPerson && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Người liên hệ</p>
                      <p className="font-semibold text-blue-900 mt-1">{application.interviewInvitation.contactPerson}</p>
                    </div>
                  )}
                  {application.interviewInvitation.note && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Ghi chú thêm</p>
                      <p className="font-semibold text-blue-900 mt-1">{application.interviewInvitation.note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/jobs/${application.job?.id}`)}
                className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                Xem việc làm
              </button>
              <button
                onClick={() => navigate('/applied-jobs')}
                className="px-6 py-3 border border-outline text-on-surface font-bold rounded-lg hover:bg-surface-container-low transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">list</span>
                Danh sách ứng tuyển
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationStatusDetail;
