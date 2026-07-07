import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from './JobCard';
import { ArrowRight } from 'lucide-react';
import { getPublicJobs } from '../../../services/jobService';

const DEFAULT_LOGO =
  'https://ui-avatars.com/api/?name=Company&background=EAF2FF&color=003F87&bold=true';

const formatSalary = (salary) => {
  if (!salary || salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
  if (salary.minMillion && salary.maxMillion) return `${salary.minMillion} - ${salary.maxMillion} triệu`;
  if (salary.minMillion) return `Từ ${salary.minMillion} triệu`;
  if (salary.maxMillion) return `Đến ${salary.maxMillion} triệu`;
  return 'Thỏa thuận';
};

const formatLocation = (job) => {
  const first = job.workLocations?.[0];
  return (
    first?.address ||
    [first?.districtName, first?.provinceName].filter(Boolean).join(', ') ||
    'Không xác định'
  );
};

const formatUpdatedTime = (dateValue) => {
  if (!dateValue) return 'Vừa cập nhật';
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return 'Vừa cập nhật';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return new Date(dateValue).toLocaleDateString('vi-VN');
};

const getTags = (job) => {
  const tags = [];
  if (job.isUrgent) tags.push('Tuyển gấp');
  if (job.experience) tags.push(job.experience);
  if (job.jobLevelId?.name) tags.push(job.jobLevelId.name);
  return tags.slice(0, 3);
};

const mapJobToCard = (job) => ({
  id: job._id,
  title: job.title,
  company: job.companyId?.name || 'Công ty',
  companyAvatar: job.companyId?.avatarUrl || DEFAULT_LOGO,
  location: formatLocation(job),
  salary: formatSalary(job.salary),
  updatedTime: formatUpdatedTime(job.publishedAt || job.createdAt),
  tags: getTags(job),
  neededCount: job.neededCount || job.headcount || 1,
  isHiringFull: Boolean(job.isHiringFull),
});

const JobGrid = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicJobs({ limit: 6, sortBy: 'publishedAt', sortOrder: 'desc' })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Việc làm mới nhất</h2>
            </div>
            <p className="text-slate-500 mt-2 text-base">Những cơ hội việc làm vừa được đăng tuyển trên nền tảng</p>
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="px-3 py-1.5 text-sm text-primary font-bold flex items-center gap-1 whitespace-nowrap hover:text-primary-dark transition-colors"
          >
            Xem tất cả <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-on-surface-variant">Đang tải việc làm...</p>
        ) : jobs.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Chưa có việc làm nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} {...mapJobToCard(job)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobGrid;
