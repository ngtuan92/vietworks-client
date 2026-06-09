import { useMemo, useState, useEffect } from 'react';
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
  'Xem trước & gửi duyệt',
];

const CreateEditJob = () => {
  const [step, setStep] = useState(1);
  const [isCompanyVerified, setIsCompanyVerified] = useState(true); // Giả định đã xác thực để test tính năng
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
const [companyLocations, setCompanyLocations] = useState([]);
  // --- States lưu trữ Danh mục Động từ Backend ---
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  // --- State Form chuẩn hóa theo DB Schema ---
  const [form, setForm] = useState({
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
    saturdayPolicy: 'NOT_SPECIFIED', // 'WORK_SATURDAY', 'OFF_SATURDAY', 'NOT_SPECIFIED'
    description: '',
    requirements: '',
    benefits: '',
    workingTime: '',
    applyInstruction: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm trực tiếp vào nút Ứng tuyển.',
    deadline: '',
    isUrgent: false,
  });
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
        const [resGroups, resExp] = await Promise.all([
          jobApi.getCareerGroups(),
          jobApi.getExperienceLevels()
        ]);
        if (resGroups.success) setCareerGroups(resGroups.data);
        if (resExp.success) setExperienceLevels(resExp.data);
      } catch (err) {
        showToast('error', 'Không thể tải dữ liệu danh mục hệ thống.');
      }
    };
    fetchInitialMasterData();
  }, []);

  // --- Xử lý Load danh mục phụ thuộc (Dependent Dropdowns) ---
  useEffect(() => {
    if (!form.careerGroupId) {
      setCareers([]);
      setJobLevels([]);
      setSkills([]);
      return;
    }
    
    const fetchDependentByGroup = async () => {
      try {
        const [resCareers, resLevels, resSkills] = await Promise.all([
          jobApi.getCareersByGroup(form.careerGroupId),
          jobApi.getJobLevels(form.careerGroupId),
          jobApi.getSkillsByCareerGroup(form.careerGroupId)
        ]);
        if (resCareers.success) setCareers(resCareers.data);
        if (resLevels.success) setJobLevels(resLevels.data);
        if (resSkills.success) setSkills(resSkills.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDependentByGroup();
  }, [form.careerGroupId]);

  useEffect(() => {
    if (!form.careerId) {
      setPositions([]);
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

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

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
      return Boolean(form.description && form.workingTime);
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

  const next = () => canNext && setStep((p) => Math.min(7, p + 1));
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 opacity-100 transition-opacity">
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
        <button 
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
        >
          {isLoading ? 'Đang xử lý...' : 'Lưu nháp hệ thống'}
        </button>
      </div>

      {/* Khối hiển thị các bước dạng Tab trực quan trên cùng */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          {STEPS.map((label, idx) => {
            const current = idx + 1;
            const active = current === step;
            const done = current < step;
            return (
              <div 
                key={label} 
                className={`rounded-xl px-3 py-2.5 text-xs font-bold text-center border transition-all ${
                  active ? 'bg-[#003f87] text-white border-[#003f87] shadow-sm' : 
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
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
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
        {step === 3 && <StepDescription form={form} setField={setField} />}
        {step === 4 && <StepRequirements form={form} setField={setField} skills={skills} toggleMulti={toggleMulti}  />}
        {step === 5 && <StepBenefits form={form} setField={setField} />}
        {step === 6 && (
          <StepLocationDeadline 
            form={form} 
            setField={setField} 
  companyLocations={companyLocations}
          />
        )}        
        {step === 7 && (
          <StepPreview 
            form={form} 
            isCompanyVerified={isCompanyVerified} 
            careerGroups={careerGroups}
            careers={careers}
            positions={positions}
            jobLevels={jobLevels}
            experienceLevels={experienceLevels}
            skills={skills}
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
            {step < 7 ? (
              <button
                onClick={next}
                disabled={!canNext}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                  canNext ? 'bg-[#003f87] text-white hover:bg-[#0b4e9f]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Tiếp tục
              </button>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold">Chỉnh sửa lại</button>
                <button onClick={handleSaveDraft} disabled={isLoading} className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-semibold disabled:opacity-50">Lưu nháp</button>
             
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// ==================== SUB-COMPONENTS CHO TỪNG BƯỚC FORM ====================

const StepBasicInfo = ({ form, setField, careerGroups, careers, positions, jobLevels, experienceLevels }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 1: Thông tin cơ bản</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Field label="Tiêu đề công việc" required value={form.title} onChange={(v) => setField('title', v)} placeholder="VD: Senior Backend Developer (NodeJS)" />
      
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

const StepDescription = ({ form, setField }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 3: Bản mô tả công việc</h2>
    <TextArea label="Chi tiết công việc diễn ra" required value={form.description} onChange={(v) => setField('description', v)} placeholder="- Chịu trách nhiệm kiến trúc hệ thống dữ liệu API Backend...&#10;- Xây dựng tài liệu kỹ thuật dự án..." />
    <TextArea label="Quy chuẩn thời gian làm việc" required value={form.workingTime} onChange={(v) => setField('workingTime', v)} placeholder="Thứ 2 - Thứ 6 (Từ 08:30 đến 17:45). Nghỉ trưa 1 tiếng 30 phút." />
  </div>
);

const StepRequirements = ({ form, setField, skills, toggleMulti }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 4: Tiêu chí và Yêu cầu ứng viên</h2>
    <TextArea label="Yêu cầu năng lực chuyên môn" required value={form.requirements} onChange={(v) => setField('requirements', v)} placeholder="- Tối thiểu từ 2 năm chinh chiến thực tế với hệ sinh thái Node.JS...&#10;- Tư duy cấu trúc dữ liệu giải thuật tốt..." />
    
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
                  isSelected ? 'bg-[#003f87] text-white border-[#003f87]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
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
    <TextArea label="Quyền lợi ứng viên được hưởng" required value={form.benefits} onChange={(v) => setField('benefits', v)} placeholder="- Thu nhập tháng 13 + thưởng KPI hiệu suất cuối năm hấp dẫn...&#10;- Đóng đầy đủ BHXH, BHYT theo luật định..." />
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
                      ? 'border-[#003f87] bg-blue-50'
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
          options={[
            { value: 'NOT_SPECIFIED', label: 'Không đề cập chi tiết' },
            { value: 'WORK_SATURDAY', label: 'Có làm việc ngày Thứ 7' },
            { value: 'OFF_SATURDAY', label: 'Nghỉ hoàn toàn Thứ 7 & CN' },
          ]}
        />
        <Field
          label="Hạn cuối nộp hồ sơ nhận CV"
          required
          type="date"
          value={form.deadline}
          onChange={(v) => setField('deadline', v)}
        />
      </div>

      {isPastDeadline ? (
        <p className="text-sm text-red-600 font-medium">
          ⚠️ Lỗi: Ngày hết hạn không hợp lệ (không thể chọn ngày trong quá khứ).
        </p>
      ) : null}

      <TextArea
        label="Hướng dẫn nộp hồ sơ chi tiết cho ứng viên"
        required
        value={form.applyInstruction}
        onChange={(v) => setField('applyInstruction', v)}
      />

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

const StepPreview = ({ form, isCompanyVerified, careerGroups, careers, positions, jobLevels, experienceLevels, skills }) => {
  const groupLabel = careerGroups.find(g => g._id === form.careerGroupId)?.name || '-';
  const careerLabel = careers.find(c => c._id === form.careerId)?.name || '-';
  const positionLabel = positions.find(p => p._id === form.careerPositionId)?.name || '-';
  const levelLabel = jobLevels.find(l => l._id === form.jobLevelId)?.name || '-';
  const expLabel = experienceLevels.find(e => e._id === form.experienceLevelId)?.name || '-';
  const chosenSkills = skills.filter(s => form.skills.includes(s._id)).map(s => s.name);
  
  // Cập nhật cấu trúc hiển thị preview địa điểm mới từ chuỗi fullAddress đã được gộp sẵn
  const locationLabels = form.workLocations.map(loc => loc.address || loc.provinceName).filter(Boolean);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 7: Kiểm tra cấu trúc hiển thị tin tuyển dụng</h2>
      {!isCompanyVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm font-medium">
          🔒 Tài khoản doanh nghiệp chưa được hệ thống định danh. Vui lòng hoàn thành hồ sơ xác thực công ty để kích hoạt tính năng "Gửi duyệt".
        </div>
      )}

      <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 bg-white space-y-6 shadow-sm">
        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-900">{form.title || 'Chưa đặt tiêu đề tuyển dụng'}</h3>
              {form.isUrgent && <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Tuyển gấp</span>}
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-1">Phân loại danh mục: {groupLabel} ➜ {careerLabel} ({positionLabel})</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#003f87] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">TRẠNG THÁI: BẢN NHÁP DRAFT</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <InfoCard label="Hạn định mức lương" value={form.salaryType === 'NEGOTIABLE' ? 'Thỏa thuận' : `${form.salaryFrom || 0} - ${form.salaryTo || 'Nhiều'} Triệu`} />
          <InfoCard label="Khu vực làm việc" value={locationLabels.join('; ') || 'Chưa định vị'} /> 
          <InfoCard label="Cấp bậc mong muốn" value={levelLabel} />
          <InfoCard label="Yêu cầu kinh nghiệm" value={expLabel} />
        </div>

        <div className="space-y-4 pt-2">
          <PreviewSection title="1. Chi tiết Mô tả Công việc" content={form.description} />
          <PreviewSection title="2. Yêu cầu chi tiết đối với ứng viên" content={form.requirements} />
          
          {chosenSkills.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Từ khóa công nghệ / Kỹ năng bắt buộc kèm theo:</h4>
              <div className="flex flex-wrap gap-1.5">
                {chosenSkills.map(name => <span key={name} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium">{name}</span>)}
              </div>
            </div>
          )}

          <PreviewSection title="3. Các quyền lợi & Gói chế độ phúc lợi được hưởng" content={form.benefits} />
          <PreviewSection title="4. Khung giờ làm việc hành chính" content={form.workingTime} />
          <PreviewSection title="5. Quy chuẩn & Cách thức nhận CV ứng tuyển" content={form.applyInstruction} />

          <div className="text-xs text-slate-400 font-medium pt-2">Hạn chót đóng cổng nhận hồ sơ trực tuyến: {form.deadline ? new Date(form.deadline).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}</div>
        </div>
      </div>
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
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none font-medium text-slate-800 transition-all text-sm focus:border-[#003f87] focus:ring-1 focus:ring-[#003f87]"
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
      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#003f87] bg-white disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
    >
      <option value="">-- Vui lòng click chọn --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[#003f87] whitespace-pre-line"
      placeholder={placeholder}
    />
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
    <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">{label}</span>
    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{value || 'N/A'}</span>
  </div>
);

const PreviewSection = ({ title, content }) => (
  <div className="space-y-1">
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
      {content || <span className="text-slate-400 italic">Nội dung này chưa được nhập liệu...</span>}
    </p>
  </div>
);

export default CreateEditJob;