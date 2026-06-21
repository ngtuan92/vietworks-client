import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MapPin, DollarSign, Sliders, Briefcase, ChevronRight, Award, Loader2 } from 'lucide-react';
import { getMatchedJobs } from '../../../services/jobseekerService';

const MatchedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMatchedJobs({ page, limit: 10 });
        if (cancelled) return;
        setJobs(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch {
        if (!cancelled) setError('Không thể tải danh sách việc làm phù hợp.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page]);

  const formatSalary = (job) => {
    const s = job.salary;
    if (!s || s.type === 'NEGOTIABLE' || (!s.minMillion && !s.maxMillion)) return 'Thỏa thuận';
    if (s.minMillion && s.maxMillion) return `${s.minMillion} - ${s.maxMillion} triệu`;
    if (s.minMillion) return `Từ ${s.minMillion} triệu`;
    return `Đến ${s.maxMillion} triệu`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body-md text-slate-800 antialiased">
      <main className="mx-auto max-w-5xl space-y-6">

        <section className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ThumbsUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Việc làm phù hợp</h1>
              <p className="text-slate-500 text-sm mt-1">Gợi ý tự động dựa trên hồ sơ và nhu cầu tìm việc của bạn.</p>
            </div>
          </div>
          <Link
            to="/job-preferences"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-primary" />
            Thay đổi nhu cầu
          </Link>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{error}</div>
        ) : jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => {
                const company = job.companyId || job.company;
                return (
                <div key={job._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all relative overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm overflow-hidden">
                        {company?.avatarUrl
                          ? <img src={company.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : (company?.name || job.title || '?').charAt(0)
                        }
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-950 text-base md:text-lg hover:text-primary transition-colors">
                          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-sm text-slate-600">{company?.name || '—'}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                          {job.workLocations?.[0] && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.workLocations[0].provinceName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatSalary(job)}
                          </span>
                          {job.jobLevelId?.name && (
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {job.jobLevelId.name}
                            </span>
                          )}
                        </div>
                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {job.skills.slice(0, 4).map((s) => (
                              <span key={s._id || s} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                {s.name || s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end">
                      <Link to={`/jobs/${job._id}`} className="px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 transition flex items-center gap-1 cursor-pointer">
                        Xem & ứng tuyển
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition ${p === page ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const EmptyState = () => (
  <section className="rounded-3xl bg-white border border-slate-200 p-12 text-center space-y-4">
    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
      <Briefcase className="w-8 h-8" />
    </div>
    <h2 className="text-lg font-black text-slate-900">Chưa có gợi ý phù hợp</h2>
    <p className="text-slate-500 text-sm max-w-sm mx-auto">Hãy cập nhật nhu cầu công việc của bạn để hệ thống gợi ý những cơ hội phù hợp nhất.</p>
    <Link to="/job-preferences" className="inline-flex px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/95 transition">Cập nhật nhu cầu ngay</Link>
  </section>
);

export default MatchedJobs;
