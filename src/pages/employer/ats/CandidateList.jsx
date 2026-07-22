import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Eye, FileText, Loader2, Users } from 'lucide-react';
import atsService from '../../../services/atsService';

const STATUS_LABEL = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  PUBLISHED: 'Đang tuyển',
  EXPIRED: 'Hết hạn',
  CLOSED: 'Đã đóng',
  REJECTED: 'Bị từ chối',
  BANNED: 'Bị khóa'
};

const CandidateList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await atsService.getAtsJobs();
        setJobs(res?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách job ATS');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);


  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (statusFilter !== 'ALL') {
      result = result.filter(job => job.status === statusFilter);
    }
    const normalized = keyword.trim().toLowerCase();
    if (normalized) {
      result = result.filter((job) => job.title?.toLowerCase().includes(normalized));
    }
    return result;
  }, [jobs, keyword, statusFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredJobs.slice(start, start + limit);
  }, [filteredJobs, page]);

  const totalPages = Math.ceil(filteredJobs.length / limit);

  const totals = useMemo(() => jobs.reduce((sum, job) => ({
    jobs: sum.jobs + 1,
    applications: sum.applications + (job.applicationCount || 0),
    unread: sum.unread + (job.stats?.UNREAD || 0) + (job.stats?.APPLIED || 0),
    viewed: sum.viewed + (job.stats?.VIEWED || 0)
  }), { jobs: 0, applications: 0, unread: 0, viewed: 0 }), [jobs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ATS - Quản lý hồ sơ ứng tuyển</h1>
          <p className="text-slate-600 mt-1">Chọn một tin tuyển dụng để xem danh sách ứng viên đã nộp hồ sơ.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-50 font-medium text-slate-700"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {['PUBLISHED', 'EXPIRED', 'CLOSED'].map((key) => (
              <option key={key} value={key}>{STATUS_LABEL[key]}</option>
            ))}
          </select>
          <div className="relative w-full lg:w-80">
            <input
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên job..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat icon={<BriefcaseBusiness className="w-5 h-5" />} label="Tổng job" value={totals.jobs} />
        <Stat icon={<Users className="w-5 h-5" />} label="Tổng hồ sơ" value={totals.applications} />
        <Stat icon={<FileText className="w-5 h-5" />} label="Chưa xem" value={totals.unread} />
        <Stat icon={<Eye className="w-5 h-5" />} label="Đã xem" value={totals.viewed} />
      </section>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <section className="bg-white border border-slate-200/70 premium-shadow rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu ATS...
          </div>
        ) : paginatedJobs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">Chưa có job hoặc hồ sơ ứng tuyển phù hợp.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedJobs.map((job) => (
              <div key={job.id} className="p-5 hover:bg-blue-50/30 transition-colors">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 truncate">{job.title}</h2>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-100">
                        {STATUS_LABEL[job.status] || job.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{job.company?.name || 'Công ty của bạn'} • Hạn nộp: {formatDate(job.deadline)}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 xl:w-[600px]">
                    <MiniStat label="Tổng" value={job.applicationCount || 0} />
                    <MiniStat label="Chưa xem" value={(job.stats?.UNREAD || 0) + (job.stats?.APPLIED || 0)} />
                    <MiniStat label="Đã xem" value={job.stats?.VIEWED || 0} />
                    <MiniStat label="Đã duyệt" value={job.stats?.APPROVED || 0} />
                    <MiniStat label="Phỏng vấn" value={job.stats?.INTERVIEW_INVITED || 0} />
                  </div>

                  <Link
                    to={`/employer/jobs/${job.id}/applications`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Xem hồ sơ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */
        totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              Hiển thị <span className="font-semibold text-slate-900">{(page - 1) * limit + 1}</span> - <span className="font-semibold text-slate-900">{Math.min(page * limit, filteredJobs.length)}</span> trong tổng số <span className="font-semibold text-slate-900">{filteredJobs.length}</span> tin tuyển dụng
            </p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {page > 1 && (
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Trước
                </button>
              )}
              
              {(() => {
                const pages = [];
                const maxVisible = 5;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (page <= 3) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                  } else if (page >= totalPages - 2) {
                    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                  } else {
                    for (let i = page - 2; i <= page + 2; i++) pages.push(i);
                  }
                }
                return pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      page === pageNum
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}

              {page < totalPages && (
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Sau
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const Stat = ({ icon, label, value }) => (
  <div className="bg-white border border-slate-200/70 premium-shadow rounded-2xl p-5">
    <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-3">{icon}</div>
    <p className="text-sm text-slate-500 font-semibold">{label}</p>
    <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-center">
    <p className="text-xs text-slate-500 font-semibold">{label}</p>
    <p className="text-lg font-black text-slate-900">{value}</p>
  </div>
);

const formatDate = (value) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN');
};

export default CandidateList;
