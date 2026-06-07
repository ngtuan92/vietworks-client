import { Link } from 'react-router-dom';
import { ThumbsUp, MapPin, DollarSign, Settings, Sliders, Briefcase, ChevronRight, Award } from 'lucide-react';

const MOCK_MATCHED_JOBS = [
  {
    id: 'job1',
    title: 'Senior React Developer',
    company: 'VNG Corporation',
    location: 'Quận 7, TP. Hồ Chí Minh',
    salary: '25 - 35 triệu',
    matchScore: 98,
    tags: ['ReactJS', 'JavaScript', 'TailwindCSS'],
    level: 'Chuyên viên (Senior)'
  },
  {
    id: 'job2',
    title: 'Frontend Developer (Junior/Middle)',
    company: 'FPT Software',
    location: 'Quận Cầu Giấy, Hà Nội',
    salary: '15 - 22 triệu',
    matchScore: 92,
    tags: ['ReactJS', 'CSS', 'TypeScript'],
    level: 'Nhân viên (Junior)'
  },
  {
    id: 'job3',
    title: 'Fullstack Engineer (React & Node.js)',
    company: 'KMS Technology',
    location: 'Quận Tân Bình, TP. Hồ Chí Minh',
    salary: '28 - 40 triệu',
    matchScore: 87,
    tags: ['ReactJS', 'NodeJS', 'Express'],
    level: 'Chuyên viên (Senior)'
  }
];

const MatchedJobs = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body-md text-slate-800 antialiased">
      <main className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
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

        {/* Match Criteria Info Card */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-slate-700 flex flex-wrap gap-2 items-center text-xs md:text-sm">
          <span className="font-bold text-[#003f87]">Tiêu chí đang khớp:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-slate-600 font-semibold">Vị trí: Kỹ sư phần mềm</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-slate-600 font-semibold">Địa điểm: Hà Nội / TP. HCM</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-slate-600 font-semibold">Lương: &gt; 15 triệu</span>
        </div>

        {/* Recommended List */}
        <div className="space-y-4">
          {MOCK_MATCHED_JOBS.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all relative overflow-hidden"
            >
              {/* Match Score Badge */}
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-bl-xl">
                {job.matchScore}% KHỚP
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4">
                  {/* Mock company logo */}
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-sm">
                    {job.company.split(' ')[0]}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-950 text-base md:text-lg hover:text-primary transition-colors">
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-sm text-slate-600">{job.company}</p>
                    
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
                        <Award className="w-3.5 h-3.5" />
                        {job.level}
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

                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end">
                  <Link 
                    to={`/jobs/${job.id}`} 
                    className="px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 transition flex items-center gap-1 cursor-pointer"
                  >
                    Xem & ứng tuyển
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MatchedJobs;
