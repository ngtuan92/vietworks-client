import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Users, Globe, Briefcase, Heart, Loader2,
  Building2, DollarSign, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  getPublicCompanyDetail,
  getCompanyOpenJobs,
  followCompany,
  unfollowCompany
} from '../../../services/jobseekerService';
import { useAuthStore } from '../../../store/authStore';

const CompanyDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isJobseeker = user?.role === 'JOBSEEKER';

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPublicCompanyDetail(id);
        setCompany(data.data);
        setFollowing(data.isFollowing || false);
      } catch {
        setError('Không tìm thấy công ty.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        const data = await getCompanyOpenJobs(id, { limit: 10 });
        setJobs(data.data || []);
      } catch {
        // silent
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, [id]);

  const handleFollow = async () => {
    if (!isJobseeker) return;
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowCompany(id);
        setFollowing(false);
        setCompany(prev => prev ? { ...prev, followersCount: (prev.followersCount || 1) - 1 } : prev);
      } else {
        await followCompany(id);
        setFollowing(true);
        setCompany(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : prev);
      }
    } catch {
      // silent
    } finally {
      setFollowLoading(false);
    }
  };

  const formatSalary = (job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) return `${job.salaryMin} - ${job.salaryMax} triệu`;
    if (job.salaryMin) return `Từ ${job.salaryMin} triệu`;
    return `Đến ${job.salaryMax} triệu`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <main className="max-w-container-max mx-auto px-gutter py-10 text-center">
        <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-700">{error || 'Không tìm thấy công ty'}</h1>
        <Link to="/companies" className="mt-4 inline-flex text-primary font-semibold text-sm hover:underline">← Quay lại danh sách</Link>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-gutter py-10 space-y-6">
      {/* Hero card */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-5 items-center">
            <div className="h-20 w-20 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
              {company.logoUrl
                ? <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-slate-400">{company.name?.charAt(0)}</span>
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
                {company.verificationStatus === 'APPROVED' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                )}
              </div>
              {company.industryName && <p className="text-slate-500 text-sm mt-1">{company.industryName}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                {company.employeeCount && (
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.employeeCount} nhân viên</span>
                )}
                {company.websiteUrl && (
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="w-3.5 h-3.5" />{company.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{company.followersCount || 0} người theo dõi</span>
              </div>
            </div>
          </div>

          {isJobseeker && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0 ${
                following
                  ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                  : 'bg-primary text-white hover:bg-primary/95'
              } disabled:opacity-60`}
            >
              {followLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${following ? 'fill-red-500' : ''}`} />}
              {following ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: About */}
        <div className="md:col-span-2 space-y-6">
          {company.description && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Giới thiệu công ty</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{company.description}</p>
            </section>
          )}

          {/* Open Jobs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Việc làm đang tuyển
            </h2>
            {jobsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Hiện chưa có vị trí nào đang tuyển.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <Link
                    key={job._id}
                    to={`/jobs/${job._id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-blue-50/30 transition group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition">{job.title}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                        {job.locations?.[0] && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.locations[0].provinceName}</span>
                        )}
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <DollarSign className="w-3 h-3" />{formatSalary(job)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Locations */}
        <div className="space-y-6">
          {company.locations?.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200 p-6">
              <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Địa điểm
              </h2>
              <ul className="space-y-2">
                {company.locations.map((loc, i) => (
                  <li key={loc._id || i} className="text-sm text-slate-600">
                    {loc.isHeadquarter && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">HQ</span>}
                    {loc.address}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default CompanyDetail;
