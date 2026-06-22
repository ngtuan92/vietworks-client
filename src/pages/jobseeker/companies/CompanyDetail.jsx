import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Users, Briefcase, Loader2,
  Building2, CheckCircle2,
  Plus,
  ReceiptText, Factory, Layers, Search, Copy, Check,
  Filter
} from 'lucide-react';
import CompanyLogo from '../../../components/common/CompanyLogo';
import {
  getPublicCompanyDetail,
  getCompanyOpenJobs,
  followCompany,
  unfollowCompany,
  getFollowedCompanies
} from '../../../services/jobseekerService';
import { useAuthStore } from '../../../store/authStore';

const VIETMAP_KEY = import.meta.env.VITE_VIETMAP_API_KEY;
const STATIC_MAP = (lat, lng) =>
  `https://maps.vietmap.vn/api/staticmap/v4?apikey=${VIETMAP_KEY}&center=${lat},${lng}&zoom=15&width=600&height=300&markers=${lat},lng,red`;

const daysLeft = (d) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

const formatSalary = (job) => {
  const s = job.salary;
  if (!s) return 'Thỏa thuận';
  if (s.type === 'NEGOTIABLE' || (!s.minMillion && !s.maxMillion)) return 'Thỏa thuận';
  if (s.minMillion && s.maxMillion) return `${s.minMillion} - ${s.maxMillion} triệu`;
  if (s.minMillion) return `Từ ${s.minMillion} triệu`;
  return `Đến ${s.maxMillion} triệu`;
};

const JobCard = ({ job, company }) => {
  const left = daysLeft(job.deadline);
  return (
    <Link
      to={`/jobs/${job._id}`}
      className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary/70 hover:shadow-sm transition group"
    >
      <div className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
        <CompanyLogo name={company?.name} avatarUrl={company?.avatarUrl} textClassName="text-lg font-bold text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 group-hover:text-primary transition line-clamp-1">
                {job.title}
              </p>
              {job.isUrgent && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
                  Gấp
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{company?.name}</p>
          </div>
          <span className="text-sm font-bold text-primary shrink-0 whitespace-nowrap">
            {formatSalary(job)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
          {job.workLocations?.[0]?.provinceName && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.workLocations[0].provinceName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Cần tuyển: {job.headcount || 1}
          </span>
          {left !== null && left > 0 && (
            <span className={left <= 7 ? 'text-orange-600 font-semibold' : ''}>
              Còn {left} ngày
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="h-8 w-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 shrink-0 mt-1"
        title="Ứng tuyển nhanh"
      >
        <Check className="w-4 h-4" />
      </button>
    </Link>
  );
};

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
  const [tab, setTab] = useState('home');
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPublicCompanyDetail(id);
        setCompany(data.data);
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
        const data = await getCompanyOpenJobs(id, { limit: 50 });
        setJobs(data.data || []);
      } catch {
        // silent
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, [id]);

  useEffect(() => {
    if (!isJobseeker) return;
    const checkFollow = async () => {
      try {
        const res = await getFollowedCompanies({ limit: 200 });
        const list = res.data || [];
        const matched = list.some(
          (f) => f.company && (f.company._id === id || f.company._id?.toString() === id)
        );
        setFollowing(matched);
      } catch {
        // silent
      }
    };
    checkFollow();
  }, [id, isJobseeker]);

  const handleFollow = async () => {
    if (!isJobseeker) return;
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowCompany(id);
        setFollowing(false);
        setCompany((prev) =>
          prev ? { ...prev, followersCount: Math.max((prev.followersCount || 1) - 1, 0) } : prev
        );
      } else {
        await followCompany(id);
        setFollowing(true);
        setCompany((prev) =>
          prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : prev
        );
      }
    } catch {
      // silent
    } finally {
      setFollowLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        if (!j.title?.toLowerCase().includes(kw)) return false;
      }
      if (locationFilter.trim()) {
        const loc = locationFilter.toLowerCase();
        const match = j.workLocations?.some(
          (w) => w.provinceName?.toLowerCase().includes(loc) || w.districtName?.toLowerCase().includes(loc)
        );
        if (!match) return false;
      }
      return true;
    });
  }, [jobs, keyword, locationFilter]);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
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
        <Link to="/companies" className="mt-4 inline-flex text-primary font-semibold text-sm hover:underline">
          ← Quay lại danh sách
        </Link>
      </main>
    );
  }

  const industryName = company.industryId?.name;
  const sizeName = company.sizeId?.name;
  const hasAbout = company.description && company.description.trim().length > 0;
  const hasBenefits = Array.isArray(company.benefits) && company.benefits.length > 0;
  const primaryLocation = company.locations?.[0];

  return (
    <main className="max-w-container-max mx-auto px-gutter py-6 space-y-4">
      {/* Header card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-5 items-center min-w-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
              <CompanyLogo name={company.name} avatarUrl={company.avatarUrl} textClassName="text-3xl font-bold text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black uppercase text-slate-900">
                  {company.name}
                </h1>
                {company.verificationStatus === 'VERIFIED' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {company.followersCount || 0} người theo dõi
                </span>
              </div>
            </div>
          </div>

          {isJobseeker && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition shrink-0 ${
                following
                  ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  : 'bg-primary text-white hover:bg-primary'
              } disabled:opacity-60`}
            >
              {followLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className={`w-4 h-4 ${following ? 'rotate-45' : ''}`} />
              )}
              {following ? 'Đang theo dõi' : 'Theo dõi công ty'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 -mb-2 border-b border-slate-200 flex gap-8">
          <button
            onClick={() => setTab('home')}
            className={`pb-3 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === 'home'
                ? 'text-primary border-primary'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => setTab('jobs')}
            className={`pb-3 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === 'jobs'
                ? 'text-primary border-primary'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Tin tuyển dụng
            <span className="ml-1.5 text-slate-400">({jobs.length})</span>
          </button>
        </div>
      </section>

      {tab === 'home' && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-4">
            {/* About */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Giới thiệu công ty</h2>
              {hasAbout ? (
                <>
                  <div
                    className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: company.description }}
                  />
                </>
              ) : (
                <p className="text-sm text-slate-400">Đang cập nhật</p>
              )}
            </section>

            {/* Benefits */}
            {hasBenefits && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-black text-slate-900 mb-4">Phúc lợi</h2>
                <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                  {company.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Jobs preview (in Trang chủ tab) */}
            {jobs.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Tin tuyển dụng
                  <span className="text-sm font-medium text-slate-400">({jobs.length})</span>
                </h2>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tên công việc, vị trí ứng tuyển..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary bg-white appearance-none"
                    >
                      <option value="">Tất cả địa điểm</option>
                      {Array.from(
                        new Set(
                          jobs.flatMap((j) => j.workLocations?.map((w) => w.provinceName) || [])
                        )
                      )
                        .filter(Boolean)
                        .map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredJobs.slice(0, 5).map((job) => (
                    <JobCard key={job._id} job={job} company={company} />
                  ))}
                </div>
                {filteredJobs.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => setTab('jobs')}
                      className="px-6 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary/10 transition"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            {/* General info */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Thông tin chung</h2>
              <ul className="space-y-4 text-sm">
                {company.taxCode && (
                  <li className="flex gap-3 items-start">
                    <span className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <ReceiptText className="w-4 h-4 text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Mã số thuế</p>
                      <p className="font-semibold text-slate-900 font-mono">{company.taxCode}</p>
                    </div>
                  </li>
                )}
                {sizeName && (
                  <li className="flex gap-3 items-start">
                    <span className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Quy mô</p>
                      <p className="font-semibold text-slate-900">{sizeName}</p>
                    </div>
                  </li>
                )}
                {industryName && (
                  <li className="flex gap-3 items-start">
                    <span className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Lĩnh vực hoạt động</p>
                      <p className="font-semibold text-slate-900">{industryName}</p>
                    </div>
                  </li>
                )}

              </ul>
            </section>

            {/* Location */}
            {primaryLocation && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-black text-slate-900 mb-4">Địa điểm công ty</h2>
                {(primaryLocation.addressLine || primaryLocation.ward || primaryLocation.district || primaryLocation.province) && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {[
                      primaryLocation.addressLine,
                      primaryLocation.ward,
                      primaryLocation.district,
                      primaryLocation.province
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {primaryLocation.latitude && primaryLocation.longitude && VIETMAP_KEY && (
                  <a
                    href={`https://maps.vietmap.vn/?q=${primaryLocation.latitude},${primaryLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 rounded-xl overflow-hidden border border-slate-200 relative group"
                  >
                    <img
                      src={STATIC_MAP(primaryLocation.latitude, primaryLocation.longitude)}
                      alt="Bản đồ"
                      className="w-full h-48 object-cover group-hover:opacity-90 transition"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="absolute top-2 left-2 bg-white text-xs font-semibold text-slate-700 px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Mở bản đồ
                    </span>
                  </a>
                )}
                {company.locations?.length > 1 && (
                  <button className="mt-3 text-sm text-primary font-semibold hover:underline">
                    Xem thêm {company.locations.length - 1} địa điểm khác
                  </button>
                )}
              </section>
            )}

            {/* Share */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Chia sẻ công ty</h2>
              <p className="text-sm text-slate-500 mb-2">Sao chép đường dẫn</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-50 outline-none truncate"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0"
                  title="Sao chép"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-4 mb-2">Chia sẻ qua mạng xã hội</p>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition"
                  title="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-600" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                  </svg>
                </a>
                <a
                  href={`https://zalo.me/share?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition font-bold text-blue-700 text-sm"
                  title="Zalo"
                >
                  Z
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-700" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'jobs' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Tin tuyển dụng
            <span className="text-sm font-medium text-slate-400">({jobs.length})</span>
          </h2>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tên công việc, vị trí ứng tuyển..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-primary bg-white appearance-none"
              >
                <option value="">Tất cả địa điểm</option>
                {Array.from(
                  new Set(jobs.flatMap((j) => j.workLocations?.map((w) => w.provinceName) || []))
                )
                  .filter(Boolean)
                  .map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
              </select>
            </div>
          </div>
          {jobsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Không có vị trí nào phù hợp.</p>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} company={company} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default CompanyDetail;
