import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
            className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]"
          >
            Xem theo từng Job
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tin tuyển dụng</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white"
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Từ ngày</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Đến ngày</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Ứng viên', 'Job ứng tuyển', 'CV', 'Kinh nghiệm', 'Địa điểm mong muốn', 'Ngày nộp', 'Trạng thái', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-4 min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
                        {row.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{row.candidateName}</div>
                        <div className="text-xs text-slate-500">ID: {row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-[220px]">{row.jobTitle}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.cvName}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.experience}</td>
                  <td className="px-4 py-4 min-w-[220px]">{row.desiredLocation}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.appliedAt}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[220px]">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/employer/applications/${row.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                      >
                        Xem CV
                      </Link>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                        Chat
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
                        Duyệt
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 font-medium hover:bg-red-50">
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">Không có hồ sơ phù hợp.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CandidateList;
