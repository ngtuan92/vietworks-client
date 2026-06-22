import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import jobApi from '../../../services/jobService';
import companyLocationService from '../../../services/companyLocationService';

const STEPS = [
  'Thông tin cơ bản',
  'Mức lương',
  'Mô tả công việc',
  'Yêu cầu ứng viên',
  'Quyền lợi',
  'Địa điểm & hạn nộp',
];

const WORKING_DAYS = [
  { code: 'MON', label: 'Thứ 2' },
  { code: 'TUE', label: 'Thứ 3' },
  { code: 'WED', label: 'Thứ 4' },
  { code: 'THU', label: 'Thứ 5' },
  { code: 'FRI', label: 'Thứ 6' },
  { code: 'SAT', label: 'Thứ 7' },
  { code: 'SUN', label: 'Chủ nhật' },
];

const WORKING_DAY_ORDER = WORKING_DAYS.map((day) => day.code);

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['clean'],
  ],
};

const compressWorkingDays = (days) => {
  if (!days?.length) return '';
  const sorted = [...days].sort((a, b) => WORKING_DAY_ORDER.indexOf(a) - WORKING_DAY_ORDER.indexOf(b));
  const labelOf = (code) => WORKING_DAYS.find((day) => day.code === code)?.label || code;
  const groups = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let index = 1; index <= sorted.length; index += 1) {
    const code = sorted[index];
    const isConsecutive = code && WORKING_DAY_ORDER.indexOf(code) === WORKING_DAY_ORDER.indexOf(prev) + 1;
    if (!isConsecutive) {
      groups.push(start === prev ? labelOf(start) : `${labelOf(start)} - ${labelOf(prev)}`);
      start = code;
    }
    prev = code;
  }

  return groups.join(', ');
};

const formatWorkingSchedule = (workingDays, from, to) => {
  const daysText = compressWorkingDays(workingDays);
  if (!daysText) return '';
  return `${daysText}${from && to ? ` (${from} - ${to})` : ''}`;
};

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const CreateEditJob = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyLocations, setCompanyLocations] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [globalJobLevels, setGlobalJobLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  const [form, setForm] = useState({
    title: '',
    careerGroupId: '',
    careerId: '',
    careerPositionId: '',
    jobLevelId: '',
    experienceLevelId: '',
    skills: [],
    headcount: 1,
    salaryType: 'RANGE',
    salaryFrom: '',
    salaryTo: '',
    workLocations: [],
    saturdayPolicy: 'NOT_SPECIFIED',
    description: '',
    requirements: '',
    benefits: '',
    workingDays: [],
    workingTimeFrom: '08:30',
    workingTimeTo: '17:30',
    applyInstruction: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm trực tiếp vào nút Ứng tuyển.',
    deadline: '',
    isUrgent: false,
  });

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [groupsRes, expRes, levelsRes, locationsRes] = await Promise.all([
          jobApi.getCareerGroups(),
          jobApi.getExperienceLevels(),
          jobApi.getJobLevels(),
          companyLocationService.getMyCompanyLocations(),
        ]);
        if (groupsRes.success) setCareerGroups(groupsRes.data || []);
        if (expRes.success) setExperienceLevels(expRes.data || []);
        if (levelsRes.success) setGlobalJobLevels(levelsRes.data || []);
        setCompanyLocations(locationsRes.data || []);
      } catch (error) {
        showToast('error', error.response?.data?.message || 'Không thể tải dữ liệu tạo tin tuyển dụng.');
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadDependentData = async () => {
      if (!form.careerGroupId) {
        setCareers([]);
        setJobLevels([]);
        setSkills([]);
        return;
      }
      try {
        const [careersRes, skillsRes] = await Promise.all([
          jobApi.getCareersByGroup(form.careerGroupId),
          jobApi.getSkillsByCareerGroup(form.careerGroupId).catch(() => ({ data: [] })),
        ]);
        setCareers(careersRes.data || []);
        setSkills(skillsRes.data || []);
        setJobLevels(globalJobLevels.filter((level) => !level.careerGroupId || String(level.careerGroupId?._id || level.careerGroupId) === String(form.careerGroupId)));
      } catch {
        setCareers([]);
        setSkills([]);
      }
    };
    loadDependentData();
  }, [form.careerGroupId, globalJobLevels]);

  useEffect(() => {
    const loadPositions = async () => {
      if (!form.careerId) {
        setPositions([]);
        return;
      }
      try {
        const res = await jobApi.getCareerPositions(form.careerId);
        setPositions(res.data || []);
      } catch {
        setPositions([]);
      }
    };
    loadPositions();
  }, [form.careerId]);

  const toggleMulti = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => {
      const workingDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter((item) => item !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays, saturdayPolicy: workingDays.includes('SAT') ? 'WORK_SATURDAY' : prev.saturdayPolicy };
    });
  };

  const canNext = useMemo(() => {
    if (step === 1) return Boolean(form.title && form.careerGroupId && form.careerId && form.careerPositionId && form.jobLevelId && form.experienceLevelId && Number(form.headcount) > 0);
    if (step === 2) {
      if (form.salaryType === 'NEGOTIABLE') return true;
      if (form.salaryType === 'RANGE') return Boolean(form.salaryFrom && form.salaryTo && Number(form.salaryFrom) <= Number(form.salaryTo));
      if (form.salaryType === 'FROM') return Boolean(form.salaryFrom);
      if (form.salaryType === 'TO') return Boolean(form.salaryTo);
    }
    if (step === 3) return Boolean(stripHtml(form.description) && form.workingDays.length && form.workingTimeFrom && form.workingTimeTo && form.workingTimeFrom < form.workingTimeTo);
    if (step === 4) return Boolean(stripHtml(form.requirements));
    if (step === 5) return Boolean(stripHtml(form.benefits));
    if (step === 6) {
      if (!form.deadline || !form.workLocations.length || !stripHtml(form.applyInstruction)) return false;
      return new Date(form.deadline).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
    }
    return true;
  }, [form, step]);

  const preparePayload = () => {
    const payload = { ...form };
    payload.salary = form.salaryType === 'NEGOTIABLE'
      ? { type: 'NEGOTIABLE', minMillion: null, maxMillion: null, currency: 'VND' }
      : {
          type: form.salaryType,
          minMillion: form.salaryFrom ? Number(form.salaryFrom) : null,
          maxMillion: form.salaryTo ? Number(form.salaryTo) : null,
          currency: 'VND',
        };
    payload.workingTime = formatWorkingSchedule(form.workingDays, form.workingTimeFrom, form.workingTimeTo);
    payload.applicationCount = Number(form.headcount || 1);
    delete payload.salaryType;
    delete payload.salaryFrom;
    delete payload.salaryTo;
    delete payload.workingDays;
    delete payload.workingTimeFrom;
    delete payload.workingTimeTo;
    delete payload.headcount;
    return payload;
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const res = await jobApi.createJob(preparePayload());
      showToast(res.success ? 'success' : 'error', res.success ? 'Tin tuyển dụng đã được lưu nháp.' : (res.message || 'Lỗi lưu bản nháp.'));
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Có lỗi hệ thống xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishJob = async () => {
    setIsLoading(true);
    try {
      const createRes = await jobApi.createJob(preparePayload());
      if (!createRes.success || !createRes.data?._id) {
        showToast('error', createRes.message || 'Không thể tạo tin tuyển dụng.');
        return;
      }
      const submitRes = await jobApi.submitJobForReview(createRes.data._id);
      showToast(submitRes.success ? 'success' : 'error', submitRes.success ? 'Nộp tin tuyển dụng thành công. Vui lòng chờ quản trị viên phê duyệt.' : (submitRes.message || 'Lỗi gửi duyệt tin.'));
      if (submitRes.success) setStep(1);
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Quá trình gửi duyệt thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tạo tin tuyển dụng</h1>
          <p className="text-slate-600 mt-1">Hoàn thành thông tin bên dưới để gửi tin tuyển dụng cho Admin duyệt.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveDraft} disabled={isLoading} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50">{isLoading ? 'Đang xử lý...' : 'Lưu nháp'}</button>
          <button onClick={handlePublishJob} disabled={isLoading || !canNext || step < 6} className="px-5 py-2.5 rounded-xl bg-primary font-bold text-white hover:bg-primary/95 shadow-sm disabled:opacity-50">{isLoading ? 'Đang gửi...' : 'Hoàn tất & Gửi duyệt'}</button>
        </div>
      </div>

      {message.text ? <div className={`rounded-xl px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>{message.text}</div> : null}

      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {STEPS.map((label, index) => {
            const current = index + 1;
            return <button key={label} type="button" onClick={() => setStep(current)} className={`rounded-xl px-3 py-2.5 text-xs font-bold text-center border transition-all ${current === step ? 'bg-primary text-white border-primary shadow-sm' : current < step ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>B{current}. {label}</button>;
          })}
        </div>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl p-6 shadow-sm min-h-[420px]">
        {step === 1 && <StepBasicInfo form={form} setField={setField} careerGroups={careerGroups} careers={careers} positions={positions} jobLevels={jobLevels} experienceLevels={experienceLevels} />}
        {step === 2 && <StepSalary form={form} setField={setField} />}
        {step === 3 && <StepDescription form={form} setField={setField} toggleWorkingDay={toggleWorkingDay} />}
        {step === 4 && <StepRequirements form={form} setField={setField} skills={skills} toggleMulti={toggleMulti} />}
        {step === 5 && <StepBenefits form={form} setField={setField} />}
        {step === 6 && <StepLocationDeadline form={form} setField={setField} companyLocations={companyLocations} />}

        <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between">
          <button onClick={() => setStep((prev) => Math.max(1, prev - 1))} className={`px-5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 ${step === 1 ? 'invisible' : ''}`}>Quay lại</button>
          {step < 6 ? (
            <button onClick={() => canNext && setStep((prev) => Math.min(6, prev + 1))} disabled={!canNext} className={`px-6 py-2 rounded-xl font-semibold transition-all ${canNext ? 'bg-primary text-white hover:bg-primary/95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Tiếp tục</button>
          ) : (
            <button onClick={handlePublishJob} disabled={isLoading || !canNext} className={`px-6 py-2 rounded-xl font-bold transition-all ${canNext ? 'bg-primary text-white hover:bg-primary/95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Gửi duyệt</button>
          )}
        </div>
      </section>
    </div>
  );
};

const StepBasicInfo = ({ form, setField, careerGroups, careers, positions, jobLevels, experienceLevels }) => (
  <div className="space-y-5">
    <h2 className="text-lg font-bold text-slate-900">Bước 1: Thông tin cơ bản</h2>
    <Field label="Tiêu đề tin tuyển dụng" required value={form.title} onChange={(value) => setField('title', value)} placeholder="Ví dụ: Backend Developer" />
    <Field label="Số lượng cần tuyển" required type="number" value={form.headcount} onChange={(value) => setField('headcount', Number(value))} placeholder="1" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select label="Nhóm nghề" required value={form.careerGroupId} onChange={(value) => { setField('careerGroupId', value); setField('careerId', ''); setField('careerPositionId', ''); }} options={careerGroups.map((item) => ({ value: item._id, label: item.name }))} />
      <Select label="Ngành nghề" required value={form.careerId} onChange={(value) => { setField('careerId', value); setField('careerPositionId', ''); }} options={careers.map((item) => ({ value: item._id, label: item.name }))} disabled={!form.careerGroupId} />
      <Select label="Vị trí chuyên môn" required value={form.careerPositionId} onChange={(value) => setField('careerPositionId', value)} options={positions.map((item) => ({ value: item._id, label: item.name }))} disabled={!form.careerId} />
      <Select label="Cấp bậc" required value={form.jobLevelId} onChange={(value) => setField('jobLevelId', value)} options={jobLevels.map((item) => ({ value: item._id, label: item.name }))} />
      <Select label="Kinh nghiệm" required value={form.experienceLevelId} onChange={(value) => setField('experienceLevelId', value)} options={experienceLevels.map((item) => ({ value: item._id, label: item.name }))} />
    </div>
  </div>
);

const StepSalary = ({ form, setField }) => (
  <div className="space-y-5">
    <h2 className="text-lg font-bold text-slate-900">Bước 2: Mức lương</h2>
    <Select label="Cấu trúc lương" required value={form.salaryType} onChange={(value) => setField('salaryType', value)} options={[{ value: 'NEGOTIABLE', label: 'Thỏa thuận' }, { value: 'RANGE', label: 'Trong khoảng' }, { value: 'FROM', label: 'Từ mức' }, { value: 'TO', label: 'Đến mức' }]} />
    {form.salaryType !== 'NEGOTIABLE' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['RANGE', 'FROM'].includes(form.salaryType) ? <Field label="Lương tối thiểu (triệu VNĐ)" type="number" value={form.salaryFrom} onChange={(value) => setField('salaryFrom', value)} /> : null}
        {['RANGE', 'TO'].includes(form.salaryType) ? <Field label="Lương tối đa (triệu VNĐ)" type="number" value={form.salaryTo} onChange={(value) => setField('salaryTo', value)} /> : null}
      </div>
    ) : null}
  </div>
);

const RichTextField = ({ label, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label} {required ? <span className="text-red-500">*</span> : null}</label>
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={quillModules} className="min-h-[180px] [&_.ql-editor]:min-h-[140px]" />
    </div>
  </div>
);

const StepDescription = ({ form, setField, toggleWorkingDay }) => (
  <div className="space-y-5">
    <h2 className="text-lg font-bold text-slate-900">Bước 3: Mô tả công việc</h2>
    <RichTextField label="Chi tiết công việc" required value={form.description} onChange={(value) => setField('description', value)} />
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày làm việc trong tuần <span className="text-red-500">*</span></label>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {WORKING_DAYS.map((day) => <button key={day.code} type="button" onClick={() => toggleWorkingDay(day.code)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.workingDays.includes(day.code) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{day.label}</button>)}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
      <Field label="Giờ bắt đầu" required type="time" value={form.workingTimeFrom} onChange={(value) => setField('workingTimeFrom', value)} />
      <Field label="Giờ kết thúc" required type="time" value={form.workingTimeTo} onChange={(value) => setField('workingTimeTo', value)} />
    </div>
  </div>
);

const StepRequirements = ({ form, setField, skills, toggleMulti }) => (
  <div className="space-y-5">
    <h2 className="text-lg font-bold text-slate-900">Bước 4: Yêu cầu ứng viên</h2>
    <RichTextField label="Yêu cầu năng lực chuyên môn" required value={form.requirements} onChange={(value) => setField('requirements', value)} />
    {skills.length ? <div className="flex flex-wrap gap-2">{skills.map((skill) => <button key={skill._id} type="button" onClick={() => toggleMulti('skills', skill._id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${form.skills.includes(skill._id) ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}>{skill.name}</button>)}</div> : null}
  </div>
);

const StepBenefits = ({ form, setField }) => (
  <div className="space-y-5">
    <h2 className="text-lg font-bold text-slate-900">Bước 5: Quyền lợi</h2>
    <RichTextField label="Quyền lợi ứng viên được hưởng" required value={form.benefits} onChange={(value) => setField('benefits', value)} />
  </div>
);

const StepLocationDeadline = ({ form, setField, companyLocations }) => {
  const saturdayPolicyOptions = [
    { value: 'NOT_SPECIFIED', label: 'Không yêu cầu' },
    { value: 'WORK_SATURDAY', label: 'Có làm Thứ 7' },
    { value: 'OFF_SATURDAY', label: 'Nghỉ Thứ 7' },
  ];

  const toggleLocation = (location) => {
    const id = String(location._id);
    const exists = form.workLocations.some((item) => String(item.locationId || item._id) === id);
    const snapshot = {
      locationId: location._id,
      name: location.name,
      address: location.addressLine,
      detailAddress: location.addressLine,
      provinceName: location.province,
      districtName: location.district,
      wardName: location.ward,
    };
    setField('workLocations', exists ? form.workLocations.filter((item) => String(item.locationId || item._id) !== id) : [...form.workLocations, snapshot]);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Bước 6: Địa điểm & hạn nộp</h2>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Địa điểm làm việc <span className="text-red-500">*</span></label>
        {companyLocations.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyLocations.map((location) => {
              const checked = form.workLocations.some((item) => String(item.locationId || item._id) === String(location._id));
              return <button key={location._id} type="button" onClick={() => toggleLocation(location)} className={`text-left rounded-xl border p-4 transition-all ${checked ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}><div className="font-bold">{location.name || 'Địa điểm làm việc'}</div><div className="text-sm mt-1">{[location.addressLine, location.ward, location.district, location.province].filter(Boolean).join(', ')}</div></button>;
            })}
          </div>
        ) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Công ty chưa có địa điểm làm việc.</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Chính sách làm việc Thứ 7" value={form.saturdayPolicy} onChange={(value) => setField('saturdayPolicy', value)} options={saturdayPolicyOptions} />
        <Field label="Hạn cuối nộp hồ sơ nhận CV" required type="date" value={form.deadline} onChange={(value) => setField('deadline', value)} />
      </div>
      <RichTextField label="Hướng dẫn nộp hồ sơ chi tiết cho ứng viên" required value={form.applyInstruction} onChange={(value) => setField('applyInstruction', value)} />
      <label className="flex items-center gap-2 font-semibold text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 max-w-max cursor-pointer">
        <input type="checkbox" checked={form.isUrgent} onChange={(event) => setField('isUrgent', event.target.checked)} className="rounded" />
        Đánh dấu đây là tin tuyển dụng GẤP
      </label>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder = '', required = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label} {required ? <span className="text-red-500">*</span> : null}</label>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none font-medium text-slate-800 transition-all text-sm focus:border-primary focus:ring-1 focus:ring-[#003f87]" />
  </div>
);

const Select = ({ label, value, onChange, options, required = false, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label} {required ? <span className="text-red-500">*</span> : null}</label>
    <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-primary bg-white disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer">
      <option value="">-- Vui lòng chọn --</option>
      {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
  </div>
);

export default CreateEditJob;

