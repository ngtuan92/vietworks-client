import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobCard from '../../../components/jobseeker/jobs/JobCard';
import { Search, MapPin } from 'lucide-react';
import { EXPERIENCE_LEVELS } from '../../../constants/masterDataConstants';
import {
  getCareerGroups,
  getCareersByGroup,
  getCareerPositions,
  getJobLevels,
  getPublicJobs,
} from '../../../services/jobService';
import { useSearchStore } from '../../../store/searchStore';
import companyLocationService from '../../../services/companyLocationService';
import { useAuthStore } from '../../../store/authStore';
import cvService from '../../../services/cvService';
import { getAiMatchingJobs } from '../../../services/jobseekerService';

const saturdayOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'NOT_SPECIFIED', label: 'Không đề cập' },
  { value: 'WORKING_SATURDAY', label: 'Có làm Thứ 7' },
  { value: 'OFF_SATURDAY', label: 'Nghỉ Thứ 7' },
];

const STATIC_SALARY_RANGES = [
  { value: '', label: 'Chọn khoảng lương...', min: '', max: '' },
  { value: '0-10', label: 'Dưới 10 triệu', min: 0, max: 10 },
  { value: '10-15', label: '10 - 15 triệu', min: 10, max: 15 },
  { value: '15-20', label: '15 - 20 triệu', min: 15, max: 20 },
  { value: '20-25', label: '20 - 25 triệu', min: 20, max: 25 },
  { value: '25-30', label: '25 - 30 triệu', min: 25, max: 30 },
  { value: '30-50', label: '30 - 50 triệu', min: 30, max: 50 },
  { value: '50-999', label: 'Trên 50 triệu', min: 50, max: 999 },
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
  if (job.experience) tags.push(job.experience);
  if (job.jobLevelId?.name) tags.push(job.jobLevelId.name);

  return tags.slice(0, 3);
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
  neededCount: job.neededCount || job.applicationCount,
  isHiringFull: Boolean(job.isHiringFull),
});

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = useSearchStore(state => state.globalKeyword);
  const setKeyword = useSearchStore(state => state.setGlobalKeyword);
  const location = useSearchStore(state => state.globalLocation);
  const setLocation = useSearchStore(state => state.setGlobalLocation);
  
  const [careerGroupId, setCareerGroupId] = useState('');
  const [careerId, setCareerId] = useState('');
  const [careerPositionId, setCareerPositionId] = useState('');
  const [experience, setExperience] = useState('');
  const [jobLevelId, setJobLevelId] = useState('');
  const [salaryRangeCode, setSalaryRangeCode] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [saturdayPolicy, setSaturdayPolicy] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Job Recommendation States
  const { isAuthenticated } = useAuthStore();
  const [onlineCvs, setOnlineCvs] = useState([]);
  const [uploadedCvs, setUploadedCvs] = useState([]);
  const [selectedCv, setSelectedCv] = useState({ id: '', type: '' });
  const [uploadingCv, setUploadingCv] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiJobs, setAiJobs] = useState(null);
  const [aiError, setAiError] = useState('');

  // Fetch candidate's CV list
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCvs = async () => {
      try {
        const [onlineRes, uploadedRes] = await Promise.all([
          cvService.getUserCvs(),
          cvService.getUserUploadedCvs()
        ]);
        const oCvs = onlineRes.data || [];
        const uCvs = uploadedRes.data || [];
        setOnlineCvs(oCvs);
        setUploadedCvs(uCvs);

        // Pre-select first CV if available
        if (oCvs.length > 0) {
          setSelectedCv({ id: oCvs[0]._id || oCvs[0].id, type: 'ONLINE' });
        } else if (uCvs.length > 0) {
          setSelectedCv({ id: uCvs[0]._id || uCvs[0].id, type: 'UPLOADED' });
        }
      } catch (err) {
        console.error('Fetch CVs for AI matching error:', err);
      }
    };
    fetchCvs();
  }, [isAuthenticated]);

  const handleUploadCv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    setUploadingCv(true);
    setAiError('');
    try {
      const res = await cvService.uploadCv(formData);
      if (res.success && res.data) {
        const newUploaded = res.data;
        setUploadedCvs(prev => [newUploaded, ...prev]);
        setSelectedCv({ id: newUploaded._id || newUploaded.id, type: 'UPLOADED' });
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Không thể tải lên CV.');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleAiMatching = async () => {
    if (!selectedCv.id || !selectedCv.type) {
      setAiError('Vui lòng chọn hoặc tải lên một CV.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    try {
      const res = await getAiMatchingJobs({
        cvId: selectedCv.id,
        cvType: selectedCv.type
      });
      if (res.success) {
        setAiJobs(res.data || []);
      } else {
        setAiError(res.message || 'Lỗi khi tìm việc làm phù hợp bằng AI.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Lỗi hệ thống khi đối sánh AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearAiJobs = () => {
    setAiJobs(null);
  };

  const filteredAiJobs = useMemo(() => {
    if (aiJobs === null) return null;

    return aiJobs.filter(job => {
      // 1. Filter by careerGroupId
      if (careerGroupId && String(job.careerGroupId?._id || job.careerGroupId) !== careerGroupId) {
        return false;
      }
      // 2. Filter by careerId
      if (careerId && String(job.careerId?._id || job.careerId) !== careerId) {
        return false;
      }
      // 3. Filter by careerPositionId
      if (careerPositionId && String(job.careerPositionId?._id || job.careerPositionId) !== careerPositionId) {
        return false;
      }
      // 4. Filter by jobLevelId
      if (jobLevelId && String(job.jobLevelId?._id || job.jobLevelId) !== jobLevelId) {
        return false;
      }
      // 5. Filter by experience
      if (experience && job.experience !== experience) {
        return false;
      }
      // 6. Filter by Saturday policy
      if (saturdayPolicy && job.saturdayPolicy !== saturdayPolicy) {
        return false;
      }
      // 7. Filter by salary range
      if (salaryMin && job.salary?.minMillion && job.salary.minMillion < Number(salaryMin)) {
        return false;
      }
      if (salaryMax && job.salary?.maxMillion && job.salary.maxMillion > Number(salaryMax)) {
        return false;
      }

      return true;
    });
  }, [aiJobs, careerGroupId, careerId, careerPositionId, jobLevelId, experience, saturdayPolicy, salaryMin, salaryMax]);

  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [careerPositions, setCareerPositions] = useState([]);

  const [globalJobLevels, setGlobalJobLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const page = Number(getParam(searchParams, 'page', '1')) || 1;

  useEffect(() => {
    Promise.resolve().then(() => {
      if (searchParams.has('keyword') || searchParams.has('q')) {
        setKeyword(getParam(searchParams, 'keyword') || getParam(searchParams, 'q'));
      }
      if (searchParams.has('location')) {
        setLocation(getParam(searchParams, 'location'));
      }
      setCareerGroupId(getParam(searchParams, 'careerGroupId'));
      setCareerId(getParam(searchParams, 'careerId'));
      setCareerPositionId(getParam(searchParams, 'careerPositionId'));
      setExperience(getParam(searchParams, 'experience'));
      setJobLevelId(getParam(searchParams, 'jobLevelId'));
      setSalaryRangeCode(getParam(searchParams, 'salaryRangeCode'));
      setSalaryMin(getParam(searchParams, 'salaryMin'));
      setSalaryMax(getParam(searchParams, 'salaryMax'));
      setSaturdayPolicy(getParam(searchParams, 'saturdayPolicy'));
      setSortBy(getParam(searchParams, 'sortBy', 'publishedAt'));
      setSortOrder(getParam(searchParams, 'sortOrder', 'desc'));
    });
  }, [searchParams, setKeyword, setLocation]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [groupsRes, levelsRes, provincesRes] = await Promise.all([
          getCareerGroups(),
          getJobLevels(),
          companyLocationService.getProvinces(),
        ]);

        setCareerGroups(groupsRes.data || []);
        setGlobalJobLevels(levelsRes.data || []);
        setJobLevels(levelsRes.data || []);
        setProvinces(provincesRes || []);
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

    const updateJobLevels = () => {
      if (!careerGroupId) {
        setJobLevels(globalJobLevels);
        return;
      }
      
      const selectedGroup = careerGroups.find(g => g._id === careerGroupId);
      if (selectedGroup && selectedGroup.slug !== 'cong-nghe-thong-tin') {
        const itLevels = [
          'Thực tập sinh (IT)', 'Fresher', 'Junior', 'Senior', 
          'Technical Leader', 'IT Manager / Project Manager', 
          'Giám đốc công nghệ (CTO) / Director'
        ];
        setJobLevels(globalJobLevels.filter(lvl => !itLevels.includes(lvl.name)));
      } else {
        setJobLevels(globalJobLevels);
      }
    };

    fetchCareers();
    updateJobLevels();
  }, [careerGroupId, careerGroups, globalJobLevels]);

  useEffect(() => {
    const fetchCareerPositions = async () => {
      if (!careerId) {
        setCareerPositions([]);
        return;
      }

      try {
        const res = await getCareerPositions(careerId);
        setCareerPositions(res.data || []);
      } catch (err) {
        console.error('Load career positions error:', err);
        setCareerPositions([]);
      }
    };

    fetchCareerPositions();
  }, [careerId]);

  // Lọc job dựa trên giá trị ĐÃ ÁP DỤNG (lưu trên URL), KHÔNG dựa trên state nháp
  // của các ô lọc. Nhờ vậy đổi bộ lọc sẽ không tự fetch — chỉ fetch khi bấm "Áp dụng",
  // "Tìm kiếm", đổi sắp xếp, phân trang hoặc đặt lại bộ lọc (các hành động này cập nhật URL).
  const apiParams = useMemo(
    () => ({
      keyword: getParam(searchParams, 'keyword') || getParam(searchParams, 'q'),
      location: getParam(searchParams, 'location'),
      careerGroupId: getParam(searchParams, 'careerGroupId'),
      careerId: getParam(searchParams, 'careerId'),
      careerPositionId: getParam(searchParams, 'careerPositionId'),
      experience: getParam(searchParams, 'experience'),
      jobLevelId: getParam(searchParams, 'jobLevelId'),
      salaryMin: getParam(searchParams, 'salaryMin'),
      salaryMax: getParam(searchParams, 'salaryMax'),
      saturdayPolicy: getParam(searchParams, 'saturdayPolicy'),
      page,
      limit: 10,
      sortBy: getParam(searchParams, 'sortBy', 'publishedAt'),
      sortOrder: getParam(searchParams, 'sortOrder', 'desc'),
    }),
    [searchParams, page]
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
        setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
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
      careerPositionId,
      experience,
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
    setCareerPositionId('');
    setExperience('');
    setJobLevelId('');
    setSalaryRangeCode('');
    setSalaryMin('');
    setSalaryMax('');
    setSaturdayPolicy('');

    updateQuery({
      careerGroupId: '',
      careerId: '',
      careerPositionId: '',
      experience: '',
      jobLevelId: '',
      salaryRangeCode: '',
      salaryMin: '',
      salaryMax: '',
      saturdayPolicy: '',
      page: 1,
    });
  };

  const handleSort = (field, order = 'desc') => {
    if (field === 'salary.minMillion') {
      updateQuery({ sortBy: 'salary.minMillion', sortOrder: 'desc', page: 1 });
      return;
    }

    updateQuery({ sortBy: 'publishedAt', sortOrder: order, page: 1 });
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
                    placeholder="Chức danh, mô tả, yêu cầu..."
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
                    <option value="">Tất cả địa điểm</option>
                    {provinces.map((p) => {
                      const val = p.name || p.provinceName;
                      return (
                        <option key={p.code || p.provinceCode || val} value={val}>
                          {val}
                        </option>
                      );
                    })}
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
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* AI JOB RECOMMENDATION CARD */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-orange-950">
                  Tìm việc bằng AI
                </h3>
                <p className="text-xs text-orange-800 mt-1">
                  AI quét toàn bộ nội dung CV của bạn để đề xuất các việc làm tương thích nhất.
                </p>
              </div>

              {!isAuthenticated ? (
                <div className="text-center p-3 bg-white/60 rounded-xl border border-orange-100">
                  <p className="text-xs text-orange-900 mb-2 font-medium">Vui lòng đăng nhập để sử dụng tính năng AI gợi ý việc làm.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiError && (
                    <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl">
                      {aiError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-orange-700 mb-1">Chọn CV hiện có</label>
                    <select
                      value={`${selectedCv.type}:${selectedCv.id}`}
                      onChange={(e) => {
                        const [type, id] = e.target.value.split(':');
                        setSelectedCv({ type, id });
                      }}
                      disabled={aiLoading || uploadingCv}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500 cursor-pointer font-medium text-orange-950"
                    >
                      <option value="">-- Chọn CV phù hợp --</option>
                      {onlineCvs.map(cv => (
                        <option key={cv._id || cv.id} value={`ONLINE:${cv._id || cv.id}`}>
                          [Online] {cv.title}
                        </option>
                      ))}
                      {uploadedCvs.map(cv => (
                        <option key={cv._id || cv.id} value={`UPLOADED:${cv._id || cv.id}`}>
                          [Tải lên] {cv.title || cv.fileName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <div className="text-center py-2.5 px-3 border border-dashed border-orange-200 rounded-xl bg-white hover:bg-orange-100/30 transition-all cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleUploadCv}
                        disabled={aiLoading || uploadingCv}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-xs font-bold text-orange-800 flex items-center justify-center">
                        {uploadingCv ? 'Đang tải lên...' : 'Hoặc tải lên CV mới (PDF, DOCX)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAiMatching}
                    disabled={aiLoading || uploadingCv || (!selectedCv.id)}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? 'AI đang phân tích & quét...' : 'Tìm việc bằng AI'}
                  </button>

                  {aiJobs !== null && (
                    <button
                      onClick={handleClearAiJobs}
                      className="w-full py-2 bg-white/80 hover:bg-white text-orange-800 text-xs font-bold rounded-xl border border-orange-200 transition-all"
                    >
                      Quay lại bộ lọc thường
                    </button>
                  )}
                </div>
              )}
            </div>

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
                  setCareerPositionId('');
                  setJobLevelId('');
                }}
                options={careerGroups.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Ngành nghề"
                value={careerId}
                onChange={(value) => {
                  setCareerId(value);
                  setCareerPositionId('');
                }}
                disabled={!careerGroupId}
                options={careers.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Vị trí chuyên môn"
                value={careerPositionId}
                onChange={setCareerPositionId}
                disabled={!careerId}
                options={careerPositions.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Cấp bậc vị trí"
                value={jobLevelId}
                onChange={setJobLevelId}
                options={jobLevels.map((item) => ({ value: item._id, label: item.name }))}
              />

              <SelectFilter
                label="Kinh nghiệm"
                value={experience}
                onChange={setExperience}
                options={EXPERIENCE_LEVELS.map((item) => ({ value: item, label: item }))}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Khoảng lương triệu VND
                </label>
                <select
                  value={salaryRangeCode}
                  onChange={(event) => {
                    const code = event.target.value;
                    setSalaryRangeCode(code);
                    const matched = STATIC_SALARY_RANGES.find((r) => r.value === code);
                    if (matched) {
                      setSalaryMin(matched.min !== '' ? String(matched.min) : '');
                      setSalaryMax(matched.max !== '' ? String(matched.max) : '');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary mb-2"
                >
                  {STATIC_SALARY_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="number"
                    min="0"
                    value={salaryMin}
                    onChange={(event) => {
                      setSalaryMin(event.target.value);
                      setSalaryRangeCode('');
                    }}
                    placeholder="Từ"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    value={salaryMax}
                    onChange={(event) => {
                      setSalaryMax(event.target.value);
                      setSalaryRangeCode('');
                    }}
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
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  {aiJobs !== null ? (
                    <>
                      <span className="material-symbols-outlined text-violet-600 animate-bounce">psychology</span>
                      Gợi ý việc làm bằng AI 🤖
                    </>
                  ) : 'Việc làm đề xuất'}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredAiJobs !== null ? (
                    `Hiển thị ${filteredAiJobs.length} / ${aiJobs.length} việc làm được gợi ý phù hợp`
                  ) : loading ? (
                    'Đang tải danh sách việc làm...'
                  ) : (
                    `Hiển thị ${jobs.length} / ${pagination.total || 0} việc làm phù hợp`
                  )}
                </p>
              </div>

              {aiJobs === null && (
                <div className="flex items-center gap-2 bg-[#f5f3f3] p-1 rounded-lg">
                  <button
                    onClick={() => handleSort('publishedAt', 'desc')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${
                      sortBy === 'publishedAt' && sortOrder === 'desc'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => handleSort('publishedAt', 'asc')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${
                      sortBy === 'publishedAt' && sortOrder === 'asc'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    Cũ nhất
                  </button>
                  <button
                    onClick={() => handleSort('salary.minMillion', 'desc')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md ${
                      sortBy === 'salary.minMillion'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-primary'
                    }`}
                  >
                    Lương cao nhất
                  </button>
                </div>
              )}
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              {aiLoading ? (
                <div className="rounded-2xl bg-white border border-slate-200/60 p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                  <p className="font-bold text-slate-800 text-lg">AI đang đọc hiểu CV và quét toàn bộ công việc...</p>
                  <p className="text-sm text-slate-500 max-w-md">Quá trình phân tích ngữ nghĩa CV & đối khớp có thể mất từ 10 - 20 giây. Vui lòng giữ nguyên màn hình.</p>
                </div>
              ) : filteredAiJobs !== null ? (
                filteredAiJobs.length > 0 ? (
                  filteredAiJobs.map((job) => {
                    const cardJob = mapJobToCard(job);
                    return (
                      <JobCard key={job._id || job.id} {...cardJob} aiMatch={job.aiMatch} />
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="font-semibold text-slate-800">Không tìm thấy việc làm phù hợp với bộ lọc hiện tại</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Hãy thử thay đổi hoặc xóa bớt các tiêu chí lọc để xem thêm kết quả từ AI.
                    </p>
                  </div>
                )
              ) : loading ? (
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

            {aiJobs === null && pagination.pages > 1 ? (
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
