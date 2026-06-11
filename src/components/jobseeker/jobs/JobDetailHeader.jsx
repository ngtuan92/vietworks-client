import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplyJobModal from './ApplyJobModal';
import useJobseekerAuth from '../../../hooks/useJobseekerAuth';
import JobseekerAuthModal from '../../common/JobseekerAuthModal';
import { Banknote, MapPin, Clock, CheckCircle, BookmarkPlus } from 'lucide-react';

const DEFAULT_LOGO =
  'https://ui-avatars.com/api/?name=Company&background=EAF2FF&color=003F87&bold=true';

const formatSalary = (salary) => {
  if (!salary || salary.type === 'NEGOTIABLE') return 'Thỏa thuận';

  if (salary.minMillion && salary.maxMillion) {
    return `${salary.minMillion} - ${salary.maxMillion} triệu`;
  }

  if (salary.minMillion) return `Từ ${salary.minMillion} triệu`;
  if (salary.maxMillion) return `Đến ${salary.maxMillion} triệu`;

  return 'Thỏa thuận';
};

const formatLocation = (locations = []) => {
  const first = locations[0];

  return (
    first?.address ||
    [first?.wardName, first?.districtName, first?.provinceName].filter(Boolean).join(', ') ||
    'Không xác định'
  );
};

const formatUpdatedTime = (dateValue) => {
  if (!dateValue) return 'Vừa cập nhật';

  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Vừa cập nhật';
  if (diffHours < 24) return `Đăng ${diffHours} giờ trước`;
  if (diffDays < 30) return `Đăng ${diffDays} ngày trước`;

  return `Đăng ${new Date(dateValue).toLocaleDateString('vi-VN')}`;
};

const JobDetailHeader = ({
  job,
  canApply,
  cannotApplyReason,
  hasApplied,
  onApplySuccess
}) => {
  const navigate = useNavigate();
  const { guard, modalState, closeModal } = useJobseekerAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const company = job?.companyId;
  const companyAvatar = company?.avatarUrl || DEFAULT_LOGO;
  const companyName = company?.name || 'Công ty không xác định';
  const isVerified = company?.verificationStatus === 'VERIFIED';

  const handleApply = guard(() => {
    if (canApply) setShowApplyModal(true);
  }, 'apply_job');

  const handleSave = guard(() => {
    console.log('Save job:', job._id);
  }, 'save_job');

  return (
    <>
      <section className="bg-surface-container-lowest rounded-xl p-8 mb-stack-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-surface rounded-lg border border-outline-variant p-2 flex items-center justify-center shrink-0">
            <img
              alt={companyName}
              className="max-w-full max-h-full object-contain"
              src={companyAvatar}
            />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {job?.isUrgent ? (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-label-md">
                  Tuyển gấp
                </span>
              ) : (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-md">
                  Mới
                </span>
              )}

              {isVerified ? (
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-label-md">
                  Nhà tuyển dụng Xác minh
                </span>
              ) : null}

              {job?.premium?.isActive ? (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-label-md">
                  Nổi bật
                </span>
              ) : null}
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              {job?.title}
            </h1>

            <p className="font-headline-md text-headline-md text-primary mb-4">
              {companyName}
            </p>

            <div className="flex flex-wrap gap-6 text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                <span className="font-semibold text-primary">{formatSalary(job?.salary)}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{formatLocation(job?.workLocations)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatUpdatedTime(job?.publishedAt || job?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {hasApplied ? (
              <button
                disabled
                className="w-full md:w-48 py-3 bg-green-100 text-green-700 font-bold rounded-lg cursor-not-allowed text-body-md flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Đã Ứng Tuyển
              </button>
            ) : canApply ? (
              <button
                onClick={handleApply}
                className="w-full md:w-48 py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all text-body-md"
              >
                Ứng Tuyển Ngay
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="w-full md:w-48 py-3 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed text-body-md"
                >
                  Không thể ứng tuyển
                </button>
                {cannotApplyReason && (
                  <div className="absolute right-0 top-full mt-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {cannotApplyReason}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full md:w-48 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary-fixed transition-all text-body-md flex items-center justify-center gap-2"
            >
              <BookmarkPlus className="w-5 h-5" />
              Lưu Việc Làm
            </button>
          </div>
        </div>
      </section>

      {showApplyModal && (
        <ApplyJobModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={onApplySuccess}
        />
      )}

      <JobseekerAuthModal
        open={modalState.open}
        action={modalState.action}
        onClose={closeModal}
      />
    </>
  );
};

export default JobDetailHeader;