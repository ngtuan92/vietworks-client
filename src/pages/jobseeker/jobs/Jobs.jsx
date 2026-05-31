
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobCard from '../../../components/jobseeker/jobs/JobCard';
import JobFilterSidebar from '../../../components/jobseeker/jobs/JobFilterSidebar';
import JobPagination from '../../../components/jobseeker/jobs/JobPagination';
import jobService from '../../../services/jobService';

const locationOptions = [
  { value: 'all', label: 'Tất cả địa điểm' },
  { value: '79', label: 'Hồ Chí Minh' },
  { value: '01', label: 'Hà Nội' },
  { value: '48', label: 'Đà Nẵng' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Mới nhất' },
  { value: 'salary.minMillion', label: 'Lương cao nhất' },
];

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('all');

  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '');
    setLocation(searchParams.get('location') ?? 'all');
    setSortBy(searchParams.get('sortBy') ?? 'createdAt');
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(searchParams);
        const result = await jobService.getJobs(params);
        if (result.success) {
          setJobs(result.data);
          setPagination(result.pagination);
          setTotal(result.pagination?.total || result.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (keyword.trim()) {
      params.set('q', keyword.trim());
    } else {
      params.delete('q');
    }
    if (location !== 'all') {
      params.set('location', location);
    } else {
      params.delete('location');
    }
    const qs = params.toString();
    setSearchParams(params);
    navigate(qs ? `/jobs?${qs}` : '/jobs');
  };

  const handleSortChange = (newSortBy) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    setSearchParams(params);
    setSortBy(newSortBy);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const formatLocation = (workLocations) => {
    if (!workLocations || workLocations.length === 0) return 'Không xác định';
    return workLocations[0].provinceName || workLocations[0].provinceCode || 'Không xác định';
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    if (salary.type === 'NEGOTIABLE') return 'Thỏa thuận';
    return `${salary.minMillion || 0} - ${salary.maxMillion || 0} triệu`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <p className="text-sm text-gray-500">
                  {loading ? 'Đang tải...' : `Hiển thị ${total} việc làm phù hợp`}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#f5f3f3] p-1 rounded-lg">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                      sortBy === opt.value
                        ? 'bg-white text-[#003f87] shadow-sm'
                        : 'text-gray-500 hover:text-[#003f87]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
                <p className="text-gray-500 mt-2">Đang tải việc làm...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-gray-400">work_off</span>
                <p className="text-gray-500 mt-2">Không tìm thấy việc làm phù hợp</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={job._id}
                    title={job.title}
                    company={job.companyId?.name || 'Công ty không xác định'}
                    companyAvatar={job.companyId?.avatarUrl}
                    location={formatLocation(job.workLocations)}
                    salary={formatSalary(job.salary)}
                    updatedTime={formatDate(job.updatedAt)}
                    tags={job.isUrgent ? ['Tuyển gấp'] : []}
                    skills={job.skills?.map(s => s.name) || []}
                    experience={job.experienceLevelId?.name}
                    level={job.jobLevelId?.name}
                  />
                ))}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <JobPagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
