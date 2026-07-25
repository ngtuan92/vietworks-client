import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Briefcase, DollarSign, MapPin, Award, Loader2, X, Sliders, Heart, Target, ChevronRight
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
  { num: 1, key: 'position', label: 'Vá»‹ trÃ­', icon: Briefcase },
  { num: 2, key: 'experience', label: 'Kinh nghiá»‡m', icon: Award },
  { num: 3, key: 'salary', label: 'Má»©c lÆ°Æ¡ng', icon: DollarSign },
  { num: 4, key: 'location', label: 'Äá»‹a Ä‘iá»ƒm', icon: MapPin },
];

const JobPreferences = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [step, setStep] = useState(1);

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
        showError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Vui lÃ²ng thá»­ láº¡i.', 'Lá»—i táº£i dá»¯ liá»‡u');
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

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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
        'Há»‡ thá»‘ng Ä‘Ã£ ghi nháº­n nhu cáº§u viá»‡c lÃ m cá»§a báº¡n. Báº¡n sáº½ Ä‘Æ°á»£c chuyá»ƒn Ä‘áº¿n trang gá»£i Ã½ viá»‡c lÃ m phÃ¹ há»£p.',
        'LÆ°u nhu cáº§u thÃ nh cÃ´ng!',
        () => navigate('/matched-jobs')
      );
    } catch (err) {
      showError(
        err?.response?.data?.message || 'KhÃ´ng thá»ƒ lÆ°u nhu cáº§u. Vui lÃ²ng thá»­ láº¡i.',
        'LÆ°u tháº¥t báº¡i'
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
                <p className="text-sm text-white/75">Thiáº¿t láº­p nhu cáº§u</p>
                <h1 className="text-2xl md:text-3xl font-black">MÃ´ táº£ cÃ´ng viá»‡c mong muá»‘n</h1>
                <p className="text-white/80 mt-1 text-sm">
                  Há»‡ thá»‘ng sáº½ gá»£i Ã½ cÆ¡ há»™i tá»‘t nháº¥t dá»±a trÃªn cÃ¡c tiÃªu chÃ­ báº¡n thiáº¿t láº­p.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/matched-jobs')}
                className="px-4 py-2 rounded-xl bg-white text-[#003f87] font-bold text-sm hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                Xem viá»‡c phÃ¹ há»£p
              </button>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Sidebar stepper */}
          <aside className="rounded-2xl bg-white border border-slate-200 p-3 h-fit">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">CÃ¡c bÆ°á»›c</p>
            </div>
            <nav className="space-y-1">
              {STEPS.map((s) => {
                const active = step === s.num;
                const completed = step > s.num;
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    aria-disabled
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left select-none ${
                      active
                        ? 'bg-primary text-white'
                        : completed
                        ? 'text-slate-700 bg-emerald-50'
                        : 'text-slate-400 bg-transparent'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                      active ? 'bg-white/20 text-white' : completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {completed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                    </span>
                    <span className="text-sm font-bold">{s.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </div>
                );
              })}
            </nav>

            {/* Current selection summary */}
            {(selectedCareerGroup || selectedCareer) && (
              <div className="mt-4 pt-4 border-t border-slate-100 px-3 pb-1">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">ÄÃ£ chá»n</p>
                <div className="space-y-1.5 text-xs">
                  {selectedCareerGroup && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">NhÃ³m:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedCareerGroup.name}</span>
                    </div>
                  )}
                  {selectedCareer && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Nghá»:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedCareer.name}</span>
                    </div>
                  )}
                  {selectedPosition && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Vá»‹ trÃ­:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedPosition.name}</span>
                    </div>
                  )}
                  {selectedJobLevel && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Cáº¥p báº­c:</span>
                      <span className="font-semibold text-slate-700 line-clamp-2">{selectedJobLevel.name}</span>
                    </div>
                  )}
                  {formData.workLocations.length > 0 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0">Äá»‹a Ä‘iá»ƒm:</span>
                      <span className="font-semibold text-slate-700">{formData.workLocations.length} nÆ¡i</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
              Vui lÃ²ng hoÃ n thÃ nh láº§n lÆ°á»£t cÃ¡c bÆ°á»›c.
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
                  BÆ°á»›c {step} / {STEPS.length}
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
                      label="NhÃ³m ngÃ nh nghá»"
                      required
                      value={formData.careerGroupId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerGroupId: v, careerId: '', careerPositionId: '', jobLevelId: '' }))}
                      placeholder="-- Chá»n nhÃ³m ngÃ nh --"
                      options={careerGroups}
                    />
                    <SelectField
                      label="NgÃ nh nghá» cá»¥ thá»ƒ"
                      required
                      value={formData.careerId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerId: v, careerPositionId: '' }))}
                      placeholder="-- Chá»n ngÃ nh nghá» --"
                      options={careers}
                      disabled={!formData.careerGroupId}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Vá»‹ trÃ­ chuyÃªn mÃ´n"
                      required
                      value={formData.careerPositionId}
                      onChange={(v) => setFormData((p) => ({ ...p, careerPositionId: v }))}
                      placeholder="-- Chá»n vá»‹ trÃ­ --"
                      options={positions}
                      disabled={!formData.careerId}
                    />
                    <SelectField
                      label="Cáº¥p báº­c"
                      required
                      value={formData.jobLevelId}
                      onChange={(v) => setFormData((p) => ({ ...p, jobLevelId: v }))}
                      placeholder="-- Chá»n cáº¥p báº­c --"
                      options={jobLevels}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <DatalistSelectField
                    label="Má»©c kinh nghiá»‡m mong muá»‘n"
                    value={formData.experience}
                    onChange={(v) => setFormData((p) => ({ ...p, experience: v }))}
                    placeholder="-- Chá»n má»©c kinh nghiá»‡m --"
                    options={EXPERIENCE_LEVELS}
                    hint="Há»‡ thá»‘ng sáº½ Æ°u tiÃªn hiá»ƒn thá»‹ cÃ¡c job cÃ³ yÃªu cáº§u kinh nghiá»‡m phÃ¹ há»£p."
                  />

                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700">
                    <p className="font-bold mb-1">Máº¹o tÃ¬m viá»‡c hiá»‡u quáº£</p>
                    <p>Chá»n Ä‘Ãºng má»©c kinh nghiá»‡m giÃºp há»‡ thá»‘ng gá»£i Ã½ cÃ¡c vá»‹ trÃ­ phÃ¹ há»£p nháº¥t, tÄƒng cÆ¡ há»™i Ä‘Æ°á»£c nhÃ  tuyá»ƒn dá»¥ng chÃº Ã½.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-700">Khoáº£ng lÆ°Æ¡ng mong muá»‘n (Triá»‡u VNÄ)</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Tá»«</span>
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
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Äáº¿n</span>
                        <input
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) => setFormData((p) => ({ ...p, salaryMax: e.target.value }))}
                          placeholder="KhÃ´ng giá»›i háº¡n"
                          min="0"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-12 text-sm font-semibold outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Bá» trá»‘ng náº¿u báº¡n chÆ°a cÃ³ yÃªu cáº§u cá»¥ thá»ƒ vá» má»©c lÆ°Æ¡ng.</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-700">
                    <p className="font-bold mb-1">Vá» khoáº£ng lÆ°Æ¡ng</p>
                    <p>Há»‡ thá»‘ng sáº½ Æ°u tiÃªn cÃ¡c job cÃ³ má»©c lÆ°Æ¡ng náº±m trong khoáº£ng báº¡n mong muá»‘n. Báº¡n cÃ³ thá»ƒ cáº­p nháº­t láº¡i báº¥t ká»³ lÃºc nÃ o.</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-500">Chá»n nhiá»u Ä‘á»‹a Ä‘iá»ƒm náº¿u báº¡n sáºµn sÃ ng lÃ m viá»‡c á»Ÿ nhiá»u nÆ¡i.</p>

                  {formData.workLocations.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-slate-700">ÄÃ£ chá»n ({formData.workLocations.length})</span>
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
                              title="XÃ³a"
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
                      ThÃªm Ä‘á»‹a Ä‘iá»ƒm
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
                <ArrowLeft className="w-4 h-4" /> Quay láº¡i
              </button>
              <button
                onClick={step === STEPS.length ? handleSave : nextStep}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === STEPS.length ? (saving ? 'Äang lÆ°u...' : 'HoÃ n thÃ nh') : 'Tiáº¿p tá»¥c'}
                {step !== STEPS.length && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        <p className="text-center text-slate-400 text-xs">Â© 2026 VietWorks - Ná»n táº£ng káº¿t ná»‘i cÆ¡ há»™i sá»± nghiá»‡p hÃ ng Ä‘áº§u Viá»‡t Nam.</p>
      </main>
    </div>
  );
};

const stepContent = {
  1: {
    title: 'Vá»‹ trÃ­ chuyÃªn mÃ´n mong muá»‘n',
    description: 'Chá»n nhÃ³m ngÃ nh, ngÃ nh cá»¥ thá»ƒ vÃ  vá»‹ trÃ­ báº¡n muá»‘n á»©ng tuyá»ƒn.',
  },
  2: {
    title: 'Má»©c kinh nghiá»‡m',
    description: 'Chá»n má»©c kinh nghiá»‡m phÃ¹ há»£p vá»›i kháº£ nÄƒng hiá»‡n táº¡i cá»§a báº¡n.',
  },
  3: {
    title: 'Khoáº£ng lÆ°Æ¡ng mong muá»‘n',
    description: 'Thiáº¿t láº­p khoáº£ng lÆ°Æ¡ng báº¡n mong muá»‘n Ä‘á»ƒ há»‡ thá»‘ng Æ°u tiÃªn gá»£i Ã½.',
  },
  4: {
    title: 'Äá»‹a Ä‘iá»ƒm lÃ m viá»‡c',
    description: 'Chá»n cÃ¡c tá»‰nh/thÃ nh phá»‘ nÆ¡i báº¡n sáºµn sÃ ng lÃ m viá»‡c.',
  },
};

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-lg font-black text-slate-900">{title}</h2>
    {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, placeholder, options, disabled = false, required = false, hint }) => (
  <label className={`block ${disabled ? 'opacity-60' : ''}`}>
    <span className="block text-xs font-bold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary transition-all cursor-pointer disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt._id} value={opt._id}>{opt.name}</option>
      ))}
    </select>
    {hint && <p className="text-xs text-slate-500 mt-2">{hint}</p>}
  </label>
);

const DatalistSelectField = ({ label, id = 'datalist', value, onChange, placeholder, options, disabled = false, required = false, hint }) => (
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
      className="w-full text-sm rounded-xl border border-slate-200 p-3 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-slate-50 transition-colors"
    />
    <datalist id={`${id}-list`}>
      {options.map((opt) => (
        <option key={opt} value={opt} />
      ))}
    </datalist>
    {hint && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{hint}</p>}
  </div>
);

export default JobPreferences;

