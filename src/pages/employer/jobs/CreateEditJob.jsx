import { useMemo, useState, useEffect, useRef } from 'react';
// Import các hàm API từ file quản lý API của bạn
import jobApi from '../../../services/jobService'; 
import companyLocationService from '../../../services/companyLocationService';
console.log('companyLocationService:', companyLocationService);
const STEPS = [
  'Thông tin cơ bản',
  'Mức lương',
  'Mô tả công việc',
  'Yêu cầu ứng viên',
  'Quyền lợi',
  'Địa điểm & hạn nộp',
];

// --- Danh mục ngày trong tuần dùng cho bộ chọn lịch làm việc ---
const WORKING_DAYS = [
  { code: 'MON', label: 'Thứ 2' },
  { code: 'TUE', label: 'Thứ 3' },
  { code: 'WED', label: 'Thứ 4' },
  { code: 'THU', label: 'Thứ 5' },
  { code: 'FRI', label: 'Thứ 6' },
  { code: 'SAT', label: 'Thứ 7' },
  { code: 'SUN', label: 'Chủ nhật' },
];
const WORKING_DAY_ORDER = WORKING_DAYS.map((d) => d.code);



// Gộp các ngày liên tiếp thành dạng "Thứ 2 - Thứ 6" cho gọn, thay vì liệt kê từng ngày
const compressWorkingDays = (days) => {
  if (!days || days.length === 0) return '';
  const sorted = [...days].sort(
    (a, b) => WORKING_DAY_ORDER.indexOf(a) - WORKING_DAY_ORDER.indexOf(b)
  );
  const labelOf = (code) => WORKING_DAYS.find((d) => d.code === code)?.label || code;

  const groups = [];
  let groupStart = sorted[0];
  let groupPrev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const code = sorted[i];
    const prevIdx = WORKING_DAY_ORDER.indexOf(groupPrev);
    const isConsecutive = code && WORKING_DAY_ORDER.indexOf(code) === prevIdx + 1;

    if (!isConsecutive) {
      groups.push(
        groupStart === groupPrev ? labelOf(groupStart) : `${labelOf(groupStart)} - ${labelOf(groupPrev)}`
      );
      groupStart = code;
    }
    groupPrev = code;
  }

  return groups.join(', ');
};

// Tạo chuỗi hiển thị/lưu trữ "Quy chuẩn thời gian làm việc" từ dữ liệu có cấu trúc
const formatWorkingSchedule = (workingDays, from, to) => {
  const daysText = compressWorkingDays(workingDays);
  if (!daysText) return '';
  const timeText = from && to ? ` (Từ ${from} đến ${to})` : '';
  return `${daysText}${timeText}`;
};

const INITIAL_FORM = {
  title: '',
  careerGroupId: '',
  careerId: '',
  careerPositionId: '',
  jobLevelId: '',
  experienceLevelId: '',
  skills: [],
  salaryType: 'RANGE', // 'NEGOTIABLE', 'RANGE', 'FROM', 'TO'
  salaryFrom: '',
  salaryTo: '',
  workLocations: [], // Lưu danh sách các object địa điểm snapshot chi tiết
  saturdayPolicy: 'NOT_SPECIFIED', // 'WORKING_SATURDAY', 'OFF_SATURDAY', 'NOT_SPECIFIED'
  description: '',
  requirements: '',
  benefits: '',
  workingDays: [], // ['MON', 'TUE', ...] - các ngày làm việc cố định trong tuần
  workingTimeFrom: '08:30',
  workingTimeTo: '17:30',
  applyInstruction: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm trực tiếp vào nút Ứng tuyển.',
  deadline: '',
  isUrgent: false,
  headcount: 1,
};

const CreateEditJob = () => {
  const [step, setStep] = useState(1);
  const [isCompanyVerified] = useState(true); // Giả định đã xác thực để test tính năng
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
const [companyLocations, setCompanyLocations] = useState([]);
  // --- States lưu trữ Danh mục Động từ Backend ---
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [globalJobLevels, setGlobalJobLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  // --- State Form chuẩn hóa theo DB Schema ---
  const [form, setForm] = useState(INITIAL_FORM);
  useEffect(() => {
  const fetchCompanyLocations = async () => {
    try {
      const res = await companyLocationService.getMyCompanyLocations();
      console.log('Company locations response:', res);
      setCompanyLocations(res.data || []);
    } catch (err) {
      console.error('Load company locations error:', {
        status: err.response?.status,
        data: err.response?.data,
        fullUrl: `${err.config?.baseURL || ''}${err.config?.url || ''}`,
        headers: err.config?.headers,
      });

      showToast(
        'error',
        err.response?.data?.message || 'Không thể tải danh sách địa điểm công ty.'
      );
    }
  };

  fetchCompanyLocations();
}, []);

  // --- Lấy dữ liệu danh mục ban đầu (Global Master Data) ---
  useEffect(() => {
    const fetchInitialMasterData = async () => {
      try {
        const [resGroups, resExp, resLevels] = await Promise.all([
          jobApi.getCareerGroups(),
          jobApi.getExperienceLevels(),
          jobApi.getJobLevels()
        ]);
        if (resGroups.success) setCareerGroups(resGroups.data);
        if (resExp.success) setExperienceLevels(resExp.data);
        if (resLevels.success) setGlobalJobLevels(resLevels.data);
      } catch {
        showToast('error', 'Không thể tải dữ liệu danh mục hệ thống.');
      }
    };
    fetchInitialMasterData();
  }, []);

  // --- Xử lý Load danh mục phụ thuộc (Dependent Dropdowns) ---
  useEffect(() => {
    if (!form.careerGroupId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setCareers([]);
      setJobLevels([]);
      setSkills([]);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    
    const fetchDependentByGroup = async () => {
      try {
        const [resCareers, resSkills] = await Promise.all([
          jobApi.getCareersByGroup(form.careerGroupId),
          jobApi.getSkillsByCareerGroup(form.careerGroupId)
        ]);
        if (resCareers.success) setCareers(resCareers.data);
        if (resSkills.success) setSkills(resSkills.data);
        
        // --- Logic Lọc JobLevels (Loại bỏ các Level IT nếu không phải ngành IT) ---
        const selectedGroup = careerGroups.find(g => g._id === form.careerGroupId);
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchDependentByGroup();
  }, [form.careerGroupId, careerGroups, globalJobLevels]);

  useEffect(() => {
    if (!form.careerId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setPositions([]);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    const fetchPositions = async () => {
      try {
        const resPositions = await jobApi.getCareerPositions(form.careerId);
        if (resPositions.success) setPositions(resPositions.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPositions();
  }, [form.careerId]);

  // --- Hàm tiện ích cập nhật field ---
  const setField = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Reset cấp con nếu cấp cha thay đổi
      if (key === 'careerGroupId') {
        updated.careerId = '';
        updated.careerPositionId = '';
        updated.jobLevelId = '';
        updated.skills = [];
      }
      if (key === 'careerId') {
        updated.careerPositionId = '';
      }
      return updated;
    });
  };

  // --- Nhận dữ liệu snapshot từ HierarchicalLocationPicker ---
 
  const toggleMulti = (key, value) => {
    setForm((prev) => {
      const current = new Set(prev[key]);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  };

  // --- Bật/tắt một ngày làm việc, đồng thời tự đồng bộ Chính sách Thứ 7 cho hợp lý ---
  const toggleWorkingDay = (day) => {
    setForm((prev) => {
      const current = new Set(prev.workingDays);
      if (current.has(day)) current.delete(day);
      else current.add(day);
      const workingDays = Array.from(current);

      const hasSaturday = workingDays.includes('SAT');
      const hasSunday = workingDays.includes('SUN');

      let saturdayPolicy = prev.saturdayPolicy;
      if (hasSaturday) {
        // Đã chọn làm Thứ 7 trong lịch tuần -> chính sách phải phản ánh đúng là CÓ làm Thứ 7
        saturdayPolicy = 'WORKING_SATURDAY';
      } else if (!hasSunday && saturdayPolicy === 'WORKING_SATURDAY') {
        // Lịch tuần chỉ chọn Thứ 2 - Thứ 6 (không có Thứ 7/CN) -> không thể giữ chính sách "có làm Thứ 7"
        saturdayPolicy = 'OFF_SATURDAY';
      }

      return { ...prev, workingDays, saturdayPolicy };
    });
  };

  function showToast(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }

  // --- Điều kiện validate qua từng bước (Frontend Guard) ---
  const canNext = useMemo(() => {
    if (step === 1) {
      return Boolean(form.title && form.careerGroupId && form.careerId && form.careerPositionId && form.jobLevelId && form.experienceLevelId);
    }
    if (step === 2) {
      if (form.salaryType === 'NEGOTIABLE') return true;
      if (form.salaryType === 'RANGE') {
        return Boolean(form.salaryFrom && form.salaryTo && Number(form.salaryFrom) <= Number(form.salaryTo));
      }
      if (form.salaryType === 'FROM') return Boolean(form.salaryFrom);
      if (form.salaryType === 'TO') return Boolean(form.salaryTo);
    }
    if (step === 3) {
      return Boolean(
        form.description &&
        form.workingDays.length > 0 &&
        form.workingTimeFrom &&
        form.workingTimeTo &&
        form.workingTimeFrom < form.workingTimeTo
      );
    }
    if (step === 4) {
      return Boolean(form.requirements);
    }
    if (step === 5) {
      return Boolean(form.benefits);
    }
    if (step === 6) {
      if (!form.deadline || form.workLocations.length === 0 || !form.applyInstruction) return false;
      const today = new Date().setHours(0, 0, 0, 0);
      return new Date(form.deadline) >= today;
    }
    return true;
  }, [form, step]);

  const next = () => canNext && setStep((p) => Math.min(6, p + 1));
  const prev = () => setStep((p) => Math.max(1, p - 1));

  // --- Chuẩn hóa Payload chuẩn cấu trúc Model trước khi API Call ---
  const preparePayload = () => {
  const payload = { ...form };
  if (form.salaryType === 'NEGOTIABLE') {
    payload.salary = {
      type: 'NEGOTIABLE',
      minMillion: null,
      maxMillion: null,
      currency: 'VND',
    };
  } else {
    payload.salary = {
      type: form.salaryType,
      minMillion: form.salaryFrom ? Number(form.salaryFrom) : null,
      maxMillion: form.salaryTo ? Number(form.salaryTo) : null,
      currency: 'VND',
    };
  }

  delete payload.salaryType;
  delete payload.salaryFrom;
  delete payload.salaryTo;

  // Backend hiện chỉ lưu "workingTime" dưới dạng chuỗi text, nên ta build chuỗi đó
  // từ dữ liệu có cấu trúc (ngày + giờ) ngay tại frontend -> không cần sửa backend.
  payload.workingTime = formatWorkingSchedule(
    form.workingDays,
    form.workingTimeFrom,
    form.workingTimeTo
  );
  delete payload.workingDays;
  delete payload.workingTimeFrom;
  delete payload.workingTimeTo;

  return payload;
};

  // --- Chức năng 1: Lưu Nháp (DRAFT) ---
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const payload = preparePayload();
      console.log("Dữ liệu thực tế gửi đi:", payload);
      const res = await jobApi.createJob(payload);
      if (res.success) {
        showToast('success', 'Tin tuyển dụng đã được lưu tạm vào danh sách nháp!');
      } else {
        showToast('error', res.message || 'Lỗi lưu bản nháp.');
      }
    } catch (err) {
      console.error("❌ Lỗi API Lưu nháp:", err.response?.data || err.message);
      showToast('error', err.response?.data?.message || 'Có lỗi hệ thống xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Chức năng 2: Gửi Duyệt thẳng (DRAFT -> PENDING_APPROVAL) ---
  const handlePublishJob = async () => {
    if (!isCompanyVerified) return;
    setIsLoading(true);
    try {
      const payload = preparePayload();
      const resCreate = await jobApi.createJob(payload);
      
      if (resCreate.success && resCreate.data?._id) {
        const resSubmit = await jobApi.submitJobForReview(resCreate.data._id);
        if (resSubmit.success) {
          showToast('success', 'Nộp tin tuyển dụng thành công! Vui lòng chờ quản trị viên phê duyệt.');
          setForm(INITIAL_FORM);
          setStep(1); 
        } else {
          showToast('error', resSubmit.message || 'Lỗi gửi yêu cầu duyệt tin.');
        }
      } else {
        showToast('error', resCreate.message || 'Không thể khởi tạo tin để gửi duyệt.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Quá trình gửi duyệt thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 opacity-100 transition-opacity">
      {/* Toast Message Báo lỗi / Thành công */}
      {message.text && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-white font-medium ${
          message.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header điều hướng chính */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo tin tuyển dụng mới</h1>
          <p className="text-slate-600 mt-1">Hoàn thành bảng thông tin động bên dưới để tiếp cận các ứng viên tiềm năng.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Lưu nháp hệ thống'}
          </button>
          <button 
            onClick={handlePublishJob}
            disabled={isLoading || !canNext || step < 6}
            className="px-5 py-2.5 rounded-xl border border-transparent bg-primary font-bold text-white hover:bg-primary/95 shadow-sm disabled:opacity-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {isLoading ? 'Đang gửi...' : 'Hoàn tất & Gửi duyệt'}
          </button>
        </div>
      </div>

      {/* SINGLE COLUMN LAYOUT */}
      <div className="max-w-5xl mx-auto w-full gap-8 items-start mt-6">
        {/* Form Container */}
        <div className="space-y-6">

      {/* Khối hiển thị các bước dạng Tab trực quan trên cùng */}
      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {STEPS.map((label, idx) => {
            const current = idx + 1;
            const active = current === step;
            const done = current < step;
            return (
              <div 
                key={label} 
                className={`rounded-xl px-3 py-2.5 text-xs font-bold text-center border transition-all ${
                  active ? 'bg-primary text-white border-primary shadow-sm' : 
                  done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  'bg-slate-50 text-slate-500 border-slate-100'
                }`}
              >
                B{current}. {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Render các Form phân mảnh theo từng Step */}
      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 shadow-sm min-h-[400px]">
        {step === 1 && (
          <StepBasicInfo 
            form={form} 
            setField={setField} 
            careerGroups={careerGroups}
            careers={careers}
            positions={positions}
            jobLevels={jobLevels}
            experienceLevels={experienceLevels}
          />
        )}
        {step === 2 && <StepSalary form={form} setField={setField} />}
        {step === 3 && <StepDescription form={form} setField={setField} toggleWorkingDay={toggleWorkingDay} />}
        {step === 4 && <StepRequirements form={form} setField={setField} skills={skills} toggleMulti={toggleMulti}  />}
        {step === 5 && <StepBenefits form={form} setField={setField} />}
        {step === 6 && (
          <StepLocationDeadline 
            form={form} 
            setField={setField} 
  companyLocations={companyLocations}
          />
        )}        
        {/* Footer Buttons xử lý chuyển bước nội bộ */}
        <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between">
          <button 
            onClick={prev} 
            className={`px-5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 ${step === 1 ? 'invisible' : ''}`}
          >
            Quay lại
          </button>
          
          <div className="flex items-center gap-2">
            {step < 6 ? (
              <button
                onClick={next}
                disabled={!canNext}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  canNext ? 'bg-primary text-white hover:bg-primary/95 hover:shadow-lg hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                onClick={handlePublishJob}
                disabled={isLoading || !canNext}
                className={`px-6 py-2 rounded-xl font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                  canNext ? 'bg-primary text-white hover:bg-primary/95 hover:shadow-primary/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Gửi duyệt
              </button>
            )}
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

// ==================== SUB-COMPONENTS CHO TỪNG BƯỚC FORM ====================

const StepBasicInfo = ({ form, setField, careerGroups, careers, positions, jobLevels, experienceLevels }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 1: Thông tin cơ bản</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Field label="Tiêu đề công việc" required value={form.title} onChange={(v) => setField('title', v)} placeholder="VD: Senior Backend Developer (NodeJS)" />
      
      <Field label="Số lượng cần tuyển" type="number" required value={form.headcount} onChange={(v) => setField('headcount', Number(v))} placeholder="1" />
      
      <Select 
        label="Nhóm ngành nghề" 
        required 
        value={form.careerGroupId} 
        onChange={(v) => setField('careerGroupId', v)} 
        options={careerGroups.map(g => ({ value: g._id, label: g.name }))} 
      />
      
      <Select 
        label="Ngành nghề chi tiết" 
        required 
        value={form.careerId} 
        disabled={!form.careerGroupId}
        onChange={(v) => setField('careerId', v)} 
        options={careers.map(c => ({ value: c._id, label: c.name }))} 
      />
      
      <Select 
        label="Vị trí chuyên môn" 
        required 
        value={form.careerPositionId} 
        disabled={!form.careerId}
        onChange={(v) => setField('careerPositionId', v)} 
        options={positions.map(p => ({ value: p._id, label: p.name }))} 
      />
      
      <Select 
        label="Cấp bậc vị trí" 
        required 
        value={form.jobLevelId} 
        disabled={!form.careerGroupId}
        onChange={(v) => setField('jobLevelId', v)} 
        options={jobLevels.map(l => ({ value: l._id, label: l.name }))} 
      />
      
      <Select 
        label="Yêu cầu kinh nghiệm" 
        required 
        value={form.experienceLevelId} 
        onChange={(v) => setField('experienceLevelId', v)} 
        options={experienceLevels.map(e => ({ value: e._id, label: e.name }))} 
      />
    </div>
  </div>
);

const StepSalary = ({ form, setField }) => {
  const isInvalidRange = form.salaryType === 'RANGE' && form.salaryFrom && form.salaryTo && Number(form.salaryFrom) > Number(form.salaryTo);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 2: Chế độ đãi ngộ & Mức lương</h2>
      <div className="max-w-md">
        <Select 
          label="Cấu trúc tính lương" 
          required 
          value={form.salaryType} 
          onChange={(v) => setField('salaryType', v)} 
          options={[
            { value: 'NEGOTIABLE', label: 'Thỏa thuận trực tiếp' },
            { value: 'RANGE', label: 'Cố định trong khoảng (Từ - Đến)' },
            { value: 'FROM', label: 'Chỉ định mức tối thiểu (Từ...' },
            { value: 'TO', label: 'Chỉ định mức tối đa (...Đến)' }
          ]} 
        />
      </div>
      
      {form.salaryType !== 'NEGOTIABLE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-2xl">
          {['RANGE', 'FROM'].includes(form.salaryType) && (
            <Field label="Mức lương tối thiểu (Triệu VNĐ)" required type="number" value={form.salaryFrom} onChange={(v) => setField('salaryFrom', v)} placeholder="15" />
          )}
          {['RANGE', 'TO'].includes(form.salaryType) && (
            <Field label="Mức lương tối đa (Triệu VNĐ)" required type="number" value={form.salaryTo} onChange={(v) => setField('salaryTo', v)} placeholder="25" />
          )}
        </div>
      )}
      {isInvalidRange && <p className="text-sm text-red-600 font-medium">⚠️ Lỗi: Giá trị khởi điểm (Từ) không thể cao hơn hạn mức trần (Đến).</p>}
    </div>
  );
};

const StepDescription = ({ form, setField, toggleWorkingDay }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 3: Bản mô tả công việc</h2>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Chi tiết mô tả công việc <span className="text-red-500">*</span></label>
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <RichTextEditor value={form.description} onChange={(v) => setField('description', v)} placeholder="Nhập chi tiết mô tả công việc..." />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Ngày làm việc trong tuần <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        {WORKING_DAYS.map((day) => {
          const isSelected = form.workingDays.includes(day.code);
          return (
            <button
              key={day.code}
              type="button"
              onClick={() => toggleWorkingDay(day.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-1.5">
        Chọn/bỏ chọn <span className="font-semibold">Thứ 7</span> ở đây sẽ tự động cập nhật "Chính sách làm việc Thứ 7" ở Bước 6.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4 max-w-sm">
      <Field
        label="Giờ bắt đầu"
        required
        type="time"
        value={form.workingTimeFrom}
        onChange={(v) => setField('workingTimeFrom', v)}
      />
      <Field
        label="Giờ kết thúc"
        required
        type="time"
        value={form.workingTimeTo}
        onChange={(v) => setField('workingTimeTo', v)}
      />
    </div>
    {form.workingTimeFrom && form.workingTimeTo && form.workingTimeFrom >= form.workingTimeTo ? (
      <p className="text-sm text-red-600 font-medium">⚠️ Giờ kết thúc phải sau giờ bắt đầu.</p>
    ) : null}
  </div>
);

const StepRequirements = ({ form, setField, skills, toggleMulti }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 4: Tiêu chí và Yêu cầu ứng viên</h2>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Yêu cầu năng lực chuyên môn <span className="text-red-500">*</span></label>
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <RichTextEditor value={form.requirements} onChange={(v) => setField('requirements', v)} placeholder="Nhập yêu cầu chi tiết đối với ứng viên..." />
      </div>
    </div>
    
    <div className="mt-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Bộ kỹ năng bổ trợ đính kèm (Lọc động theo nhóm nghề)</label>
      {skills.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Vui lòng chọn đúng Nhóm ngành tại bước 1 để hiển thị danh sách kỹ năng gợi ý tương ứng.</p>
      ) : (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          {skills.map((s) => {
            const isSelected = form.skills.includes(s._id);
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => toggleMulti('skills', s._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const StepBenefits = ({ form, setField }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 5: Chế độ đãi ngộ & Quyền lợi</h2>
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền lợi và Đãi ngộ dành cho ứng viên <span className="text-red-500">*</span></label>
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <RichTextEditor value={form.benefits} onChange={(v) => setField('benefits', v)} placeholder="Nhập các quyền lợi & gói chế độ phúc lợi..." />
      </div>
    </div>
  </div>
);

const StepLocationDeadline = ({ form, setField, companyLocations }) => {
  const isPastDeadline = form.deadline
    ? new Date(form.deadline) < new Date().setHours(0, 0, 0, 0)
    : false;

  const selectedLocationIds = form.workLocations.map((location) => location.locationId);

  const toggleLocation = (location) => {
    const exists = selectedLocationIds.includes(location._id);

    if (exists) {
      setField(
        'workLocations',
        form.workLocations.filter((item) => item.locationId !== location._id)
      );
      return;
    }

    setField('workLocations', [
      ...form.workLocations,
      {
        locationId: location._id,
        provinceName: location.province,
        districtName: location.district || '',
        wardName: location.ward || '',
        address: [
          location.addressLine,
          location.ward,
          location.district,
          location.province
        ]
          .filter(Boolean)
          .join(', '),
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
      },
    ]);
  };

  // Khoá các lựa chọn Chính sách Thứ 7 mâu thuẫn với lịch làm việc đã chọn ở Bước 3
  const scheduleSelected = form.workingDays && form.workingDays.length > 0;
  const includesSaturday = form.workingDays?.includes('SAT');

  const saturdayPolicyOptions = [
    { value: 'NOT_SPECIFIED', label: 'Không đề cập chi tiết' },
    {
      value: 'WORKING_SATURDAY',
      label: 'Có làm việc ngày Thứ 7',
      disabled: scheduleSelected && !includesSaturday,
    },
    {
      value: 'OFF_SATURDAY',
      label: 'Nghỉ hoàn toàn Thứ 7 & CN',
      disabled: scheduleSelected && includesSaturday,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 6: Khối địa điểm & Thời hạn ứng tuyển</h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Địa điểm đặt văn phòng làm việc <span className="text-red-600">*</span>
        </label>

        {companyLocations.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-medium">
            Công ty chưa có địa điểm làm việc. Vui lòng thêm địa điểm trong hồ sơ công ty trước khi tạo tin.
          </div>
        ) : (
          <div className="space-y-2">
            {companyLocations.map((location) => {
              const checked = selectedLocationIds.includes(location._id);
              const fullAddress = [
                location.addressLine,
                location.ward,
                location.district,
                location.province
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <label
                  key={location._id}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    checked
                      ? 'border-primary bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLocation(location)}
                    className="mt-1"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{location.name}</p>
                      {location.isPrimary ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          Trụ sở chính
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{fullAddress}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Select
          label="Chính sách làm việc Thứ 7"
          value={form.saturdayPolicy}
          onChange={(v) => setField('saturdayPolicy', v)}
          options={saturdayPolicyOptions}
        />
        <Field
          label="Hạn cuối nộp hồ sơ nhận CV"
          required
          type="date"
          value={form.deadline}
          onChange={(v) => setField('deadline', v)}
        />
      </div>
      {scheduleSelected && (
        <p className="text-xs text-slate-400 -mt-2">
          {includesSaturday
            ? 'Lịch làm việc ở Bước 3 có Thứ 7 nên chính sách được khoá ở "Có làm việc ngày Thứ 7".'
            : 'Lịch làm việc ở Bước 3 chỉ từ Thứ 2 - Thứ 6 nên không thể chọn "Có làm việc ngày Thứ 7".'}
        </p>
      )}

      {isPastDeadline ? (
        <p className="text-sm text-red-600 font-medium">
          ⚠️ Lỗi: Ngày hết hạn không hợp lệ (không thể chọn ngày trong quá khứ).
        </p>
      ) : null}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Hướng dẫn nộp hồ sơ chi tiết cho ứng viên <span className="text-red-500">*</span></label>
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          <RichTextEditor value={form.applyInstruction} onChange={(v) => setField('applyInstruction', v)} placeholder="Nhập quy chuẩn & cách thức nhận CV..." />
        </div>
      </div>
      <label className="flex items-center gap-2 font-semibold text-sm text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 max-w-max cursor-pointer">
        <input
          type="checkbox"
          checked={form.isUrgent}
          onChange={(e) => setField('isUrgent', e.target.checked)}
          className="rounded"
        />
        Đánh dấu đây là tin tuyển dụng GẤP (Hiển thị Badge Urgent nổi bật)
      </label>
    </div>
  );
};



// ==================== REUSABLE ATOM COMPONENT UI ELEMENTS ====================

const Field = ({ label, value, onChange, placeholder = '', required = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none font-medium text-slate-800 transition-all text-sm focus:border-primary focus:ring-1 focus:ring-[#003f87]"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required = false, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-primary bg-white disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
    >
      <option value="">-- Vui lòng click chọn --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
      ))}
    </select>
  </div>
);





const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState('3');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const apply = (command, commandValue = null) => {
    editorRef.current?.focus();
    try {
      document.execCommand(command, false, commandValue);
    } catch {
      // no-op
    }
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || '');

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
        <button type="button" onClick={() => apply('bold')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
          B
        </button>
        <button type="button" onClick={() => apply('italic')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold italic">
          I
        </button>
        <button type="button" onClick={() => apply('underline')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold underline">
          U
        </button>
        <span className="w-px h-6 bg-slate-200 mx-1" />
        <button type="button" onClick={() => apply('insertUnorderedList')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
          • List
        </button>
        <button type="button" onClick={() => apply('insertOrderedList')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
          1. List
        </button>
        <span className="w-px h-6 bg-slate-200 mx-1" />
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer" title="Màu chữ">
          <input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" onChange={(e) => apply('foreColor', e.target.value)} />
        </label>
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1 cursor-pointer" title="Màu nền chữ">
          <input type="color" className="w-6 h-6 p-0 border-0 rounded cursor-pointer" onChange={(e) => apply('hiliteColor', e.target.value)} />
        </label>
        <span className="w-px h-6 bg-slate-200 mx-1" />
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          Cỡ chữ
          <select
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              apply('fontSize', e.target.value);
            }}
          >
            <option value="2">Nhỏ</option>
            <option value="3">Vừa</option>
            <option value="4">Lớn</option>
            <option value="5">Rất lớn</option>
          </select>
        </label>
        <span className="w-px h-6 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Nhập link (URL):');
            if (!url) return;
            apply('createLink', url);
          }}
          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
        >
          Link
        </button>
        <button type="button" onClick={() => apply('removeFormat')} className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold">
          Xóa format
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-48 px-4 py-3 outline-none prose max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:ml-4"
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default CreateEditJob;