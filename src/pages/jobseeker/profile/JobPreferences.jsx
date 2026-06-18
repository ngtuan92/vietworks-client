import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Briefcase, DollarSign, MapPin, Award, Loader2 } from 'lucide-react';
import { updateJobPreferences } from '../../../services/jobseekerService';
import { getCareerGroups, getCareersByGroup, getCareerPositions, getExperienceLevels } from '../../../services/jobService';

const JobPreferences = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    careerGroupId: '',
    careerId: '',
    careerPositionId: '',
    experienceLevelId: '',
    salaryMin: '',
    salaryMax: '',
  });

  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [cgRes, expRes] = await Promise.all([getCareerGroups(), getExperienceLevels()]);
        setCareerGroups(cgRes.data || []);
        setExperienceLevels(expRes.data || []);
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoadingMaster(false);
      }
    };
    loadMasterData();
  }, []);

  useEffect(() => {
    if (!formData.careerGroupId) { setCareers([]); return; }
    getCareersByGroup(formData.careerGroupId)
      .then(r => setCareers(r.data || []))
      .catch(() => setCareers([]));
    setFormData(prev => ({ ...prev, careerId: '', careerPositionId: '' }));
  }, [formData.careerGroupId]);

  useEffect(() => {
    if (!formData.careerId) { setPositions([]); return; }
    getCareerPositions(formData.careerId)
      .then(r => setPositions(r.data || []))
      .catch(() => setPositions([]));
    setFormData(prev => ({ ...prev, careerPositionId: '' }));
  }, [formData.careerId]);

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateJobPreferences({
        careerGroupId: formData.careerGroupId || undefined,
        careerId: formData.careerId || undefined,
        careerPositionId: formData.careerPositionId || undefined,
        experienceLevelId: formData.experienceLevelId || undefined,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      });
      setMessage('Lưu nhu cầu công việc thành công! Hệ thống sẽ gợi ý việc làm phù hợp cho bạn.');
      setTimeout(() => navigate('/matched-jobs'), 1500);
    } catch {
      setError('Không thể lưu nhu cầu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingMaster) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-slate-800 antialiased">
      <main className="w-full max-w-2xl flex flex-col gap-6">

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black text-[#003f87] mb-2">Mô tả công việc mong muốn</h1>
          <p className="text-slate-500 text-sm">Chúng tôi sẽ gợi ý cơ hội tốt nhất dựa trên các tiêu chí bạn thiết lập dưới đây.</p>
        </div>

        <div className="flex items-center justify-center gap-4 px-4">
          <StepItem num={1} active={step === 1} completed={step > 1} label="Vị trí" icon={<Briefcase className="w-4 h-4" />} />
          <div className={`h-0.5 w-12 md:w-16 transition-colors ${step > 1 ? 'bg-primary' : 'bg-slate-200'}`} />
          <StepItem num={2} active={step === 2} completed={step > 2} label="Yêu cầu" icon={<Award className="w-4 h-4" />} />
          <div className={`h-0.5 w-12 md:w-16 transition-colors ${step > 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          <StepItem num={3} active={step === 3} completed={step > 3} label="Lương" icon={<DollarSign className="w-4 h-4" />} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-2 hero-gradient w-full" />
          <div className="p-6 md:p-8 flex-grow">
            {message && (
              <div className="mb-6 p-4 rounded-xl text-center bg-blue-50 text-blue-800 border border-blue-200 text-sm font-semibold">{message}</div>
            )}
            {error && (
              <div className="mb-6 p-4 rounded-xl text-center bg-red-50 text-red-700 border border-red-200 text-sm font-semibold">{error}</div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-primary w-5 h-5" /> Bước 1: Vị trí chuyên môn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nhóm ngành nghề</label>
                    <select
                      value={formData.careerGroupId}
                      onChange={e => setFormData(p => ({ ...p, careerGroupId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      <option value="">-- Chọn nhóm ngành --</option>
                      {careerGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngành nghề cụ thể</label>
                    <select
                      value={formData.careerId}
                      onChange={e => setFormData(p => ({ ...p, careerId: e.target.value }))}
                      disabled={!formData.careerGroupId}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm disabled:opacity-50"
                    >
                      <option value="">-- Chọn ngành nghề --</option>
                      {careers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Vị trí chuyên môn</label>
                  <select
                    value={formData.careerPositionId}
                    onChange={e => setFormData(p => ({ ...p, careerPositionId: e.target.value }))}
                    disabled={!formData.careerId}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm disabled:opacity-50"
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {positions.map(pos => <option key={pos._id} value={pos._id}>{pos.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="text-primary w-5 h-5" /> Bước 2: Mức kinh nghiệm
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mức kinh nghiệm mong muốn</label>
                  <select
                    value={formData.experienceLevelId}
                    onChange={e => setFormData(p => ({ ...p, experienceLevelId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                  >
                    <option value="">-- Chọn mức kinh nghiệm --</option>
                    {experienceLevels.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="text-primary w-5 h-5" /> Bước 3: Khoảng lương mong muốn
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Khoảng lương (Triệu VND)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-slate-400">Từ</span>
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={e => setFormData(p => ({ ...p, salaryMin: e.target.value }))}
                        placeholder="0"
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm font-semibold"
                      />
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-slate-400">Đến</span>
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={e => setFormData(p => ({ ...p, salaryMax: e.target.value }))}
                        placeholder="Không giới hạn"
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={prevStep}
              className={`text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-2 ${step === 1 ? 'invisible' : 'visible'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="flex gap-4">
              {step === totalSteps && (
                <button onClick={() => navigate('/')} className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                  Bỏ qua
                </button>
              )}
              <button
                onClick={step === totalSteps ? handleSave : nextStep}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step === totalSteps ? 'Hoàn thành' : 'Tiếp tục'}
                {step !== totalSteps && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs">© 2026 VietWorks - Nền tảng kết nối cơ hội sự nghiệp hàng đầu Việt Nam.</p>
      </main>
    </div>
  );
};

const StepItem = ({ num, active, completed, label, icon }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
      active ? 'bg-primary text-white scale-110 shadow-md' :
      completed ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white border border-slate-200 text-slate-400'
    }`}>
      {completed ? <Check className="w-4 h-4" /> : icon}
    </div>
    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${active ? 'text-primary' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export default JobPreferences;
