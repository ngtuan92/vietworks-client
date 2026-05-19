

const ProfileStrength = () => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-sm">
      <h3 className="font-headline-md text-headline-md mb-stack-md">Độ Mạnh Hồ Sơ</h3>
      <div className="flex items-center gap-stack-lg mb-stack-lg">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-surface-container-high" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" stroke-width="8"></circle>
            <circle className="text-primary" cx="40" cy="40" fill="transparent" r="36" stroke="currentColor" stroke-dasharray="226.19" stroke-dashoffset="56.5" stroke-width="8"></circle>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-bold text-headline-md">75%</span>
        </div>
        <div>
          <p className="text-on-surface-variant font-body-sm">Xuất sắc!</p>
          <p className="font-bold text-primary">Hiển thị tốt</p>
        </div>
      </div>
      <div className="space-y-stack-md">
        <div className="flex items-start gap-stack-sm p-stack-md bg-tertiary-fixed rounded-lg border border-tertiary-container/20">
          <span className="material-symbols-outlined text-tertiary">tips_and_updates</span>
          <div>
            <p className="font-bold text-on-tertiary-fixed text-body-sm">Cải thiện nhanh</p>
            <p className="text-on-tertiary-fixed-variant text-body-sm">Thêm ảnh đại diện chuyên nghiệp để tăng 3x lượt xem.</p>
            <button className="text-primary font-bold text-body-sm mt-stack-sm hover:underline">Sửa ngay</button>
          </div>
        </div>
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-on-surface-variant">Học vấn</span>
          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-on-surface-variant">Kinh nghiệm làm việc</span>
          <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-on-surface-variant">Chứng chỉ</span>
          <button className="text-primary font-bold hover:underline">Thêm</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStrength;
