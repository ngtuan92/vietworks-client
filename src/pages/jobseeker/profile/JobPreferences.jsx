import { useState  } from 'react';
const JobPreferences = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-surface antialiased">
      <main className="w-full max-w-[800px] flex flex-col gap-8">
        
        {/* Simplified Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-display-lg text-primary mb-2">
            Mô tả công việc mong muốn
          </h1>
          <p className="text-on-surface-variant text-body-md">
            Chúng tôi sẽ gợi ý cơ hội dựa trên lộ trình sự nghiệp của bạn.
          </p>
        </div>

        {/* Stepper Roadmap */}
        <div className="flex items-center justify-center gap-4 px-4">
          <StepItem num={1} active={step === 1} completed={step > 1} label="Vị trí" />
          <div className={`h-px w-12 md:w-20 transition-colors ${step > 1 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
          <StepItem num={2} active={step === 2} completed={step > 2} label="Kinh nghiệm" />
          <div className={`h-px w-12 md:w-20 transition-colors ${step > 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
          <StepItem num={3} active={step === 3} completed={step > 3} label="Địa điểm" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden min-h-[380px] flex flex-col">
          <div className="h-1.5 bg-primary w-full"></div>
          
          <div className="p-8 md:p-10 flex-grow">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-headline-md text-primary">Bước 1: Vị trí chuyên môn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-label-md text-on-surface">Vị trí chính *</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 outline-none focus:border-primary transition-all">
                      <option value="">Chọn từ danh mục</option>
                      <option value="1">Kỹ sư phần mềm</option>
                      <option value="2">Thiết kế UI/UX</option>
                      <option value="3">Quản lý dự án</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label-md text-on-surface">Vị trí khác</label>
                    <input type="text" placeholder="Nhập tên vị trí chuyên môn" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 outline-none focus:border-primary transition-all" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-headline-md text-primary">Bước 2: Kinh nghiệm & Thu nhập</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-label-md text-on-surface">Mức lương mong muốn *</label>
                    <div className="relative flex items-center">
                      <input type="number" placeholder="0" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 pr-16 outline-none focus:border-primary transition-all" />
                      <span className="absolute right-4 text-xs text-on-surface-variant">VND</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label-md text-on-surface">Cấp bậc *</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 outline-none focus:border-primary transition-all">
                      <option value="">Chọn kinh nghiệm</option>
                      <option value="1">Chưa có kinh nghiệm</option>
                      <option value="2">1-3 năm</option>
                      <option value="3">3-5 năm</option>
                      <option value="4">Trên 5 năm</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-headline-md text-primary">Bước 3: Địa điểm & Sẵn sàng</h2>
                <div className="space-y-6">
                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-label-md text-on-surface">Địa điểm làm việc ưu tiên *</label>
                    <input type="text" placeholder="Chọn địa điểm" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-4 outline-none focus:border-primary transition-all" />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer group pt-2">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      Sẵn sàng thay đổi địa điểm làm việc nếu có cơ hội phù hợp
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
            <button 
              onClick={prevStep}
              className={`text-sm font-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 ${step === 1 ? 'invisible' : 'visible'}`}
            >
              <span className="material-symbols-outlined text-lg">west</span> Quay lại
            </button>
            <div className="flex gap-4">
              {step === totalSteps && (
                <button className="hidden sm:block text-sm font-label-md text-on-surface-variant hover:text-on-surface transition-colors">
                  Hoàn thiện sau
                </button>
              )}
              <button 
                onClick={step === totalSteps ? undefined : nextStep}
                className="px-10 py-2.5 bg-primary text-white rounded-lg text-sm font-label-md hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
              >
                {step === totalSteps ? 'Hoàn thành' : 'Tiếp tục'}
                {step !== totalSteps && <span className="material-symbols-outlined text-lg">east</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <p className="text-center text-on-surface-variant/60 text-xs">
          © 2024 VietWorks. Hệ thống kết nối nhân tài hàng đầu Việt Nam.
        </p>
      </main>
    </div>
  );
};

const StepItem = ({ num, active, completed, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
      active ? 'bg-primary text-white scale-110 shadow-lg' : 
      completed ? 'bg-primary/20 text-primary' : 'bg-surface-container border border-outline-variant text-on-surface-variant'
    }`}>
      {completed ? <span className="material-symbols-outlined text-sm">check</span> : num}
    </div>
    <span className={`text-[10px] md:text-xs font-label-md uppercase tracking-wide transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
      {label}
    </span>
  </div>
);

export default JobPreferences;
