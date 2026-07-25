import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Briefcase, DollarSign, MapPin, Award, Loader2, X, Heart, Target, ChevronRight
} from 'lucide-react';
import {
  updateJobPreferences,
  getJobPreferences
} from '../../../services/jobseekerService';
import {
  getCareerGroups,
  getCareersByGroup,
  getCareerPositions,
  getJobLevels
} from '../../../services/jobService';
import HierarchicalLocationPicker from '../../../components/HierarchicalLocationPicker';
import { EXPERIENCE_LEVELS } from '../../../constants/masterDataConstants';
import { useNotification } from '../../../contexts/NotificationContext';

const STEPS = [
  { num: 1, key: 'position', label: 'Vị trí', icon: Briefcase },
  { num: 2, key: 'experience', label: 'Kinh nghiệm', icon: Award },
  { num: 3, key: 'salary', label: 'Mức lương', icon: DollarSign },
  { num: 4, key: 'location', label: 'Địa điểm', icon: MapPin },
];

// Validate a step and return an object of field errors
const validateStep = (stepNum, formData) => {
  const errors = {};
  if (stepNum === 1) {
    if (!formData.careerGroupId) errors.careerGroupId = 'Vui lòng chọn nhóm ngành nghề.';
    if (!formData.careerId) errors.careerId = 'Vui lòng chọn ngành nghề cụ thể.';
    if (!formData.careerPositionId) errors.careerPositionId = 'Vui lòng chọn vị trí chuyên môn.';
    if (!formData.jobLevelId) errors.jobLevelId = 'Vui lòng chọn cấp bậc.';
  }
  if (stepNum === 2) {
    if (!formData.experience) errors.experience = 'Vui lòng chọn mức kinh nghiệm.';
  }
  // Step 3 (salary) and step 4 (location) are optional — no required errors
  return errors;
};

const isStepComplete = (stepNum, formData) => {
  return Object.keys(validateStep(stepNum, formData)).length === 0;
};

const JobPreferences = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [step, setStep] = useState(1);
  // Track which steps have been "touched" (attempted to navigate away from)
  const [touched, setTouched] = useState({});
  // Per-field errors only shown after touch
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    careerGroupId: '',
    careerId: '',
    careerPositionId: '',
    jobLevelId: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    workLocations: []
  });

  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [globalJobLevels, setGlobalJobLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cgRes, jlRes, prefsRes] = await Promise.all([
          getCareerGroups(),
          getJobLevels(),
          getJobPreferences()
        ]);
        setCareerGroups(cgRes.data || []);
        setGlobalJobLevels(jlRes.data || []);
        setJobLevels(jlRes.data || []);

        const data = prefsRes.data;
        if (data) {
          const dj = data.desiredJob || {};
          setFormData({
            careerGroupId: dj.careerGroupId?._id || dj.careerGroupId || '',
            careerId: dj.careerId?._id || dj.careerId || '',
            careerPositionId: dj.careerPositionId?._id || dj.careerPositionId || '',
            jobLevelId: dj.jobLevelId?._id || dj.jobLevelId || '',
            experience: dj.experience || '',
            salaryMin: dj.salaryExpectationMillion?.min ?? '',
            salaryMax: dj.salaryExpectationMillion?.max ?? '',
            workLocations: Array.isArray(dj.workLocations) ? dj.workLocations : []
          });
        }
      } catch {
        showError('Không thể tải dữ liệu. Vui lòng thử lại.', 'Lỗi tải dữ liệu');
      } finally {
        setLoadingMaster(false);
        setPreferencesLoaded(true);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    if (!formData.careerGroupId) { setCareers([]); return; }
    getCareersByGroup(formData.careerGroupId)
      .then((r) => setCareers(r.data || []))
      .catch(() => setCareers([]));
  }, [formData.careerGroupId, preferencesLoaded]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    if (!formData.careerId) { setPositions([]); return; }
    getCareerPositions(formData.careerId)
      .then((r) => setPositions(r.data || []))
      .catch(() => setPositions([]));
  }, [formData.careerId, preferencesLoaded]);

  useEffect(() => {
    if (!preferencesLoaded) return;

    if (!formData.careerGroupId) {
      setJobLevels(globalJobLevels);
      return;
    }

    const selectedGroup = careerGroups.find((g) => g._id === formData.careerGroupId);
    if (selectedGroup && selectedGroup.slug !== 'cong-nghe-thong-tin') {
      const itLevels = [
        'Thực tập sinh (IT)', 'Fresher', 'Junior', 'Senior',
        'Technical Leader', 'IT Manager / Project Manager',
        'Giám đốc công nghệ (CTO) / Director'
      ];
      setJobLevels(globalJobLevels.filter((lvl) => !itLevels.includes(lvl.name)));
    } else {
      setJobLevels(globalJobLevels);
    }
  }, [formData.careerGroupId, preferencesLoaded, careerGroups, globalJobLevels]);

  useEffect(() => {
    if (!formData.careerGroupId) {
      setFormData((prev) => (prev.careerId || prev.careerPositionId || prev.jobLevelId
        ? { ...prev, careerId: '', careerPositionId: '', jobLevelId: '' }
        : prev));
    }
  }, [formData.careerGroupId]);

  useEffect(() => {
    if (!preferencesLoaded || !formData.jobLevelId || !jobLevels.length) return;
    const isValidJobLevel = jobLevels.some((level) => level._id === formData.jobLevelId);
    if (!isValidJobLevel) {
      setFormData((prev) => ({ ...prev, jobLevelId: '' }));
    }
  }, [formData.jobLevelId, jobLevels, preferencesLoaded]);

  useEffect(() => {
    if (!formData.careerId) {
      setFormData((prev) => (prev.careerPositionId
        ? { ...prev, careerPositionId: '' }
        : prev));
    }
  }, [formData.careerId]);

  // Re-validate current step errors in real-time when user fills in data (only if already touched)
  useEffect(() => {
    if (touched[step]) {
      setFieldErrors(validateStep(step, formData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, step]);

  // Compute completion state for each step
  const stepsCompletion = STEPS.reduce((acc, s) => {
    acc[s.num] = isStepComplete(s.num, formData);
    return acc;
  }, {});
  const allStepsComplete = STEPS.every((s) => stepsCompletion[s.num]);

  const goToStep = (targetStep) => {
    // Mark current step as touched before leaving
    setTouched((prev) => ({ ...prev, [step]: true }));
    setFieldErrors(validateStep(step, formData));

    if (allStepsComplete) {
      // All steps done: free navigation
      setStep(targetStep);
      setFieldErrors(validateStep(targetStep, formData));
      return;
    }

    // Otherwise, only allow going back or to the next step if current is valid
    const errors = validateStep(step, formData);
    if (targetStep < step) {
      setStep(targetStep);
      setFieldErrors({});
      return;
    }
    if (Object.keys(errors).length === 0 && targetStep === step + 1) {
      setStep(targetStep);
      setFieldErrors({});
    }
  };

  const nextStep = () => {
    // Mark as touched and show errors
    setTouched((prev) => ({ ...prev, [step]: true }));
    const errors = validateStep(step, formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
    setFieldErrors({});
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    setFieldErrors({});
  };

  const addLocation = (loc) => {
    if (!loc || !loc.provinceName) return;
    setFormData((prev) => {
      const exists = prev.workLocations.some(
        (l) => l.provinceCode === loc.provinceId
          && l.districtCode === (loc.districtName || '')
          && l.wardCode === (loc.wardName || '')
      );
      if (exists) return prev;
      return {
        ...prev,
        workLocations: [
          ...prev.workLocations,
          {
            provinceCode: loc.provinceId || '',
            provinceName: loc.provinceName || '',
            districtCode: loc.districtName || '',
            districtName: loc.districtName || '',
            wardCode: loc.wardName || '',
            wardName: loc.wardName || '',
            detailAddress: loc.fullAddress || loc.detailAddress || ''
          }
        ]
      };
    });
  };

  const removeLocation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      workLocations: prev.workLocations.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    // Validate all required steps before saving
    const allErrors = {};
    STEPS.forEach((s) => {
      const errs = validateStep(s.num, formData);
      Object.assign(allErrors, errs);
    });
    if (Object.keys(allErrors).length > 0) {
      // Jump to first invalid step
      const firstInvalid = STEPS.find((s) => !stepsCompletion[s.num]);
      if (firstInvalid) {
        setStep(firstInvalid.num);
        setTouched((prev) => ({ ...prev, [firstInvalid.num]: true }));
        setFieldErrors(validateStep(firstInvalid.num, formData));
      }
      return;
    }

    setSaving(true);
    try {
      await updateJobPreferences({
        careerGroupId: formData.careerGroupId || undefined,
        careerId: formData.careerId || undefined,
        careerPositionId: formData.careerPositionId || undefined,
        jobLevelId: formData.jobLevelId || undefined,
        experience: formData.experience || undefined,
        salaryMin: formData.salaryMin !== '' ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax !== '' ? Number(formData.salaryMax) : undefined,
        workLocations: formData.workLocations.length > 0 ? formData.workLocations : undefined
      });
      success(
        'Hệ thống đã ghi nhận nhu cầu việc làm của bạn. Bạn sẽ được chuyển đến trang gợi ý việc làm phù hợp.',
        'Lưu nhu cầu thành công!',
        () => navigate('/matched-jobs')
      );
    } catch (err) {
      showError(
        err?.response?.data?.message || 'Không thể lưu nhu cầu. Vui lòng thử lại.',
        'Lưu thất bại'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCareerGroup = careerGroups.find((g) => g._id === formData.careerGroupId);
  const selectedCareer = careers.find((c) => c._id === formData.careerId);
  const selectedPosition = positions.find((p) => p._id === formData.careerPositionId);
  const selectedJobLevel = jobLevels.find((l) => l._id === formData.jobLevelId);

  if (loadingMaster) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-body-md text-slate-800 antialiased">
      <main className="mx-auto max-w-6xl space-y-6">

        {/* Hero Banner */}
        <section className="rounded-3xl hero-gradient p-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/75">Thiết lập nhu cầu</p>
                <h1 className="text-2xl md:text-3xl font-black">Mô tả công việc mong muốn</h1>
                <p className="text-white/80 mt-1 text-sm">
                  Hệ thống sẽ gợi ý cơ hội tốt nhất dựa trên các tiêu chí bạn thiết lập.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/matched-jobs')}
                className="px-4 py-2 rounded-xl bg-white text-[#003f87] font-bold text-sm hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                Xem việc phù hợp
              </button>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Sidebar stepper */}
          <aside className="rounded-2xl bg-white border border-slate-200 p-3 h-fit">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Các bước</p>
            </div>
            <nav className="space-y-1">
              {STEPS.map((s) => {
                const active = step === s.num;
                const completed = stepsCompletion[s.num];
                const Icon = s.icon;
                // Can click if: all done (free nav), or it's the current or previous step
                const clickable = allStepsComplete || s.num <= step;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => clickable && goToStep(s.num)}
                    disabled={!clickable}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left select-none transition-colors ${active
                        ? 'bg-primary text-white'
                        : completed
                          ? 'text-slate-700 bg-emerald-50 hover:bg-emerald-100'
                          : clickable
                            ? 'text-slate-500 bg-transparent hover:bg-slate-50'
                            : 'text-slate-300 bg-transparent cursor-not-allowed'
                      }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${active ? 'bg-white/20 text-white' : completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                      {completed && !active ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                    </span>
                    <span className="text-sm font-bold">{s.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            {/* Current selection summary */}
            {(selectedCareerGroup || selectedCareer) && (
              <div className="mt-4 pt-4 border-t border-slate-100 px-3 pb-1">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Đã chọn</p>
                <div className="space-y-1.5 text-xs">
                  {selectedCareerGroup && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Nhóm:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedCareerGroup.name}</span>
                    </div>
                  )}
                  {selectedCareer && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Nghề:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedCareer.name}</span>
                    </div>
                  )}
                  {selectedPosition && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Vị trí:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedPosition.name}</span>
                    </div>
                  )}
                  {selectedJobLevel && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Cấp bậc:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedJobLevel.name}</span>
                    </div>
                  )}
                  {formData.workLocations.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Địa điểm:</span>
                      <span className="font-semibold text-slate-700">{formData.workLocations.length} nơi</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
              {allStepsComplete
                ? '✅ Tất cả bước hoàn thành!'
                : 'Vui lòng hoàn thành lần lượt các bước.'}
            </div>
          </aside>

          {/* Main content area */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 min-h-[450px] flex flex-col">

            {/* Step header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black">
                  {step}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bước {step} / {STEPS.length}
                </span>
              </div>
              <SectionTitle
                title={stepContent[step].title}
                description={stepContent[step].description}
              />
            </div>

            {/* Step body */}
            <div className="flex-1">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Nhóm ngành nghề"
                      required
                      value={formData.careerGroupId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerGroupId: v, careerId: '', careerPositionId: '', jobLevelId: '' }))}
                      placeholder="-- Chọn nhóm ngành --"
                      options={careerGroups}
                      error={fieldErrors.careerGroupId}
                    />
                    <SelectField
                      label="Ngành nghề cụ thể"
                      required
                      value={formData.careerId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerId: v, careerPositionId: '' }))}
                      placeholder="-- Chọn ngành nghề --"
                      options={careers}
                      disabled={!formData.careerGroupId}
                      error={fieldErrors.careerId}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Vị trí chuyên môn"
                      required
                      value={formData.careerPositionId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerPositionId: v }))}
                      placeholder="-- Chọn vị trí --"
                      options={positions}
                      disabled={!formData.careerId}
                      error={fieldErrors.careerPositionId}
                    />
                    <SelectField
                      label="Cấp bậc"
                      required
                      value={formData.jobLevelId}
                      onChange={(v) => setFormData((p) => ({ ...p, jobLevelId: v }))}
                      placeholder="-- Chọn cấp bậc --"
                      options={jobLevels}
                      error={fieldErrors.jobLevelId}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <DatalistSelectField
                    label="Mức kinh nghiệm mong muốn"
                    required
                    value={formData.experience}
                    onChange={(v) => setFormData((p) => ({ ...p, experience: v }))}
                    placeholder="-- Chọn mức kinh nghiệm --"
                    options={EXPERIENCE_LEVELS}
                    hint="Hệ thống sẽ ưu tiên hiển thị các job có yêu cầu kinh nghiệm phù hợp."
                    error={fieldErrors.experience}
                  />

                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700">
                    <p className="font-bold mb-1">Mẹo tìm việc hiệu quả</p>
                    <p>Chọn đúng mức kinh nghiệm giúp hệ thống gợi ý các vị trí phù hợp nhất, tăng cơ hội được nhà tuyển dụng chú ý.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-700">Khoảng lương mong muốn (Triệu VNĐ)</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Từ</span>
                        <input
                          type="number"
                          value={formData.salaryMin}
                          onChange={(e) => setFormData((p) => ({ ...p, salaryMin: e.target.value }))}
                          placeholder="0"
                          min="0"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-12 text-sm font-semibold outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Đến</span>
                        <input
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) => setFormData((p) => ({ ...p, salaryMax: e.target.value }))}
                          placeholder="Không giới hạn"
                          min="0"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-12 text-sm font-semibold outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Bỏ trống nếu bạn chưa có yêu cầu cụ thể về mức lương.</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-700">
                    <p className="font-bold mb-1">Về khoảng lương</p>
                    <p>Hệ thống sẽ ưu tiên các job có mức lương nằm trong khoảng bạn mong muốn. Bạn có thể cập nhật lại bất kỳ lúc nào.</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-500">Chọn nhiều địa điểm nếu bạn sẵn sàng làm việc ở nhiều nơi.</p>

                  {formData.workLocations.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-700">Đã chọn ({formData.workLocations.length})</span>
                      <div className="space-y-2">
                        {formData.workLocations.map((loc, idx) => (
                          <div
                            key={`${loc.provinceCode}-${loc.districtCode}-${loc.wardCode}-${idx}`}
                            className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">
                                  {[loc.wardName, loc.districtName, loc.provinceName].filter(Boolean).join(', ') || loc.detailAddress}
                                </span>
                              </div>
                              {loc.detailAddress && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{loc.detailAddress}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLocation(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0 cursor-pointer"
                              title="Xóa"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 border-b border-slate-200">
                      Thêm địa điểm
                    </div>
                    <div className="p-2">
                      <HierarchicalLocationPicker onLocationSelect={addLocation} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                onClick={step === STEPS.length ? handleSave : nextStep}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === STEPS.length ? (saving ? 'Đang lưu...' : 'Hoàn thành') : 'Tiếp tục'}
                {step !== STEPS.length && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        <p className="text-center text-slate-400 text-xs">© 2026 VietWorks - Nền tảng kết nối cơ hội sự nghiệp hàng đầu Việt Nam.</p>
      </main>
    </div>
  );
};

const stepContent = {
  1: {
    title: 'Vị trí chuyên môn mong muốn',
    description: 'Chọn nhóm ngành, ngành cụ thể và vị trí bạn muốn ứng tuyển.',
  },
  2: {
    title: 'Mức kinh nghiệm',
    description: 'Chọn mức kinh nghiệm phù hợp với khả năng hiện tại của bạn.',
  },
  3: {
    title: 'Khoảng lương mong muốn',
    description: 'Thiết lập khoảng lương bạn mong muốn để hệ thống ưu tiên gợi ý.',
  },
  4: {
    title: 'Địa điểm làm việc',
    description: 'Chọn các tỉnh/thành phố nơi bạn sẵn sàng làm việc.',
  },
};

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-lg font-black text-slate-900">{title}</h2>
    {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, placeholder, options, disabled = false, required = false, hint, error }) => (
  <label className={`block ${disabled ? 'opacity-60' : ''}`}>
    <span className="block text-xs font-bold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all cursor-pointer disabled:cursor-not-allowed bg-white ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-primary'
        }`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt._id} value={opt._id}>{opt.name}</option>
      ))}
    </select>
    {error && (
      <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
    {hint && !error && <p className="text-xs text-slate-500 mt-2">{hint}</p>}
  </label>
);

const DatalistSelectField = ({ label, id = 'datalist', value, onChange, placeholder, options, disabled = false, required = false, hint, error }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      list={`${id}-list`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full text-sm rounded-xl border p-3 bg-white outline-none disabled:bg-slate-50 transition-colors ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary'
        }`}
    />
    <datalist id={`${id}-list`}>
      {options.map((opt) => (
        <option key={opt} value={opt} />
      ))}
    </datalist>
    {error && (
      <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
    {hint && !error && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{hint}</p>}
  </div>
);

export default JobPreferences;
