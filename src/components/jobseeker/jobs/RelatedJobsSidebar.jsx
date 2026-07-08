import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicJobs } from '../../../services/jobService';

const RelatedJobsSidebar = ({ currentJob }) => {
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (!currentJob || (!currentJob.careerId && !currentJob.careerGroupId)) return;

      try {
        setLoading(true);
        // Lấy danh sách việc làm cùng ngành (careerId)
        let jobs = [];
        if (currentJob.careerId) {
          const res = await getPublicJobs({ careerId: currentJob.careerId._id || currentJob.careerId, limit: 10 });
          jobs = res.data || [];
        }

        // Lọc bỏ công việc hiện tại
        jobs = jobs.filter(job => job._id !== currentJob._id);

        // Nếu ít quá thì lấy thêm theo careerGroupId
        if (jobs.length < 3 && currentJob.careerGroupId) {
            const moreRes = await getPublicJobs({ careerGroupId: currentJob.careerGroupId._id || currentJob.careerGroupId, limit: 10 });
            const moreJobs = (moreRes.data || []).filter(job => job._id !== currentJob._id && !jobs.some(j => j._id === job._id));
            jobs = [...jobs, ...moreJobs];
        }

        setRelatedJobs(jobs.slice(0, 3));
      } catch (err) {
        console.error("Lỗi khi tải việc làm liên quan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedJobs();
  }, [currentJob]);

  const handleSeeMore = () => {
    if (currentJob?.careerId) {
      navigate(`/jobs?careerId=${currentJob.careerId._id || currentJob.careerId}`);
    } else if (currentJob?.careerGroupId) {
      navigate(`/jobs?careerGroupId=${currentJob.careerGroupId._id || currentJob.careerGroupId}`);
    } else {
      navigate('/jobs');
    }
  };

  const formatSalary = (salary) => {
    if (!salary || salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
    if (salary.minMillion && salary.maxMillion) return `${salary.minMillion} - ${salary.maxMillion} triệu`;
    if (salary.minMillion) return `Từ ${salary.minMillion} triệu`;
    if (salary.maxMillion) return `Đến ${salary.maxMillion} triệu`;
    return 'Thỏa thuận';
  };

  const formatLocation = (job) => {
    const first = job.workLocations?.[0];
    return first?.districtName || first?.provinceName || 'Nhiều địa điểm';
  };

  if (!currentJob) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h3 className="font-headline-md text-headline-md mb-6">Việc Làm Liên Quan</h3>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : relatedJobs.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">Chưa tìm thấy việc làm liên quan.</p>
        ) : (
          relatedJobs.map((job) => (
            <Link 
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block p-4 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all bg-slate-50/50"
            >
              <h4 className="font-bold text-on-surface font-body-md mb-1 line-clamp-1">{job.title}</h4>
              <p className="text-primary font-body-sm text-body-sm mb-2 truncate">
                {job.companyId?.name || 'Nhà tuyển dụng'}
              </p>
              <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
                <span className="font-semibold text-blue-700">{formatSalary(job.salary)}</span>
                <span className="text-black flex items-center gap-1 text-xs truncate max-w-[100px]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{formatLocation(job)}</span>
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <button 
        onClick={handleSeeMore}
        className="w-full mt-6 py-2 text-primary font-bold text-label-md border-t border-outline-variant pt-4 flex justify-center items-center gap-1 hover:gap-3 transition-all cursor-pointer"
      >
        Xem Thêm Việc Làm
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default RelatedJobsSidebar;
