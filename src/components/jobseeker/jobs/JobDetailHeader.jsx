import { useState, useEffect } from 'react';
import ApplyJobModal from './ApplyJobModal';
import useJobseekerAuth from '../../../hooks/useJobseekerAuth';
import JobseekerAuthModal from '../../common/JobseekerAuthModal';
import { useAuthStore } from '../../../store/authStore';
import { getSavedJobs, saveJob, unsaveJob } from '../../../services/jobseekerService';
import { Banknote, MapPin, Clock, CheckCircle, BookmarkPlus, Users } from 'lucide-react';

let savedJobsCache = null;
let savedJobsCachePromise = null;
const loadSavedJobIds = async () => {
  if (savedJobsCache) return savedJobsCache;
  if (savedJobsCachePromise) return savedJobsCachePromise;
  savedJobsCachePromise = (async () => {
    try {
      const res = await getSavedJobs({ limit: 50 });
      const list = res.data || [];
      const ids = new Set();
      list.forEach((item) => {
        const id = item.job?.id || item.job?._id || item.jobId?._id || item.jobId;
        if (id) ids.add(id.toString());
      });
      savedJobsCache = ids;
    } catch {
      savedJobsCache = new Set();
    } finally {
      savedJobsCachePromise = null;
    }
    return savedJobsCache;
  })();
  return savedJobsCachePromise;
};
const invalidateSavedCache = () => {
  savedJobsCache = null;
};

const DEFAULT_LOGO =
  'https://ui-avatars.com/api/?name=Company&background=EAF2FF&color=003F87&bold=true';

const formatSalary = (salary) => {
  if (!salary || salary.type === 'NEGOTIABLE') return 'Thá»a thuáº­n';

  if (salary.minMillion && salary.maxMillion) {
    return `${salary.minMillion} - ${salary.maxMillion} triá»‡u`;
  }

  if (salary.minMillion) return `Tá»« ${salary.minMillion} triá»‡u`;
  if (salary.maxMillion) return `Äáº¿n ${salary.maxMillion} triá»‡u`;

  return 'Thá»a thuáº­n';
};

const formatLocation = (locations = []) => {
  const first = locations[0];

  return (
    first?.address ||
    [first?.wardName, first?.districtName, first?.provinceName].filter(Boolean).join(', ') ||
    'KhÃ´ng xÃ¡c Ä‘á»‹nh'
  );
};

const formatUpdatedTime = (dateValue) => {
  if (!dateValue) return 'Vá»«a cáº­p nháº­t';

  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Vá»«a cáº­p nháº­t';
  if (diffHours < 24) return `ÄÄƒng ${diffHours} giá» trÆ°á»›c`;
  if (diffDays < 30) return `ÄÄƒng ${diffDays} ngÃ y trÆ°á»›c`;

  return `ÄÄƒng ${new Date(dateValue).toLocaleDateString('vi-VN')}`;
};

const JobDetailHeader = ({
  job,
  canApply,
  cannotApplyReason,
  hasApplied,
  onApplySuccess
}) => {
  const { guard, modalState, closeModal } = useJobseekerAuth();
  const { isAuthenticated } = useAuthStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const company = job?.companyId;
  const companyAvatar = company?.avatarUrl || DEFAULT_LOGO;
  const companyName = company?.name || 'CÃ´ng ty khÃ´ng xÃ¡c Ä‘á»‹nh';
  const isVerified = company?.verificationStatus === 'VERIFIED';
  const isHiringFull = Boolean(job?.isHiringFull || cannotApplyReason === 'Tin tuyển dụng đã tuyển đủ số lượng');
  const neededCount = job?.neededCount || job?.applicationCount || 1;

  useEffect(() => {
    if (!isAuthenticated || !job?._id) return;
    let cancelled = false;
    loadSavedJobIds().then((set) => {
      if (!cancelled) setIsSaved(set.has(String(job._id)));
    });
    return () => { cancelled = true; };
  }, [job?._id, isAuthenticated]);

  const handleApply = guard(() => {
    if (canApply) setShowApplyModal(true);
  }, 'apply_job');

  const handleSave = guard(async () => {
    if (saving || !job?._id) return;
    setSaving(true);
    const wasSaved = isSaved;
    try {
      if (wasSaved) {
        await unsaveJob(job._id);
        setIsSaved(false);
        invalidateSavedCache();
      } else {
        const set = await loadSavedJobIds();
        if (set.has(String(job._id))) {
          setIsSaved(true);
        } else {
          await saveJob(job._id);
          setIsSaved(true);
          invalidateSavedCache();
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      if (!wasSaved && status === 400) {
        setIsSaved(true);
        invalidateSavedCache();
      } else if (wasSaved && status === 404) {
        setIsSaved(false);
        invalidateSavedCache();
      } else {
        setIsSaved(wasSaved);
      }
    } finally {
      setSaving(false);
    }
  }, 'save_job');

  return (
    <>
      <section className="bg-surface-container-lowest rounded-xl p-8 mb-stack-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-surface rounded-lg border border-outline-variant p-2 flex items-center justify-center shrink-0">
            <img
              alt={companyName}
              className="max-w-full max-h-full object-cover"
              src={companyAvatar}
            />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {job?.isUrgent ? (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-label-md">
                  Tuyá»ƒn gáº¥p
                </span>
              ) : (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-md">
                  Má»›i
                </span>
              )}

              {isVerified ? (
                <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-label-md">
                  NhÃ  tuyá»ƒn dá»¥ng XÃ¡c minh
                </span>
              ) : null}

              {job?.premium?.isActive ? (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-label-md">
                  Ná»•i báº­t
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

              <div className={`flex items-center gap-2 ${isHiringFull ? 'text-red-600' : ''}`}>
                <Users className="w-5 h-5" />
                <span>{isHiringFull ? 'Đã tuyển đủ' : `Cần tuyển: ${neededCount} người`}</span>
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
                ÄÃ£ á»¨ng Tuyá»ƒn
              </button>
            ) : canApply ? (
              <button
                onClick={handleApply}
                className="w-full md:w-48 py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all text-body-md"
              >
                á»¨ng Tuyá»ƒn Ngay
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="w-full md:w-48 py-3 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed text-body-md"
                >
                  {cannotApplyReason === 'Tin tuyá»ƒn dá»¥ng Ä‘Ã£ tuyá»ƒn Ä‘á»§ sá»‘ lÆ°á»£ng' ? 'ÄÃ£ tuyá»ƒn Ä‘á»§' : 'KhÃ´ng thá»ƒ á»©ng tuyá»ƒn'}
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
              disabled={saving}
              className={`w-full md:w-48 py-3 border font-bold rounded-lg transition-all text-body-md flex items-center justify-center gap-2 ${
                isSaved
                  ? 'border-primary bg-primary text-white hover:bg-primary/90'
                  : 'border-primary text-primary hover:bg-primary-fixed'
              } disabled:opacity-60`}
            >
              <BookmarkPlus className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
              {isSaved ? 'ÄÃ£ lÆ°u' : 'LÆ°u Viá»‡c LÃ m'}
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
