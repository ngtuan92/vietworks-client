import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, FileText, Loader2, Search, X } from 'lucide-react';
import atsService from '../../../services/atsService';

const QUICK_FILTERS = ['ALL', 'UNREAD', 'VIEWED', 'APPROVED', 'REJECTED'];
const LABEL = { ALL: 'Tất cả', UNREAD: 'Chưa xem', APPLIED: 'Đã nộp', VIEWED: 'Đã xem', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', HIRED: 'Đã tuyển' };
const COLOR = {
  UNREAD: 'bg-blue-50 text-primary border border-blue-100',
  APPLIED: 'bg-blue-50 text-primary border border-blue-100',
  VIEWED: 'bg-slate-100 text-slate-700 border border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border border-red-100',
  HIRED: 'bg-blue-100 text-primary border border-blue-200'
};

const JobApplications = () => {
  const { id } = useParams();
  const [filter, setFilter] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewUrlRef = useRef('');

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError('');
        const params = filter !== 'ALL' ? { status: filter } : {};
        const res = await atsService.getApplicationsByJob(id, params);
        setApplications(res?.data || []);
        setJob(res?.job || null);
        setStats(res?.stats || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách hồ sơ ứng tuyển');
      } finally {
        setLoading(false);
      }
    };

    queueMicrotask(() => {
      loadApplications();
    });
  }, [id, filter]);

  useEffect(() => {
    if (!previewItem) return undefined;

    let active = true;

    queueMicrotask(async () => {
      try {
        setPreviewLoading(true);
        const blob = await atsService.getApplicationCvBlob(previewItem.id);
        if (!active) return;
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const objectUrl = URL.createObjectURL(blob);
        previewUrlRef.current = objectUrl;
        setPreviewUrl(objectUrl);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Kh?ng th? t?i CV ?? xem tr??c');
      } finally {
        if (active) setPreviewLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [previewItem]);

  const candidates = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return applications;
    return applications.filter((candidate) => [
      candidate.candidateName,
      candidate.candidateEmail,
      candidate.cvName,
      candidate.desiredLocation
    ].filter(Boolean).some((value) => value.toLowerCase().includes(normalized)));
  }, [applications, keyword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ ứng tuyển theo từng Job</h1>
          <p className="text-slate-600 mt-1">{job?.title || `Job #${id}`} • {stats?.total || applications.length} hồ sơ</p>
        </div>
        <Link to="/employer/candidates" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Quay lại ATS
        </Link>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? 'bg-primary text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {LABEL[f]} {f !== 'ALL' && stats ? `(${f === 'UNREAD' ? (stats.UNREAD || 0) + (stats.APPLIED || 0) : stats[f] || 0})` : ''}
            </button>
          ))}
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên ứng viên, email, CV hoặc địa điểm..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? (
          <div className="xl:col-span-2 flex items-center justify-center gap-2 py-16 text-slate-500 bg-white rounded-2xl border border-slate-200/60">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải hồ sơ ứng tuyển...
          </div>
        ) : candidates.length === 0 ? (
          <div className="xl:col-span-2 py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/60">Không có hồ sơ nào phù hợp.</div>
        ) : candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5 hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary font-bold flex items-center justify-center shrink-0">
                  {candidate.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{candidate.candidateName}</div>
                  <div className="text-sm text-slate-600 truncate">{candidate.candidateEmail || 'Chưa có email'}</div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${COLOR[candidate.status] || COLOR.VIEWED}`}>
                {LABEL[candidate.status] || candidate.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Ngày nộp" value={formatDateTime(candidate.appliedAt)} />
              <Info label="Địa điểm mong muốn" value={candidate.desiredLocation} />
              <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-xs text-slate-500 font-semibold">CV đính kèm</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800 truncate">{candidate.cvName || '--'}</p>
                  <button
                    onClick={() => setPreviewItem(candidate)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-primary font-semibold hover:bg-blue-100 transition-colors shrink-0"
                  >
                    <Eye className="w-4 h-4" /> Xem CV
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/employer/applications/${candidate.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
                <FileText className="w-4 h-4" /> Xem chi tiết hồ sơ
              </Link>
            </div>
          </div>
        ))}
      </section>

      {previewItem ? <CvPreviewModal item={previewItem} onClose={() => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = ''; setPreviewUrl(''); setPreviewItem(null); }} previewUrl={previewUrl} loading={previewLoading} /> : null}
    </div>
  );
};

const CvPreviewModal = ({ item, onClose, previewUrl, loading }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate">Preview CV - {item.candidateName}</h3>
          <p className="text-sm text-slate-500 truncate">{item.cvName || 'CV ứng tuyển'}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-5">
        {loading ? (
          <div className="h-[72vh] rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải CV...
          </div>
        ) : previewUrl ? (
          <object data={previewUrl} type="application/pdf" className="w-full h-[72vh] rounded-2xl border border-slate-200 bg-white">
            <embed src={previewUrl} type="application/pdf" className="w-full h-[72vh] rounded-2xl border border-slate-200 bg-white" />
            <div className="p-6 text-center text-slate-500">Trình duyệt không preview được file CV này trực tiếp.</div>
          </object>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">Không có dữ liệu CV để preview.</div>
        )}
      </div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <p className="text-xs text-slate-500 font-semibold">{label}</p>
    <p className="mt-1 font-semibold text-slate-800 truncate">{value || '--'}</p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN');
};

export default JobApplications;
