import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobCard from '../../../components/jobseeker/jobs/JobCard';
import { Search, MapPin } from 'lucide-react';
import {
  getCareersByGroup,
  getCareerGroups,
  getExperienceLevels,
  getJobLevels,
  getPublicJobs,
} from '../../../services/jobService';

const locationOptions = [
  { value: '', label: 'Tất cả địa điểm' },
  { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
];

const saturdayOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'NOT_SPECIFIED', label: 'Không đề cập' },
  { value: 'WORK_SATURDAY', label: 'Có làm Thứ 7' },
  { value: 'OFF_SATURDAY', label: 'Nghỉ Thứ 7' },
];

const DEFAULT_LOGO =
  'https://ui-avatars.com/api/?name=Company&background=EAF2FF&color=003F87&bold=true';

const getParam = (searchParams, key, fallback = '') => searchParams.get(key) ?? fallback;

const formatSalary = (salary) => {
  if (!salary || salary.type === 'NEGOTIABLE') return 'Thỏa thuận';

  if (salary.minMillion && salary.maxMillion) {
    return `${salary.minMillion} - ${salary.maxMillion} triệu`;
  }

  if (salary.minMillion) return `Từ ${salary.minMillion} triệu`;
  if (salary.maxMillion) return `Đến ${salary.maxMillion} triệu`;

  return 'Thỏa thuận';
};

const formatLocation = (job) => {
  const first = job.workLocations?.[0];

  return (
    first?.address ||
    [first?.wardName, first?.districtName, first?.provinceName].filter(Boolean).join(', ') ||
    'Không xác định'
  );
};

const formatUpdatedTime = (dateValue) => {
  if (!dateValue) return 'Vừa cập nhật';

  const updatedAt = new Date(dateValue).getTime();
  const diffMs = Date.now() - updatedAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Vừa cập nhật';
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;

  return new Date(dateValue).toLocaleDateString('vi-VN');
};

const getTags = (job) => {
  const tags = [];

  if (job.isUrgent) tags.push('Tuyển gấp');
  if (job.premium?.isActive) tags.push('Nổi bật');
  if (job.saturdayPolicy === 'OFF_SATURDAY') tags.push('Nghỉ Thứ 7');
  if (job.jobLevelId?.name) tags.push(job.jobLevelId.name);
  if (job.experienceLevelId?.name) tags.push(job.experienceLevelId.name);

  return tags.slice(0, 4);
};

const mapJobToCard = (job) => ({
  id: job._id,
  title: job.title,
  company: job.companyId?.name || 'Công ty',
  location: formatLocation(job),
  salary: formatSalary(job.salary),
  logo: job.companyId?.avatarUrl || DEFAULT_LOGO,
  updatedTime: formatUpdatedTime(job.publishedAt || job.createdAt),
  tags: getTags(job),
});

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [careerGroupId, setCareerGroupId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [experienceLevelId, setExperienceLevelId] = useState('');
  const [jobLevelId, setJobLevelId] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [saturdayPolicy, setSaturdayPolicy] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);

  const page = Number(getParam(searchParams, 'page', '1')) || 1;

  useEffect(() => {
    setKeyword(getParam(searchParams, 'keyword') || getParam(searchParams, 'q'));
    setLocation(getParam(searchParams, 'location'));
    setCareerGroupId(getParam(searchParams, 'careerGroupId'));
    setCareerId(getParam(searchParams, 'careerId'));
    setExperienceLevelId(getParam(searchParams, 'experienceLevelId'));
    setJobLevelId(getParam(searchParams, 'jobLevelId'));
    setSalaryMin(getParam(searchParams, 'salaryMin'));
    setSalaryMax(getParam(searchParams, 'salaryMax'));
    setSaturdayPolicy(getParam(searchParams, 'saturdayPolicy'));
    setSortBy(getParam(searchParams, 'sortBy', 'publishedAt'));
    setSortOrder(getParam(searchParams, 'sortOrder', 'desc'));
  }, [searchParams]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [groupsRes, expRes, levelsRes] = await Promise.all([
          getCareerGroups(),
          getExperienceLevels(),
          getJobLevels(),
        ]);

        setCareerGroups(groupsRes.data || []);
        setExperienceLevels(expRes.data || []);
        setJobLevels(levelsRes.data || []);
      } catch (err) {
        console.error('Load public job filters error:', err);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    const fetchCareers = async () => {
      if (!careerGroupId) {
        setCareers([]);
        return;
      }

      try {
        const res = await getCareersByGroup(careerGroupId);
        setCareers(res.data || []);
      } catch (err) {
        console.error('Load careers by group error:', err);
        setCareers([]);
      }
    };

    fetchCareers();
  }, [careerGroupId]);

  const apiParams = useMemo(
    () => ({
      keyword,
      location,
      careerGroupId,
      careerId,
      experienceLevelId,
      jobLevelId,
      salaryMin,
      salaryMax,
      saturdayPolicy,
      page,
      limit: 12,
      sortBy,
      sortOrder,
    }),
    [
      keyword,
      location,
      careerGroupId,
      careerId,
      experienceLevelId,
      jobLevelId,
      salaryMin,
      salaryMax,
      saturdayPolicy,
      page,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');

        const cleanParams = Object.fromEntries(
          Object.entries(apiParams).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        );

        const res = await getPublicJobs(cleanParams);

        setJobs(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
      } catch (err) {
        console.error('Load public jobs error:', err);
        setJobs([]);
        setError(err.response?.data?.message || 'Không thể tải danh sách việc làm.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiParams]);

  const updateQuery = (nextValues = {}) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    navigate(query ? `/jobs?${query}` : '/jobs');
  };

  const handleSearch = () => {
    updateQuery({
      keyword: keyword.trim(),
      location,
      page: 1,
    });
  };

  const handleFilterSubmit = () => {
    updateQuery({
      careerGroupId,
      careerId,
      experienceLevelId,
      jobLevelId,
      salaryMin,
      salaryMax,
      saturdayPolicy,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setCareerGroupId('');
    setCareerId('');
    setExperienceLevelId('');
    setJobLevelId('');
    setSalaryMin('');
    setSalaryMax('');
    setSaturdayPolicy('');

    updateQuery({
      careerGroupId: '',
      careerId: '',
      experienceLevelId: '',
      jobLevelId: '',
      salaryMin: '',
      salaryMax: '',
      saturdayPolicy: '',
      page: 1,
    });
  };

  const handleSort = (field) => {
    if (field === 'salary.minMillion') {
      updateQuery({ sortBy: 'salary.minMillion', sortOrder: 'desc', page: 1 });
      return;
    }

    updateQuery({ sortBy: 'publishedAt', sortOrder: 'desc', page: 1 });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.pages || nextPage === page) return;
    updateQuery({ page: nextPage });
  };

  return (
    <div className="bg-[#fbf9f8] min-h-screen font-body-md">
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl hero-gradient p-8 md:p-12 mb-8 shadow-md">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOBHRsW-StX8LTH4RAgYNkcmkIRL-FaKyWDy3r95ATROB_j7GHy9Rhp3VJgKa9YvJGO3DQbsOIfBQUSfp-VpeGZrck-gI-ZGSW2NCgwJJglHEyA8u7n1_cWpEikxqkxOyX1DVjQNEsmoLCxEuoA4CL3ZDJn6tSHefanUWASsPbsIVKNa8ZJyhdkEZpcLjcqOlwDvbWxf___MDERCDZ8N63YerODwUqiSJimI5ZRVA-0mbtREXKskiF7xtAJqKAItMvZMk1AT1ILasw"
                alt="Office background"
              />
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-6">
                Tìm kiếm công việc mơ ước tại Việt Nam
              </h1>

              <div className="glass-card rounded-2xl p-2 md:flex items-center gap-2 shadow-xl">
                <div className="flex-1 flex items-center px-4 gap-3 w-full border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-0">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-gray-700 outline-none"
                    placeholder="Chức danh, từ khóa..."
                    type="text"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSearch();
                    }}
                  />
                </div>

                <div className="flex-1 flex items-center px-4 gap-3 w-full py-3 md:py-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <select
                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-gray-700 outline-none appearance-none cursor-pointer"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    {locationOptions.map((opt) => (
                      <option key={opt.value || 'all'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full md:w-auto px-10 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Tìm việc
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 sticky top-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bộ lọc việc làm</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Lọc theo ngành, lương, kinh nghiệm và chính sách làm việc.
                </p>
              </div>

              <SelectFilter
                label="Nhóm ngành"
                value={careerGroupId}
                onChange={(value) => {
                  setCareerGroupId(value);
                  setCareerId('');
                }}
                options={careerGroups.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Ngành nghề"
                value={careerId}
                onChange={setCareerId}
                disabled={!careerGroupId}
                options={careers.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Kinh nghiệm"
                value={experienceLevelId}
                onChange={setExperienceLevelId}
                options={experienceLevels.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Cấp bậc"
                value={jobLevelId}
                onChange={setJobLevelId}
                options={jobLevels.map((item) => ({ value: item._id, label: item.name }))}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Khoảng lương triệu VND
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={salaryMin}
                    onChange={(event) => setSalaryMin(event.target.value)}
                    placeholder="Từ"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    value={salaryMax}
                    onChange={(event) => setSalaryMax(event.target.value)}
                    placeholder="Đến"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <SelectFilter
                label="Chính sách Thứ 7"
                value={saturdayPolicy}
                onChange={setSaturdayPolicy}
                options={saturdayOptions.slice(1)}
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleFilterSubmit}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
                >
                  Áp dụng
                </button>
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Xóa
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-black">Việc làm đề xuất</h2>
                <p className="text-sm text-gray-500">
                  {loading
                    ? 'Đang tải danh sách việc làm...'
                    : `Hiển thị ${jobs.length} / ${pagination.total || 0} việc làm phù hợp`}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#f5f3f3] p-1 rounded-lg">
                <button
                  onClick={() => handleSort('publishedAt')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md ${
                    sortBy === 'publishedAt'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => handleSort('salary.minMillion')}
                  className={`px-4 py-2 text-sm font-semibold rounded-md ${
                    sortBy === 'salary.minMillion'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  Lương cao nhất
                </button>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((item) => <JobSkeleton key={item} />)
              ) : jobs.length > 0 ? (
                jobs.map((job) => {
                  const cardJob = mapJobToCard(job);

                  return (
                    <JobCard key={job._id} {...cardJob} />
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="font-semibold text-slate-800">Không tìm thấy việc làm phù hợp</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc.
                  </p>
                </div>
              )}
            </div>

            {pagination.pages > 1 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <PageButton disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                  Trước
                </PageButton>

                {Array.from({ length: pagination.pages }, (_, index) => index + 1)
                  .filter((item) => item === 1 || item === pagination.pages || Math.abs(item - page) <= 2)
                  .map((item, index, arr) => {
                    const previous = arr[index - 1];
                    const showDots = previous && item - previous > 1;

                    return (
                      <span key={item} className="flex items-center gap-2">
                        {showDots ? <span className="px-1 text-slate-400">...</span> : null}
                        <PageButton active={item === page} onClick={() => handlePageChange(item)}>
                          {item}
                        </PageButton>
                      </span>
                    );
                  })}

                <PageButton disabled={page >= pagination.pages} onClick={() => handlePageChange(page + 1)}>
                  Sau
                </PageButton>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

const SelectFilter = ({ label, value, onChange, options, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-400"
    >
      <option value="">Tất cả</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const PageButton = ({ children, active = false, disabled = false, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
      active
        ? 'bg-primary text-white'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

const JobSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="h-14 w-14 rounded-xl bg-slate-100" />
      <div className="flex-1">
        <div className="h-5 w-3/4 rounded bg-slate-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-100" />
          <div className="h-6 w-24 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  </div>
);

export default Jobs;