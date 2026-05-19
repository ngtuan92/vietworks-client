

const JobInfoSidebar = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h3 className="font-headline-md text-headline-md mb-6">Thông Tin Việc Làm</h3>
      <div className="space-y-6">
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">military_tech</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Kinh nghiệm</p>
            <p className="font-semibold text-on-surface font-body-md">5+ Năm</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">signal_cellular_alt</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Cấp bậc</p>
            <p className="font-semibold text-on-surface font-body-md">Senior Manager / Lead</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">group</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Số lượng tuyển</p>
            <p className="font-semibold text-on-surface font-body-md">02 vị trí</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">work</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Loại hình</p>
            <p className="font-semibold text-on-surface font-body-md">Toàn thời gian</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">alarm_on</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Hạn nộp hồ sơ</p>
            <p className="font-semibold text-error font-body-md">25/11/2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfoSidebar;
