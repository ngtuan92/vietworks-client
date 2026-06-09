import { useNavigate } from 'react-router-dom';
import Hero from '../../../components/jobseeker/home/Hero';
import JobGrid from '../../../components/jobseeker/jobs/JobGrid';
import useAuth from '../../../hooks/useAuth';
import { useNotification } from '../../../contexts/NotificationContext';
import { Heart, UserPlus, ShieldCheck, MessageCircle } from 'lucide-react';

const featuredJobs = [
  {
    id: 1,
    title: 'Senior Backend Engineer (Node.js)',
    company: 'TechNova Solutions',
    location: 'Hồ Chí Minh',
    salary: '35 - 50 triệu',
    badge: 'Nổi bật',
  },
  {
    id: 2,
    title: 'Product Designer (UI/UX)',
    company: 'BrightSide Creative',
    location: 'Đà Nẵng',
    salary: '25 - 35 triệu',
    badge: 'GẤP',
  },
  {
    id: 3,
    title: 'Digital Marketing Lead',
    company: 'FinTrust Group',
    location: 'Hà Nội',
    salary: 'Thỏa thuận',
    badge: 'Top Employer',
  },
];

const featuredCompanies = [
  { id: 1, name: 'TechNova Solutions', industry: 'Công nghệ', openings: 24 },
  { id: 2, name: 'FinTrust Group', industry: 'Tài chính - Ngân hàng', openings: 12 },
  { id: 3, name: 'BrightSide Creative', industry: 'Thiết kế - Sáng tạo', openings: 8 },
  { id: 4, name: 'GreenLogistics', industry: 'Logistics', openings: 10 },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { confirm } = useNotification();

  const goProtected = (path) => {
    if (!isAuthenticated) {
      confirm(
        'Bạn cần đăng nhập để sử dụng tính năng này. Vui lòng đăng nhập để tiếp tục.',
        () => {
          navigate('/login', { state: { from: path } });
        },
        null,
        'Yêu cầu đăng nhập',
        'Đăng nhập',
        'Hủy'
      );
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col">
      <main className="flex-grow">
        <Hero />
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Việc làm nổi bật</h2>
                <p className="text-slate-600 mt-1">Các cơ hội tuyển dụng đang được ưu tiên hiển thị.</p>
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="text-primary font-semibold hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => navigate('/jobs')}
                  className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover-3d border-transparent"
                >
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {job.badge}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2">{job.title}</h3>
                  <p className="mt-1 text-slate-600">{job.company}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{job.location}</span>
                    <span className="font-semibold text-primary">{job.salary}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <JobGrid />

        <section className="py-16 bg-white">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-8 bg-gradient-to-r from-[#003f87] to-[#115bb0] text-white">
                <h3 className="text-2xl font-bold">Tạo CV ngay</h3>
                <p className="mt-2 text-white/90">
                  Dùng mẫu CV chuẩn theo từng vị trí, chỉnh sửa nhanh và tải xuống ngay.
                </p>
                <button
                  onClick={() => goProtected('/manage-cv')}
                  className="mt-6 px-5 py-3 bg-white text-primary font-bold rounded-lg hover:opacity-90"
                >
                  Bắt đầu tạo CV
                </button>
              </div>

              <div className="rounded-2xl p-8 bg-gradient-to-r from-[#0f172a] to-[#1f2937] text-white">
                <h3 className="text-2xl font-bold">Quảng bá AI Review CV</h3>
                <p className="mt-2 text-white/90">
                  Chấm điểm CV, so khớp JD và nhận gợi ý cải thiện để tăng tỷ lệ đậu phỏng vấn.
                </p>
                <button
                  onClick={() => goProtected('/premium')}
                  className="mt-6 px-5 py-3 bg-emerald-400 text-slate-900 font-bold rounded-lg hover:opacity-90"
                >
                  Phân tích CV với AI
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Danh sách công ty</h2>
                <p className="text-slate-600 mt-1">Khám phá nhà tuyển dụng nổi bật trên nền tảng.</p>
              </div>
              <button
                onClick={() => navigate('/companies')}
                className="text-primary font-semibold hover:underline"
              >
                Xem tất cả công ty
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => navigate(`/companies/${company.id}`)}
                  className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover-3d border-transparent"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary font-bold flex items-center justify-center">
                    {company.name.charAt(0)}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">{company.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{company.industry}</p>
                  <p className="mt-3 text-sm font-medium text-primary">{company.openings} vị trí đang tuyển</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 z-40">
        <FloatingActionButton onClick={() => goProtected('/jobs')} icon={<Heart className="w-5 h-5" />} label="Việc làm đã lưu" />
        <FloatingActionButton onClick={() => goProtected('/manage-cv')} icon={<UserPlus className="w-5 h-5" />} label="Hồ sơ sự nghiệp" />
        <FloatingActionButton onClick={() => goProtected('/profile')} icon={<ShieldCheck className="w-5 h-5" />} label="Xác thực tài khoản" />
        <FloatingActionButton onClick={() => navigate('/companies')} icon={<MessageCircle className="w-5 h-5" />} label="Trung tâm trợ giúp" isPrimary animate="animate-bounce hover:animate-none" />
      </div>
    </div>
  );
};

const FloatingActionButton = ({ icon, label, isPrimary = false, animate = '', onClick }) => (
  <button
    onClick={onClick}
    className={`w-12 h-12 shadow-lg border border-outline-variant rounded-full flex items-center justify-center transition-all group relative ${
      isPrimary ? 'bg-primary text-white shadow-xl' : 'bg-white text-primary hover:bg-primary hover:text-white'
    } ${animate}`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="absolute right-full mr-3 bg-on-background text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </button>
);

export default Home;
