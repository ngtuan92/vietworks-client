import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const MOCK_JOBS = [
  { id: 1, title: 'Senior Backend Developer' },
  { id: 2, title: 'Product Designer' },
  { id: 3, title: 'Sales Executive' },
];

const MOCK_APPS = [
  {
    id: 101,
    candidateName: 'Nguyễn Minh Anh',
    avatar: 'N',
    jobId: 1,
    jobTitle: 'Senior Backend Developer',
    cvName: 'CV_Backend_NguyenMinhAnh.pdf',
    experience: '4 năm',
    desiredLocation: 'TP. Hồ Chí Minh - Quận 1',
    appliedAt: '18/05/2026 10:22',
    status: 'UNREAD',
    message: '',
  },
  {
    id: 102,
    candidateName: 'Trần Quốc Huy',
    avatar: 'T',
    jobId: 2,
    jobTitle: 'Product Designer',
    cvName: 'CV_UIUX_TranQuocHuy.pdf',
    experience: '2 năm',
    desiredLocation: 'Hà Nội - Hoàn Kiếm',
    appliedAt: '17/05/2026 15:05',
    status: 'VIEWED',
    message: '',
  },
  {
    id: 103,
    candidateName: 'Lê Thảo Vy',
    avatar: 'L',
    jobId: 1,
    jobTitle: 'Senior Backend Developer',
    cvName: 'CV_LeThaoVy.pdf',
    experience: '5 năm',
    desiredLocation: 'TP. Hồ Chí Minh - Quận 1',
    appliedAt: '16/05/2026 09:10',
    status: 'APPROVED',
    message: 'Mời phỏng vấn vòng 1 vào 20/05/2026 lúc 10:00 (Online).',
  },
  {
    id: 104,
    candidateName: 'Phạm Gia Bảo',
    avatar: 'P',
    jobId: 3,
    jobTitle: 'Sales Executive',
    cvName: 'CV_Sales_PhamGiaBao.pdf',
    experience: '1 năm',
    desiredLocation: 'Đà Nẵng - Hải Châu',
    appliedAt: '15/05/2026 11:30',
    status: 'REJECTED',
    message: 'Hồ sơ chưa phù hợp với yêu cầu công việc.',
  },
];

const STATUS_LABEL = {
  UNREAD: 'Chưa xem',
  VIEWED: 'Đã xem',
  APPROVED: 'Chấp nhận',
  REJECTED: 'Từ chối',
};

const STATUS_COLOR = {
  UNREAD: 'bg-slate-100 text-slate-700',
  VIEWED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
};

const CandidateList = () => {
  const navigate = useNavigate();
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const filtered = useMemo(() => {
    return MOCK_APPS.filter((app) => {
      if (jobId && String(app.jobId) !== String(jobId)) return false;
      if (status && app.status !== status) return false;
      if (keyword) {
        const k = keyword.trim().toLowerCase();
        const blob = `${app.candidateName} ${app.jobTitle} ${app.cvName}`.toLowerCase();
        if (!blob.includes(k)) return false;
      }
      // UI-only: date filters are visual; not parsing dateTime for simplicity
      if (dateFrom || dateTo) {
        // keep as-is
      }
      return true;
    });
  }, [jobId, status, keyword, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách hồ sơ ứng tuyển</h1>
          <p className="text-slate-600 mt-1">Xem và xử lý toàn bộ hồ sơ ứng viên đã nộp vào các tin tuyển dụng.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/employer/jobs" className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Về danh sách tin
          </Link>
          <button
            onClick={() => navigate('/employer/jobs/1/applications')}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Xem theo từng Job
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tin tuyển dụng</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
            >
              <option value="">Tất cả</option>
              {MOCK_JOBS.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái CV</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
            >
              <option value="">Tất cả</option>
              <option value="UNREAD">Chưa xem</option>
              <option value="VIEWED">Đã xem</option>
              <option value="APPROVED">Chấp nhận</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên ứng viên, kỹ năng, job..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Từ ngày</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Đến ngày</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* TABLE LIST LAYOUT */}
      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                {['Ứng viên', 'Job đã ứng tuyển', 'Kinh nghiệm', 'Khu vực', 'Ngày nộp', 'Trạng thái', 'Hành động'].map((head) => (
                  <th key={head} className="text-left px-5 py-3.5 font-semibold whitespace-nowrap">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Không có hồ sơ nào phù hợp.</td>
                </tr>
              ) : (
                filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center shrink-0">
                          {app.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{app.candidateName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{app.cvName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{app.jobTitle}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{app.experience}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">{app.desiredLocation}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">{app.appliedAt}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[app.status]}`}>
                        {STATUS_LABEL[app.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        title="Xem chi tiết"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-800 hover:text-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SLIDE-OUT DRAWER (CV QUICK VIEW) */}
      {selectedApp && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setSelectedApp(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-[600px] xl:w-[700px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-primary text-xl font-bold flex items-center justify-center">
                  {selectedApp.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedApp.candidateName}</h2>
                  <p className="text-sm text-slate-500">Ứng tuyển: <span className="font-semibold text-slate-700">{selectedApp.jobTitle}</span></p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex gap-3">
              <button className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Chấp nhận / Duyệt
              </button>
              <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Chat
              </button>
              <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all">
                Từ chối
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200/60 premium-shadow h-full flex flex-col items-center justify-center text-slate-400">
                <p className="font-medium mb-2">[Khu vực hiển thị PDF/Trình xem CV]</p>
                <p className="text-sm">{selectedApp.cvName}</p>
                <a href={`/employer/applications/${selectedApp.id}`} className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                  Mở toàn màn hình
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateList;
