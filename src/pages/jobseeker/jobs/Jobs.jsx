
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobCard from '../../../components/jobseeker/jobs/JobCard';
import JobFilterSidebar from '../../../components/jobseeker/jobs/JobFilterSidebar';
import JobPagination from '../../../components/jobseeker/jobs/JobPagination';

const locationOptions = [
  { value: 'all', label: 'Tất cả địa điểm' },
  { value: 'hcm', label: 'Hồ Chí Minh' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'dn', label: 'Đà Nẵng' },
];

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');

  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '');
    setLocation(searchParams.get('location') ?? 'all');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location !== 'all') params.set('location', location);
    const qs = params.toString();
    navigate(qs ? `/jobs?${qs}` : '/jobs');
  };

  const jobs = [
    {
      title: 'Kỹ sư Phần mềm Senior (Java/Cloud)',
      company: 'TechNova Solutions Việt Nam',
      location: 'Quận 1, TP. Hồ Chí Minh',
      salary: '2,500 - 4,000 USD',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY0wep9rxjDcpqULLDa0ElhlMD6FHhZTfG4Hpi2j6Xvw38c5wlOD3RNrNbxocT2rep_0fEZ4sD7kuqGYz9KwBkTmrE1d6g8NZ6BjKkOSwKXtKW1WfSSs750Vm9anpVa91vWTRDIypfB52SHpePkT_PjpYy2iSDrdRKYTuUdtTxWE7Q6MYLUV6ubaQHF-J3bwHk5MPIJP-cQbOeS0xafTPPchhXWCSXYuLt2tsKtLBwwzKju_9dNR4ZwmI_fhUQcVPb4pkIftC3hIvl',
      updatedTime: '2 giờ trước',
      tags: ['Từ xa', 'Tuyển gấp'],
    },
    {
      title: 'Trưởng phòng Marketing - Chuyển đổi số',
      company: 'Tập đoàn Ngân hàng FinTrust',
      location: 'Ba Đình, Hà Nội',
      salary: 'Thỏa thuận',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy6R6t1QhaSl_WKXrGKAHJ09FzTfnQWNoKZ93R0jQcSYcgzhCJbDOQlWgouL7CNNE7ruq63orfV3fw6AdAHu-YCpKKpmTK0kaCZAA8MFp_HIniQowZgdT-gq432BBxx_yozXrqTHMFyRkCd41AiwHXDIOrVWhg0GHsV7-5lRB8s7ohD67ipepUEpC2Nyuyk9aSjRmiAde-hCNcCvdMQAhr0dc7GMU9_tgwwjV0c5mpzSZophV1EoRbzFeQArYGI3863B2yLFwyiTaW',
      updatedTime: '1 ngày trước',
      tags: ['Ngân hàng', 'Chế độ thưởng'],
    },
    {
      title: 'Chuyên viên Thiết kế UI/UX',
      company: 'BrightSide Creative Lab',
      location: 'TP. Đà Nẵng',
      salary: '1,800 - 2,800 USD',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1A2v5UwkWZ4oMa-VeR1TCBH44r1GVoUky42rs9VT6x36kLD8DY-nk97SV-7Q7s6KQrTmhk_fGhvh7Jt3bdmUeu3Rx1G7EgxnNY4HatE4UF3zQzJLRMQ8LRSIZfYht4IMlKXTMO0yhTFw7J31CO7FWJZNv6VgmHPgU0U98cK0jO__cUuYUYyy0v006lbHi4diur9LgGh95f47NYGzEuY16U8X-vUlg6GXh2sZygkBkTBo2tSQ-nq5V9FY79FVlxN9n2mPk1dVLz2qy',
      updatedTime: '3 ngày trước',
      tags: ['Mới đăng', 'Bảo hiểm'],
    },
  ];

  return (
    <div className="bg-[#fbf9f8] min-h-screen font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-xl bg-[#003f87] p-8 mb-8">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOBHRsW-StX8LTH4RAgYNkcmkIRL-FaKyWDy3r95ATROB_j7GHy9Rhp3VJgKa9YvJGO3DQbsOIfBQUSfp-VpeGZrck-gI-ZGSW2NCgwJJglHEyA8u7n1_cWpEikxqkxOyX1DVjQNEsmoLCxEuoA4CL3ZDJn6tSHefanUWASsPbsIVKNa8ZJyhdkEZpcLjcqOlwDvbWxf___MDERCDZ8N63YerODwUqiSJimI5ZRVA-0mbtREXKskiF7xtAJqKAItMvZMk1AT1ILasw"
                alt="Office background"
              />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-6">Tìm kiếm công việc mơ ước tại Việt Nam</h1>
              <div className="bg-white rounded-xl p-2 shadow-lg flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 flex items-center px-4 gap-3 w-full border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-0">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                  <input
                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-gray-700 outline-none"
                    placeholder="Chức danh, từ khóa..."
                    type="text"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
                <div className="flex-1 flex items-center px-4 gap-3 w-full py-3 md:py-0">
                  <span className="material-symbols-outlined text-gray-400">location_on</span>
                  <select
                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-gray-700 outline-none appearance-none cursor-pointer"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    {locationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto px-10 py-3 bg-[#003f87] text-white font-bold rounded-lg hover:bg-[#004491] transition-colors flex items-center justify-center gap-2"
                >
                  Tìm việc
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <JobFilterSidebar />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-black">Việc làm đề xuất</h2>
                <p className="text-sm text-gray-500">Hiển thị 1,248 việc làm phù hợp với hồ sơ của bạn</p>
              </div>
              <div className="flex items-center gap-2 bg-[#f5f3f3] p-1 rounded-lg">
                <button className="px-4 py-2 text-sm font-semibold bg-white text-[#003f87] shadow-sm rounded-md">Mới nhất</button>
                <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-[#003f87] transition-colors">Lương cao nhất</button>
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job, index) => (
                <JobCard key={index} {...job} />
              ))}
            </div>

            <JobPagination />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
