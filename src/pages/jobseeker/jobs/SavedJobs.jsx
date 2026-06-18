import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, DollarSign, Calendar, Eye, Send, Briefcase, Loader2 } from 'lucide-react';
import { getSavedJobs, unsaveJob } from '../../../services/jobseekerService';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs({ page, limit: 10 });
      setJobs(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setStatusMsg('Không thể tải danh sách việc làm đã lưu.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  const handleUnsave = async (jobId, title) => {
    try {
      await unsaveJob(jobId);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      setStatusMsg(`Đã bỏ lưu công việc "${title}"`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch {
      setStatusMsg('Không thể bỏ lưu. Vui lòng thử lại.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatSalary = (job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) return `${job.salaryMin} - ${job.salaryMax} triệu`;
    if (job.salaryMin) return `Từ ${job.salaryMin} triệu`;
    return `Đến ${job.salaryMax} triệu`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl bg-white border border-slate-200 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7 fill-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Việc làm đã lưu</h1>
            <p className="text-slate-500 text-sm mt-1">Danh sách công việc bạn đã thả tim để lưu trữ và ứng tuyển sau.</p>
          </div>
        </section>

        {statusMsg && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold">
            {statusMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="space-y-4">
              {jobs.map((item) => {
                const job = item.jobId || item;
                const savedAt = item.savedAt || item.createdAt;
                return (
                  <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="flex gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm overflow-hidden">
                          {job.companySnapshot?.logoUrl
                            ? <img src={job.companySnapshot.logoUrl} alt="" className="w-full h-full object-cover" />
                            : (job.companySnapshot?.name || job.title || '?').charAt(0)
                          }
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-950 text-base md:text-lg hover:text-primary transition-colors">
                            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                          </h3>
                          <p className="text-sm text-slate-600">{job.companySnapshot?.name || '—'}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                            {job.locations?.[0] && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.locations[0].provinceName}
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                              <DollarSign className="w-3.5 h-3.5" />
                              {formatSalary(job)}
                            </span>
                            {savedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Đã lưu: {formatDate(savedAt)}
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
                      <div className="flex items-center md:flex-col justify-between md:justify-center gap-3 mt-4 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        <button
                          onClick={() => handleUnsave(item._id, job.title)}
                          className="p-2.5 rounded-xl border border-slate-200 text-red-500 hover:bg-red-50 transition cursor-pointer flex items-center justify-center"
                          title="Bỏ lưu công việc này"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                        <div className="flex gap-2">
                          <Link to={`/jobs/${job._id}`} className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Chi tiết
                          </Link>
                          <Link to={`/jobs/${job._id}`} className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 transition flex items-center gap-1">
                            <Send className="w-3.5 h-3.5" /> Ứng tuyển
                          </Link>
                        </div>
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
        ) : (
          <EmptyState />
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
    <h2 className="text-lg font-black text-slate-900">Chưa có việc làm đã lưu</h2>
    <p className="text-slate-500 text-sm max-w-sm mx-auto">Khi bạn bấm biểu tượng trái tim ở các trang tin tuyển dụng, công việc đó sẽ hiển thị tại đây để bạn tiện theo dõi.</p>
    <Link to="/jobs" className="inline-flex px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/95 transition">Tìm việc ngay</Link>
  </section>
);

export default SavedJobs;
