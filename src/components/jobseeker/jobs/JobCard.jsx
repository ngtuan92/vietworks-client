

import { useNavigate } from 'react-router-dom';
import { BookmarkPlus, Banknote, MapPin, Clock, Award, Briefcase, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import useJobseekerAuth from '../../../hooks/useJobseekerAuth';
import JobseekerAuthModal from '../../common/JobseekerAuthModal';
import { useAuthStore } from '../../../store/authStore';
import { getSavedJobs, saveJob, unsaveJob } from '../../../services/jobseekerService';

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

const JobCard = ({
  id,
  title,
  company,
  companyAvatar,
  location,
  salary,
  logo,
  updatedTime,
  tags = [],
  skills = [],
  experience,
  level,
  workType,
  deadline,
  showExtra = false,
}) => {
  const navigate = useNavigate();
  const { guard, modalState, closeModal } = useJobseekerAuth();
  const { isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarSrc = companyAvatar || logo || 'https://placehold.co/64x64/png?text=C';

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    loadSavedJobIds().then((set) => {
      if (!cancelled) setIsSaved(set.has(String(id)));
    });
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  const handleClick = () => { if (id) navigate(`/jobs/${id}`); };
  const handleSave = guard(async (e) => {
    e.stopPropagation();
    if (saving || !id) return;
    setSaving(true);
    const wasSaved = isSaved;
    try {
      if (wasSaved) {
        await unsaveJob(id);
        setIsSaved(false);
        invalidateSavedCache();
      } else {
        const set = await loadSavedJobIds();
        if (set.has(String(id))) {
          setIsSaved(true);
        } else {
          await saveJob(id);
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

    <div
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover-3d hover:border-primary transition-all group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 p-2">
          <img className="w-full h-full object-contain group-hover:scale-110 transition-transform" src={avatarSrc} alt={company} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-lg font-bold text-black group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
              <p className="text-gray-600 font-medium">{company}</p>
            </div>
            <button
              className={`transition-colors ${isSaved ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
              onClick={handleSave}
              title={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
            >
              <BookmarkPlus className={`w-6 h-6 ${isSaved ? 'fill-primary' : ''}`} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Banknote className="w-4 h-4" />
              <span className="text-sm font-bold text-primary">{salary}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Cập nhật: {updatedTime}</span>
            </div>
          </div>

          {showExtra ? (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {experience ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">{experience}</span>
                </div>
              ) : null}
              {level ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{level}</span>
                </div>
              ) : null}
              {workType ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{workType}</span>
                </div>
              ) : null}
              {deadline ? (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Hạn nộp: {deadline}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#d9e3f2] text-[#3e4853] text-xs font-semibold rounded-full">
                {tag}
              </span>
            ))}
            {skills.slice(0, 3).map((skill, index) => (
              <span key={`skill-${index}`} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

      <JobseekerAuthModal open={modalState.open} action={modalState.action} onClose={closeModal} />
    </>
  );
};

export default JobCard;
