import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../../components/jobseeker/home/Hero';
import JobGrid from '../../../components/jobseeker/jobs/JobGrid';
import JobCard from '../../../components/jobseeker/jobs/JobCard';
import useAuth from '../../../hooks/useAuth';
import { useNotification } from '../../../contexts/NotificationContext';
import { getPublicJobs } from '../../../services/jobService';
import { getPublicCompanies } from '../../../services/jobseekerService';
import CompanyCard from '../../../components/common/CompanyCard';
import { Heart, UserPlus, ShieldCheck, Sparkles, FileText, ArrowRight, TrendingUp } from 'lucide-react';

const formatSalary = (salary) => {
  if (!salary || salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
  if (salary.minMillion && salary.maxMillion) return `${salary.minMillion} - ${salary.maxMillion} triệu`;
  if (salary.minMillion) return `Từ ${salary.minMillion} triệu`;
  if (salary.maxMillion) return `Đến ${salary.maxMillion} triệu`;
  return 'Thỏa thuận';
};

const formatJobLocation = (job) => {
  const first = job.workLocations?.[0];
  return (
    first?.address ||
    [first?.districtName, first?.provinceName].filter(Boolean).join(', ') ||
    'Không xác định'
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { confirm } = useNotification();

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);

  useEffect(() => {
    getPublicJobs({ limit: 3, sortBy: 'publishedAt', sortOrder: 'desc' })
      .then((res) => setFeaturedJobs(res.data || []))
      .catch(() => setFeaturedJobs([]));

    getPublicCompanies({ limit: 4 })
      .then((res) => setFeaturedCompanies(res.data || []))
      .catch(() => setFeaturedCompanies([]));
  }, []);

  const goProtected = (path) => {
    if (!isAuthenticated) {
      confirm(
        'Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập để tiếp tục.',
        () => {
          navigate('/login', { state: { from: path } });
        },
        null,
        'Yêu cầu đăng nhập',
        'Đăng nhập',
        'Hủy'
      );
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <Hero />
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-container-max mx-auto px-gutter">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-3 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> Hot Jobs
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Việc làm nổi bật</h2>
                <p className="text-slate-500 mt-2 text-base">Các cơ hội tuyển dụng đang được ưu tiên hiển thị tuần này.</p>
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="mt-4 md:mt-0 group flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              >
                Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {featuredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-500 text-lg">Chưa có việc làm nổi bật.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={job._id}
                    title={job.title}
                    company={job.companyId?.name || 'Công ty'}
                    companyAvatar={job.companyId?.avatarUrl || 'https://ui-avatars.com/api/?name=Company&background=EAF2FF&color=003F87&bold=true'}
                    location={formatJobLocation(job)}
                    salary={formatSalary(job.salary)}
                    updatedTime={new Date(job.publishedAt || job.createdAt).toLocaleDateString('vi-VN')}
                    tags={[job.isUrgent ? 'Tuyển gấp' : null, job.jobLevel, job.workType].filter(Boolean)}
                    skills={job.skills?.map(s => s.name || s) || []}
                    neededCount={job.neededCount}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <JobGrid />


        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-container-max mx-auto px-gutter">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-3 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Top Companies
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Danh sách công ty nổi bật</h2>
                <p className="text-slate-500 mt-2 text-base">Khám phá văn hóa và cơ hội việc làm từ các nhà tuyển dụng hàng đầu.</p>
              </div>
              <button
                onClick={() => navigate('/companies')}
                className="mt-4 md:mt-0 group flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              >
                Xem tất cả <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {featuredCompanies.length === 0 ? (
              <p className="text-slate-500">Chưa có công ty nào.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCompanies.map((company) => (
                  <CompanyCard
                    key={company._id}
                    company={company}
                    openJobsCount={company.openJobsCount || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 z-40">
        <FloatingActionButton onClick={() => goProtected('/jobs')} icon={<Heart className="w-5 h-5" />} label="Việc làm đã lưu" />
        <FloatingActionButton onClick={() => goProtected('/manage-cv')} icon={<UserPlus className="w-5 h-5" />} label="Hồ sơ sự nghiệp" />
        <FloatingActionButton onClick={() => goProtected('/profile')} icon={<ShieldCheck className="w-5 h-5" />} label="Xác thực tài khoản" />
      </div>
    </div>
  );
};

const FloatingActionButton = ({ icon, label, isPrimary = false, animate = '', onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 shadow-lg border border-outline-variant rounded-full flex items-center justify-center transition-all group relative ${
      isPrimary ? 'bg-primary text-white shadow-xl' : 'bg-white text-primary hover:bg-primary hover:text-white'
    } ${animate}`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="absolute right-full mr-3 bg-on-background text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </button>
);

export default Home;
