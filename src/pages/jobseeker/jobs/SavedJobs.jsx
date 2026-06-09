import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, DollarSign, Calendar, Eye, Send, Briefcase } from 'lucide-react';

const INITIAL_MOCK_JOBS = [
  {
    id: 'job1',
    title: 'Senior Frontend Developer (ReactJS)',
    company: {
      name: 'VNG Corporation',
      logo: null,
      isVerified: true
    },
    location: 'Quận 7, TP. Hồ Chí Minh',
    salary: '25 - 35 triệu',
    savedAt: '2026-06-05T09:00:00Z',
    tags: ['ReactJS', 'TailwindCSS', 'TypeScript']
  },
  {
    id: 'job2',
    title: 'UI/UX Product Designer',
    company: {
      name: 'FPT Software',
      logo: null,
      isVerified: true
    },
    location: 'Quận Cầu Giấy, Hà Nội',
    salary: '18 - 28 triệu',
    savedAt: '2026-06-06T14:30:00Z',
    tags: ['Figma', 'User Research', 'Wireframing']
  },
  {
    id: 'job3',
    title: 'Full Stack Engineer (NodeJS & React)',
    company: {
      name: 'KMS Technology',
      logo: null,
      isVerified: false
    },
    location: 'Quận Tân Bình, TP. Hồ Chí Minh',
    salary: '30 - 45 triệu',
    savedAt: '2026-06-07T11:20:00Z',
    tags: ['NodeJS', 'ReactJS', 'AWS']
  }
];

const SavedJobs = () => {
  const [jobs, setJobs] = useState(INITIAL_MOCK_JOBS);
  const [statusMsg, setStatusMsg] = useState('');

  const handleUnsave = (id, title) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    setStatusMsg(`Đã bỏ lưu công việc "${title}"`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
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
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold animate-in fade-in duration-200">
            {statusMsg}
          </div>
        )}

        {/* List of Jobs */}
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex gap-4">
                    {/* Mock Company Logo */}
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm">
                      {job.company.name.split(' ')[0]}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-950 text-base md:text-lg hover:text-primary transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        {job.company.name}
                        {job.company.isVerified && (
                          <span className="inline-flex text-[10px] font-bold text-white bg-blue-500 rounded px-1 py-0.2">PRO</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <DollarSign className="w-3.5 h-3.5" />
                          Lương {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Đã lưu: {formatDate(job.savedAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center md:flex-col justify-between md:justify-center gap-3 mt-4 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <button 
                      onClick={() => handleUnsave(job.id, job.title)}
                      className="p-2.5 rounded-xl border border-slate-200 text-red-500 hover:bg-red-50 transition cursor-pointer flex items-center justify-center"
                      title="Bỏ lưu công việc này"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>
                    <div className="flex gap-2">
                      <Link 
                        to={`/jobs/${job.id}`} 
                        className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </Link>
                      <Link 
                        to={`/jobs/${job.id}`} 
                        className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ứng tuyển
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
