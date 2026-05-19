import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const MOCK_CANDIDATES = [
  { id: 201, name: 'Nguyễn Minh Anh', avatar: 'N', desiredRole: 'Backend Developer', experience: '4 năm', skills: ['Node.js', 'PostgreSQL', 'Docker'], cv: 'CV_Backend.pdf', status: 'UNREAD' },
  { id: 202, name: 'Lê Thảo Vy', avatar: 'L', desiredRole: 'Senior Backend Engineer', experience: '5 năm', skills: ['Node.js', 'AWS', 'Redis'], cv: 'CV_ThaoVy.pdf', status: 'APPROVED' },
  { id: 203, name: 'Phạm Đức Huy', avatar: 'P', desiredRole: 'Backend Engineer', experience: '2 năm', skills: ['Express', 'MongoDB'], cv: 'CV_DucHuy.pdf', status: 'VIEWED' },
  { id: 204, name: 'Trần Gia Hân', avatar: 'T', desiredRole: 'Fullstack Developer', experience: '3 năm', skills: ['React', 'Node.js'], cv: 'CV_GiaHan.pdf', status: 'REJECTED' },
];

const QUICK_FILTERS = ['ALL', 'UNREAD', 'VIEWED', 'APPROVED', 'REJECTED'];
const LABEL = { ALL: 'Tất cả', UNREAD: 'Chưa xem', VIEWED: 'Đã xem', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };
const COLOR = {
  UNREAD: 'bg-slate-100 text-slate-700',
  VIEWED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
};

const JobApplications = () => {
  const { id } = useParams();
  const [filter, setFilter] = useState('ALL');

  const candidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((c) => filter === 'ALL' || c.status === filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ ứng tuyển theo từng Job</h1>
          <p className="text-slate-600 mt-1">Job #{id} • Senior Backend Developer • 24 hồ sơ</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
            Từ chối nhiều CV
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
            Xuất danh sách
          </button>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                filter === f ? 'bg-[#003f87] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {LABEL[f]}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center">
                  {candidate.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{candidate.name}</div>
                  <div className="text-sm text-slate-600">{candidate.desiredRole}</div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${COLOR[candidate.status]}`}>
                {LABEL[candidate.status]}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Kinh nghiệm" value={candidate.experience} />
              <Info label="CV đính kèm" value={candidate.cv} />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Kỹ năng nổi bật</p>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/employer/applications/${candidate.id}`} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                Xem CV
              </Link>
              <button className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Chat</button>
              <button className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50">Duyệt</button>
              <button className="px-3 py-2 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50">Từ chối</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default JobApplications;
