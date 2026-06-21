import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Briefcase, DollarSign, Building2 } from 'lucide-react';

const formatSalary = (job) => {
  const s = job.salary;
  if (!s || s.type === 'NEGOTIABLE' || (!s.minMillion && !s.maxMillion)) return 'Thỏa thuận';
  if (s.minMillion && s.maxMillion) return `${s.minMillion} - ${s.maxMillion} triệu`;
  if (s.minMillion) return `Từ ${s.minMillion} triệu`;
  return `Đến ${s.maxMillion} triệu`;
};

const SimilarJobsSection = ({
  title = 'Việc làm tương tự',
  subtitle,
  fetchFn,
  limit = 6
}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchFn(limit);
        if (cancelled) return;
        setJobs(data?.data || []);
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchFn, limit]);

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
        <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const location = job.workLocations?.[0];
          const company = job.companyId;
          return (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-primary/30 transition-all block"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                  {company?.avatarUrl ? (
                    <img
                      src={company.avatarUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-primary transition">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                    {company?.name || 'Công ty'}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <DollarSign className="w-3 h-3" />
                  {formatSalary(job)}
                </span>
                {location?.provinceName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location.provinceName}
                  </span>
                )}
                {job.careerId?.name && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {job.careerId.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarJobsSection;
