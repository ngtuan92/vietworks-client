import { useMemo, useState } from 'react';

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
  const [isCompanyVerified] = useState(false);
  const [form, setForm] = useState({
    title: '',
    careerGroup: '',
    career: '',
    specialty: '',
    level: '',
    quantity: '',
    workType: '',
    experience: '',
    salaryType: 'range',
    salaryFrom: '',
    salaryTo: '',
    showSalary: true,
    jobDescription: '',
    dailyTasks: '',
    workingTime: '',
    requirements: '',
    requiredSkills: [],
    preferredSkills: [],
    degree: '',
    gender: '',
    ageFrom: '',
    ageTo: '',
    benefits: '',
    allowances: '',
    insurance: false,
    bonus: '',
    locations: [],
    saturdayPolicy: '',
    deadline: '',
    applyGuide: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.',
  });

  const canNext = useMemo(() => {
    if (step === 1) {
      return Boolean(form.title && form.careerGroup && form.career && form.specialty && form.level && form.quantity && form.workType && form.experience);
    }
    if (step === 2) {
      if (form.salaryType === 'negotiable') return true;
      if (!form.salaryFrom || !form.salaryTo) return false;
      return Number(form.salaryFrom) <= Number(form.salaryTo);
    }
    if (step === 3) {
      return Boolean(form.jobDescription && form.workingTime);
    }
    if (step === 4) {
      return Boolean(form.requirements && form.requiredSkills.length > 0);
    }
    if (step === 5) {
      return Boolean(form.benefits);
    }
    if (step === 6) {
      if (!form.deadline || form.locations.length === 0) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(form.deadline);
      return selected >= today;
    }
    return true;
  }, [form, step]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleMulti = (key, value) => {
    setForm((prev) => {
      const current = new Set(prev[key]);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...prev, [key]: Array.from(current) };
    });
  };

  const next = () => {
    if (!canNext) return;
    setStep((prev) => Math.min(7, prev + 1));
  };

  const prev = () => setStep((p) => Math.max(1, p - 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo tin tuyển dụng</h1>
          <p className="text-slate-600 mt-1">Điền đầy đủ thông tin theo từng bước trước khi gửi duyệt.</p>
        </div>
        <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50">
          Lưu nháp
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          {STEPS.map((label, idx) => {
            const current = idx + 1;
            const active = current === step;
            const done = current < step;
            return (
              <div key={label} className={`rounded-xl px-3 py-2 text-sm font-semibold text-center border ${
                active ? 'bg-[#003f87] text-white border-[#003f87]' : done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                B{current}. {label}
              </div>
            );
          })}
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        {step === 1 ? (
          <StepBasicInfo form={form} setField={setField} />
        ) : null}
        {step === 2 ? (
          <StepSalary form={form} setField={setField} />
        ) : null}
        {step === 3 ? (
          <StepDescription form={form} setField={setField} />
        ) : null}
        {step === 4 ? (
          <StepRequirements form={form} setField={setField} toggleMulti={toggleMulti} />
        ) : null}
        {step === 5 ? (
          <StepBenefits form={form} setField={setField} />
        ) : null}
        {step === 6 ? (
          <StepLocationDeadline form={form} setField={setField} toggleMulti={toggleMulti} />
        ) : null}
        {step === 7 ? (
          <StepPreview form={form} isCompanyVerified={isCompanyVerified} />
        ) : null}

        <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
          <button onClick={prev} className={`px-4 py-2 rounded-xl border border-slate-200 font-semibold ${step === 1 ? 'invisible' : ''}`}>Quay lại</button>
          <div className="flex items-center gap-2">
            {step < 7 ? (
              <button
                onClick={next}
                disabled={!canNext}
                className={`px-5 py-2 rounded-xl font-semibold ${canNext ? 'bg-[#003f87] text-white hover:bg-[#0b4e9f]' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
              >
                Tiếp tục
              </button>
            ) : (
              <>
                <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold">Quay lại chỉnh sửa</button>
                <button className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Lưu nháp</button>
                <button
                  disabled={!isCompanyVerified}
                  className={`px-4 py-2 rounded-xl font-semibold ${isCompanyVerified ? 'bg-[#003f87] text-white hover:bg-[#0b4e9f]' : 'bg-amber-100 text-amber-800 cursor-not-allowed'}`}
                >
                  Gửi duyệt
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const StepBasicInfo = ({ form, setField }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 1: Thông tin cơ bản</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Field label="Tiêu đề công việc" required value={form.title} onChange={(v) => setField('title', v)} placeholder="VD: Senior Backend Developer" />
      <Select label="Nhóm nghề" required value={form.careerGroup} onChange={(v) => setField('careerGroup', v)} options={['Công nghệ thông tin', 'Kinh doanh', 'Marketing']} />
      <Select label="Nghề" required value={form.career} onChange={(v) => setField('career', v)} options={['Backend', 'Frontend', 'Data']} />
      <Select label="Vị trí chuyên môn" required value={form.specialty} onChange={(v) => setField('specialty', v)} options={['Node.js', 'React', 'DevOps']} />
      <Select label="Cấp bậc" required value={form.level} onChange={(v) => setField('level', v)} options={['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Trưởng/Phó phòng', 'Quản lý/Giám sát', 'Trưởng chi nhánh', 'Phó giám đốc', 'Giám đốc']} />
      <Field label="Số lượng tuyển" required type="number" value={form.quantity} onChange={(v) => setField('quantity', v)} placeholder="1" />
      <Select label="Hình thức làm việc" required value={form.workType} onChange={(v) => setField('workType', v)} options={['Toàn thời gian', 'Bán thời gian', 'Thực tập', 'Remote', 'Hybrid']} />
      <Select label="Kinh nghiệm" required value={form.experience} onChange={(v) => setField('experience', v)} options={['Không yêu cầu', 'Dưới 1 năm', '1 năm', '2 năm', '3 năm', '4 năm', '5 năm', 'Trên 5 năm']} />
    </div>
  </div>
);

const StepSalary = ({ form, setField }) => {
  const salaryError = form.salaryType !== 'negotiable' && form.salaryFrom && form.salaryTo && Number(form.salaryFrom) > Number(form.salaryTo);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 2: Mức lương</h2>
      <Select label="Loại lương" required value={form.salaryType} onChange={(v) => setField('salaryType', v)} options={['negotiable|Thỏa thuận', 'range|Khoảng lương', 'from|Từ mức', 'to|Đến mức']} useValueMap />
      {form.salaryType !== 'negotiable' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Lương từ (triệu)" required type="number" value={form.salaryFrom} onChange={(v) => setField('salaryFrom', v)} placeholder="15" />
          <Field label="Lương đến (triệu)" required type="number" value={form.salaryTo} onChange={(v) => setField('salaryTo', v)} placeholder="20" />
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.showSalary} onChange={(e) => setField('showSalary', e.target.checked)} />
        Hiển thị lương
      </label>
      {salaryError ? <p className="text-sm text-red-700">Lương từ không được lớn hơn lương đến.</p> : null}
    </div>
  );
};

const StepDescription = ({ form, setField }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 3: Mô tả công việc</h2>
    <TextArea label="Mô tả công việc" required value={form.jobDescription} onChange={(v) => setField('jobDescription', v)} placeholder="Tham gia phát triển và vận hành sản phẩm..." />
    <TextArea label="Công việc hằng ngày" value={form.dailyTasks} onChange={(v) => setField('dailyTasks', v)} placeholder="Phối hợp với các bộ phận liên quan..." />
    <TextArea label="Thời gian làm việc" required value={form.workingTime} onChange={(v) => setField('workingTime', v)} placeholder="Thứ 2 - Thứ 6, 08:30 - 17:30..." />
  </div>
);

const StepRequirements = ({ form, setField, toggleMulti }) => {
  const requiredSkills = ['Node.js', 'React', 'SQL', 'Docker', 'AWS'];
  const preferredSkills = ['Kubernetes', 'Microservices', 'Redis'];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 4: Yêu cầu ứng viên</h2>
      <TextArea label="Yêu cầu chuyên môn" required value={form.requirements} onChange={(v) => setField('requirements', v)} placeholder="Có kinh nghiệm xây dựng API..." />
      <SkillChips label="Kỹ năng bắt buộc" required values={form.requiredSkills} options={requiredSkills} onToggle={(skill) => toggleMulti('requiredSkills', skill)} />
      <SkillChips label="Kỹ năng ưu tiên" values={form.preferredSkills} options={preferredSkills} onToggle={(skill) => toggleMulti('preferredSkills', skill)} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Select label="Bằng cấp" value={form.degree} onChange={(v) => setField('degree', v)} options={['Không yêu cầu', 'Cao đẳng', 'Đại học', 'Sau đại học']} />
        <Select label="Giới tính" value={form.gender} onChange={(v) => setField('gender', v)} options={['Không yêu cầu', 'Nam', 'Nữ', 'Khác']} />
        <Field label="Độ tuổi từ" type="number" value={form.ageFrom} onChange={(v) => setField('ageFrom', v)} placeholder="22" />
        <Field label="Độ tuổi đến" type="number" value={form.ageTo} onChange={(v) => setField('ageTo', v)} placeholder="35" />
      </div>
    </div>
  );
};

const StepBenefits = ({ form, setField }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 5: Quyền lợi</h2>
    <TextArea label="Quyền lợi" required value={form.benefits} onChange={(v) => setField('benefits', v)} placeholder="- Lương thưởng cạnh tranh theo năng lực..." />
    <Field label="Phụ cấp" value={form.allowances} onChange={(v) => setField('allowances', v)} placeholder="Phụ cấp ăn trưa, gửi xe..." />
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={form.insurance} onChange={(e) => setField('insurance', e.target.checked)} />
      Có bảo hiểm
    </label>
    <Field label="Thưởng" value={form.bonus} onChange={(v) => setField('bonus', v)} placeholder="Thưởng KPI, thưởng lễ Tết..." />
  </div>
);

const StepLocationDeadline = ({ form, setField, toggleMulti }) => {
  const locations = ['TP. Hồ Chí Minh - Quận 1', 'Hà Nội - Hoàn Kiếm', 'Đà Nẵng - Hải Châu'];
  const isPast = form.deadline ? new Date(form.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) : false;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Bước 6: Địa điểm & hạn nộp</h2>
      <SkillChips label="Địa điểm làm việc" required values={form.locations} options={locations} onToggle={(loc) => toggleMulti('locations', loc)} />
      <Select label="Nghỉ thứ 7" value={form.saturdayPolicy} onChange={(v) => setField('saturdayPolicy', v)} options={['Không chọn', 'Làm thứ 7', 'Nghỉ thứ 7']} />
      <Field label="Hạn nộp hồ sơ" required type="date" value={form.deadline} onChange={(v) => setField('deadline', v)} />
      {isPast ? <p className="text-sm text-red-700">Ngày hết hạn không được là ngày trong quá khứ.</p> : null}
      <TextArea label="Cách thức ứng tuyển" required value={form.applyGuide} onChange={(v) => setField('applyGuide', v)} />
    </div>
  );
};

const StepPreview = ({ form, isCompanyVerified }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-900">Bước 7: Xem trước & gửi duyệt</h2>
    {!isCompanyVerified ? (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
        Công ty của bạn cần được xác thực trước khi đăng tin tuyển dụng.
      </div>
    ) : null}

    <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{form.title || 'Tên job'}</h3>
        <p className="text-slate-600">Công ty của bạn</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <Info label="Lương" value={form.salaryType === 'negotiable' ? 'Thỏa thuận' : `${form.salaryFrom || '-'} - ${form.salaryTo || '-'} triệu`} />
        <Info label="Địa điểm" value={form.locations.join(', ') || '-'} />
        <Info label="Kinh nghiệm" value={form.experience || '-'} />
        <Info label="Hạn nộp" value={form.deadline || '-'} />
      </div>
      <Section title="Mô tả công việc" value={form.jobDescription} />
      <Section title="Yêu cầu ứng viên" value={form.requirements} />
      <Section title="Quyền lợi" value={form.benefits} />
      <div className="pt-2">
        <button className="px-4 py-2 rounded-xl bg-[#003f87] text-white font-semibold">Ứng tuyển mẫu</button>
      </div>
    </div>
  </div>
);

const Field = ({ label, value, onChange, placeholder = '', required = false, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
      required={required}
    />
  </div>
);

const Select = ({ label, value, onChange, options, required = false, useValueMap = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] bg-white"
      required={required}
    >
      <option value="">Chọn...</option>
      {options.map((option) => {
        if (useValueMap) {
          const [val, label] = option.split('|');
          return <option key={option} value={val}>{label}</option>;
        }
        return <option key={option} value={option}>{option}</option>;
      })}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87]"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const SkillChips = ({ label, options, values, onToggle, required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required ? <span className="text-red-600">*</span> : null}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((skill) => {
        const active = values.includes(skill);
        return (
          <button
            key={skill}
            type="button"
            onClick={() => onToggle(skill)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              active ? 'bg-[#003f87] text-white border-[#003f87]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {skill}
          </button>
        );
      })}
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold text-slate-900 mt-1">{value}</p>
  </div>
);

const Section = ({ title, value }) => (
  <div>
    <h4 className="font-semibold text-slate-900">{title}</h4>
    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{value || 'Chưa có nội dung.'}</p>
  </div>
);

export default CreateEditJob;
