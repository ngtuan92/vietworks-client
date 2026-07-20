import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, FileText, Loader2, Search, X } from 'lucide-react';
import atsService from '../../../services/atsService';

const QUICK_FILTERS = ['ALL', 'UNREAD', 'VIEWED', 'APPROVED', 'INTERVIEW_INVITED', 'REJECTED'];
const LABEL = { ALL: 'Tất cả', UNREAD: 'Chưa xem', APPLIED: 'Đã nộp', VIEWED: 'Đã xem', APPROVED: 'Đã duyệt', INTERVIEW_INVITED: 'Đã mời phỏng vấn', REJECTED: 'Từ chối', HIRED: 'Đã tuyển' };
const COLOR = {
  UNREAD: 'bg-blue-50 text-primary border border-blue-100',
  APPLIED: 'bg-blue-50 text-primary border border-blue-100',
  VIEWED: 'bg-slate-100 text-slate-700 border border-slate-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  INTERVIEW_INVITED: 'bg-purple-50 text-purple-700 border border-purple-100',
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
  const [previewNotice, setPreviewNotice] = useState('');
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
        setPreviewNotice('');

        if (['UNREAD', 'APPLIED'].includes(previewItem.status)) {
          const viewedRes = await atsService.markApplicationAsViewed(previewItem.id);
          const viewedData = viewedRes?.data;
          if (viewedData) {
            setApplications((prev) => prev.map((item) => item.id === previewItem.id ? { ...item, ...viewedData, status: viewedData.status || 'VIEWED' } : item));
            setPreviewItem((prev) => prev ? { ...prev, ...viewedData, status: viewedData.status || 'VIEWED' } : prev);
          }
          if (viewedRes?.notificationCreated) {
            setPreviewNotice('Đã chuyển hồ sơ sang trạng thái đã xem và gửi thông báo cho ứng viên.');
          } else {
            setPreviewNotice('Hồ sơ đã được chuyển sang trạng thái đã xem.');
          }
        }

        if (previewItem.cv?.type === 'ONLINE') {
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = '';
          }
          setPreviewUrl(`/employer/talent-pool/cv-preview/${previewItem.cv.id}`);
        } else {
          const blob = await atsService.getApplicationCvBlob(previewItem.id);
          if (!active) return;
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
          const objectUrl = URL.createObjectURL(blob);
          previewUrlRef.current = objectUrl;
          setPreviewUrl(objectUrl);
        }
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Không thể tải CV để xem trước');
      } finally {
        if (active) setPreviewLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [previewItem]);


  const openCvPreview = (candidate) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
    setPreviewUrl('');
    setPreviewNotice('');
    setPreviewLoading(true);
    setPreviewItem(candidate);
  };
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
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary font-bold flex items-center justify-center shrink-0 overflow-hidden">
                  {candidate.avatar?.startsWith('http') ? (
                    <img src={candidate.avatar} alt={candidate.candidateName} className="w-full h-full object-cover" />
                  ) : (
                    candidate.avatar
                  )}
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
                    onClick={() => openCvPreview(candidate)}
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

      {previewItem ? <CvPreviewModal item={previewItem} onClose={() => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = ''; setPreviewUrl(''); setPreviewNotice(''); setPreviewLoading(false); setPreviewItem(null); }} previewUrl={previewUrl} loading={previewLoading} notice={previewNotice} /> : null}
    </div>
  );
};

const CvPreviewModal = ({ item, onClose, previewUrl, loading, notice }) => {
  const [iframeHeight, setIframeHeight] = useState(1150);
  const [iframeReady, setIframeReady] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIframeReady(false));
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SYNC_CV_HEIGHT' && e.data.height) {
        setIframeHeight(e.data.height);
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewUrl, item?.cv?.type]);

  return (
  <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
    <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col transform scale-100 animate-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-white to-slate-50">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0 border border-blue-100/50 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{item.candidateName}</h3>
            <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{item.cvName || 'CV ứng tuyển'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onClose} className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {notice ? (
        <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 text-sm font-semibold text-emerald-700">{notice}</div>
      ) : null}

      {/* Body */}
      <div className="flex-1 overflow-hidden bg-slate-100/50 p-4 md:p-6 relative">
        {previewUrl ? (
          <div className="w-full h-full rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-y-auto custom-scrollbar relative flex flex-col items-center">
            {item.cv?.type === 'ONLINE' ? (
              <iframe
                id="cv-preview-iframe"
                src={previewUrl}
                scrolling="no"
                className={`w-[820px] border-none bg-white shadow-sm transition-opacity duration-200 ${iframeReady ? 'opacity-100' : 'opacity-0'}`}
                style={{ height: `${iframeHeight}px`, flexShrink: 0 }}
                title="CV Preview"
              />
            ) : (
              <object data={previewUrl} type="application/pdf" className="w-full h-full">
                <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                  <div className="w-20 h-20 rounded-full bg-slate-200/50 flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-700 text-lg">Không thể xem trực tiếp CV</p>
                  <p className="text-sm text-slate-500 mt-2 max-w-md">Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp hoặc file bị lỗi. Bạn có thể mở sang một tab mới để xem.</p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-md shadow-blue-200 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    Mở trong thẻ mới
                  </a>
                </div>
              </object>
            )}
            {(loading || (item.cv?.type === 'ONLINE' && !iframeReady)) ? (
              <div className="absolute inset-0 z-10 rounded-2xl bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shadow-inner">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-lg">Đang tải CV</p>
                  <p className="text-sm text-slate-500 mt-1">Vui lòng đợi giây lát...</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : loading ? (
          <div className="absolute inset-4 md:inset-6 rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-lg">Đang tải CV</p>
              <p className="text-sm text-slate-500 mt-1">Vui lòng đợi giây lát...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-2xl border border-slate-200/60 bg-white shadow-sm flex items-center justify-center flex-col gap-3">
             <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <FileText className="w-8 h-8" />
             </div>
             <p className="font-semibold text-slate-600 text-lg">Không có dữ liệu CV</p>
             <p className="text-sm text-slate-400">Không tìm thấy file đính kèm của ứng viên này.</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

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





