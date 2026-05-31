import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplyJobModal from './ApplyJobModal';

const JobDetailHeader = ({
  job,
  company,
  salary,
  location,
  updatedAt,
  canApply,
  cannotApplyReason,
  hasApplied,
  onApplySuccess
}) => {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const companyAvatar = company?.avatarUrl || 'https://placehold.co/96x96/png?text=C';
  const companyName = company?.name || 'Công ty không xác định';
  const isVerified = company?.verificationStatus === 'VERIFIED';

  const handleApply = () => {
    if (canApply) {
      setShowApplyModal(true);
    }
  };

  const handleSave = () => {
    console.log('Save job:', job._id);
  };

  return (
    <>
      <section className="bg-surface-container-lowest rounded-xl p-8 mb-stack-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-surface rounded-lg border border-outline-variant p-2 flex items-center justify-center shrink-0">
            <img 
              alt={companyName} 
              className="max-w-full" 
              src={companyAvatar}
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {job.isUrgent && (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-md">Tuyển gấp</span>
              )}
              {isVerified && (
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-label-md">Nhà tuyển dụng Xác minh</span>
              )}
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{job.title}</h1>
            <p className="font-headline-md text-headline-md text-primary mb-4">{companyName}</p>
            <div className="flex flex-wrap gap-6 text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span className="font-semibold text-primary">{salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                <span>Đăng {updatedAt}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {hasApplied ? (
              <button
                disabled
                className="w-full md:w-48 py-3 bg-green-100 text-green-700 font-bold rounded-lg cursor-not-allowed text-body-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">check_circle</span>
                Đã Ứng Tuyển
              </button>
            ) : canApply ? (
              <button
                onClick={handleApply}
                className="w-full md:w-48 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all text-body-md"
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
              <span className="material-symbols-outlined">bookmark</span>
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
    </>
  );
};

export default JobDetailHeader;