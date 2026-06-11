
import JobCard from './JobCard';
import { ArrowRight } from 'lucide-react';

const JobGrid = () => {
  const jobs = [
    {
      title: 'Lập trình viên Frontend Senior (React)',
      company: 'FPT Software Việt Nam',
      location: 'Hồ Chí Minh',
      salary: '1,500 - 3,000 USD',
      experience: '3+ năm',
      level: 'Senior',
      workType: 'Hybrid',
      deadline: '31/05/2026',
      tags: ['React', 'TypeScript', 'Tuyển gấp'],
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBieZ8BAj0npjW-56XALlgmnnsUo8YEIgoTjJOdZFjqavs0Ncepz7njEGzvvKFrFJ01cGnYmZPtaYXF6_7Dt5tamYCVKegAvHWmMqO6tYVMzD_HEuBAwxFmsSt1VmyGX8IbASepgipv3MSyC38EHQW4J6UfhpsO8OJYOtEbgu2n97j5pw9WYcvjdl44523YaX7zZtqQMJLOkzclaCDml1yalvg6MuJ4V_S8OLHp7AYpb6QltYGzJUNZdTWSrRNhha6RZ-Tfc4s_mqWp',
      updatedTime: '2 giờ trước',
    },
    {
      title: 'Quản lý Chuỗi cung ứng',
      company: 'DHL Global Forwarding',
      location: 'Hà Nội',
      salary: 'Thỏa thuận',
      experience: '2+ năm',
      level: 'Trưởng nhóm',
      workType: 'Toàn thời gian',
      deadline: '28/05/2026',
      tags: ['Logistics', 'Quản lý'],
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBFK6Gzvt5tffsmjwPQ4Bp0Ti9pT1r-ArsjxttUgBIA144TxdX96AvYottYaY8pDVHwtS1RiZjlsdSbRm3SThdJ3Hrn6685gAPSRsx45qA3hysdNJyPmFNYEiv7HnEW4xf9xXeE1Nn1_yoI2XBEA3t5vw67DkJG8qfiB2Qzc4aLNK0nykAMXqIhON3bG22__OkgTAhmB96DlXLeQ8UQmflj3rd84z4IX5Fy9aegYiFCaSBZ38p4DGwpoDIfFtEPzt_KE-L6IgiP7sA',
      updatedTime: '5 giờ trước',
    },
    {
      title: 'Chuyên viên Phân tích Tài chính Senior',
      company: 'VinaCapital Group',
      location: 'Hồ Chí Minh',
      salary: '2,000 - 3,500 USD',
      experience: '3-5 năm',
      level: 'Senior',
      workType: 'Toàn thời gian',
      deadline: '02/06/2026',
      tags: ['Finance', 'Phân tích dữ liệu'],
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyrwzxJ1utCE_QM8J9O10kzUMr5VG-x5RpWoYoRM9lM4GDooZR1ywYaSTvFq6oQHgvb_SewDkutexW5yefsVV62BAF8vFGb7MEbubEtYw6Ujp7rhmP0l7-BfurraXjCo3_1-FYHRw29FrGyK-TQSgay_w77lTTb1T6YG_ltMf96R1Rxlg97qO52NE6LV1ggWJ2bGDcgKzAQu10BL2MCMP2A3UNcyTa8JWSUm9Lwo7DnRJ4BJITWGwjm7t8LW6iYZCZlTgB4plaG0eg',
      updatedTime: '10 phút trước',
    },
  ];

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-on-surface">Việc làm phù hợp với bạn</h2>
            </div>
            <p className="text-sm text-on-surface-variant">Phù hợp với hồ sơ và mục tiêu nghề nghiệp của bạn</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap">Mới nhất</button>
            <button className="bg-white border border-outline-variant px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:border-primary whitespace-nowrap transition-colors">Lương cao</button>
            <button className="bg-white border border-outline-variant px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface hover:text-primary hover:border-primary whitespace-nowrap transition-colors">Làm từ xa</button>
            <button className="px-3 py-1.5 text-sm text-primary font-bold flex items-center gap-1 whitespace-nowrap">
              Xem tất cả <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, index) => (
            <JobCard key={index} {...job} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobGrid;
