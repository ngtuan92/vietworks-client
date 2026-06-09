import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Briefcase, DollarSign, MapPin, Award } from 'lucide-react';

const VIETNAM_PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Long An',
  'Cần Thơ',
  'Hải Phòng',
  'Bắc Ninh',
  'Quảng Ninh',
  'Khánh Hòa'
];

const JobPreferences = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form states
  const [formData, setFormData] = useState({
    careerGroup: '1',
    career: '1',
    position: 'Kỹ sư phần mềm',
    experienceLevel: '2',
    jobLevel: '3',
    salaryMin: '15',
    salaryMax: '25',
    preferredProvince: 'Hà Nội',
    relocate: true
  });

  const [message, setMessage] = useState('');

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = () => {
    setMessage('Đang lưu nhu cầu công việc...');
    setTimeout(() => {
      setMessage('Lưu nhu cầu công việc thành công! Hệ thống sẽ gợi ý việc làm phù hợp cho bạn.');
      setTimeout(() => {
        navigate('/matched-jobs');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-slate-800 antialiased">
      <main className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black text-[#003f87] mb-2">
            Mô tả công việc mong muốn
          </h1>
          <p className="text-slate-500 text-sm">
            Chúng tôi sẽ gợi ý cơ hội tốt nhất dựa trên các tiêu chí bạn thiết lập dưới đây.
          </p>
        </div>

        {/* Stepper Roadmap */}
        <div className="flex items-center justify-center gap-4 px-4">
          <StepItem num={1} active={step === 1} completed={step > 1} label="Vị trí" icon={<Briefcase className="w-4 h-4" />} />
          <div className={`h-0.5 w-12 md:w-16 transition-colors ${step > 1 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <StepItem num={2} active={step === 2} completed={step > 2} label="Yêu cầu" icon={<Award className="w-4 h-4" />} />
          <div className={`h-0.5 w-12 md:w-16 transition-colors ${step > 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <StepItem num={3} active={step === 3} completed={step > 3} label="Địa điểm" icon={<MapPin className="w-4 h-4" />} />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="h-2 hero-gradient w-full"></div>
          
          <div className="p-6 md:p-8 flex-grow">
            {message && (
              <div className="mb-6 p-4 rounded-xl text-center bg-blue-50 text-blue-800 border border-blue-200 text-sm font-semibold">
                {message}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-primary w-5 h-5" />
                  Bước 1: Vị trí chuyên môn
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nhóm ngành nghề *</label>
                    <select 
                      value={formData.careerGroup}
                      onChange={(e) => setFormData(prev => ({ ...prev, careerGroup: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      <option value="1">Công nghệ thông tin / Phần mềm</option>
                      <option value="2">Marketing / Truyền thông</option>
                      <option value="3">Kinh doanh / Bán hàng</option>
                      <option value="4">Tài chính / Kế toán</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngành nghề cụ thể *</label>
                    <select 
                      value={formData.career}
                      onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      <option value="1">Phát triển phần mềm</option>
                      <option value="2">Quản trị mạng & Bảo mật</option>
                      <option value="3">Kiểm thử phần mềm (QA/QC)</option>
                      <option value="4">Data Science & AI</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên vị trí mong muốn (Vị trí chuyên môn) *</label>
                  <input 
                    type="text" 
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Ví dụ: Senior Frontend Developer, QA Engineer..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm" 
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="text-primary w-5 h-5" />
                  Bước 2: Cấp bậc & Thu nhập mong muốn
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mức kinh nghiệm *</label>
                    <select 
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      <option value="1">Chưa có kinh nghiệm</option>
                      <option value="2">1 - 3 năm kinh nghiệm</option>
                      <option value="3">3 - 5 năm kinh nghiệm</option>
                      <option value="4">Trên 5 năm kinh nghiệm</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Cấp bậc mong muốn *</label>
                    <select 
                      value={formData.jobLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobLevel: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      <option value="1">Thực tập sinh (Intern)</option>
                      <option value="2">Nhân viên (Fresher/Junior)</option>
                      <option value="3">Chuyên viên (Senior)</option>
                      <option value="4">Trưởng nhóm (Team Leader)</option>
                      <option value="5">Trưởng phòng / Giám đốc</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Khoảng lương mong muốn (Triệu VND) *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-slate-400">Từ</span>
                      <input 
                        type="number" 
                        value={formData.salaryMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                        placeholder="0" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm font-semibold" 
                      />
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-bold text-slate-400">Đến</span>
                      <input 
                        type="number" 
                        value={formData.salaryMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                        placeholder="Không giới hạn" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary transition-all text-sm font-semibold" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="text-primary w-5 h-5" />
                  Bước 3: Địa điểm ưu tiên
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tỉnh/Thành phố làm việc ưu tiên *</label>
                    <select 
                      value={formData.preferredProvince}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredProvince: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary transition-all text-sm"
                    >
                      {VIETNAM_PROVINCES.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group pt-4">
                    <input 
                      type="checkbox" 
                      checked={formData.relocate}
                      onChange={(e) => setFormData(prev => ({ ...prev, relocate: e.target.checked }))}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" 
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      Sẵn sàng thay đổi địa điểm làm việc/đi công tác xa nếu có cơ hội phù hợp
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={prevStep}
              className={`text-sm font-semibold text-slate-600 hover:text-primary transition-colors flex items-center gap-2 ${step === 1 ? 'invisible' : 'visible'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="flex gap-4">
              {step === totalSteps && (
                <button 
                  onClick={() => navigate('/')} 
                  className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Bỏ qua
                </button>
              )}
              <button 
                onClick={step === totalSteps ? handleSave : nextStep}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {step === totalSteps ? 'Hoàn thành' : 'Tiếp tục'}
                {step !== totalSteps && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs">
          © 2026 VietWorks - Nền tảng kết nối cơ hội sự nghiệp hàng đầu Việt Nam.
        </p>
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
