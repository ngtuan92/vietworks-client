

const CompanyCard = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h2 className="font-headline-md text-headline-md mb-6">Về TechVision Solutions</h2>
      <p className="text-on-surface-variant font-body-md text-body-md mb-6">TechVision là công ty tư vấn công nghệ hàng đầu, chuyên về chuyển đổi số cho các dịch vụ tài chính quốc tế. Với hơn 500 nhân viên trải rộng 3 quốc gia, chúng tôi ưu tiên đổi mới và cân bằng công việc - cuộc sống.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Quy mô</p>
          <p className="font-bold text-on-surface">500 - 1000</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Ngành</p>
          <p className="font-bold text-on-surface">Công nghệ / IT</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Địa điểm</p>
          <p className="font-bold text-on-surface">Quận 1, HCM</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Giờ làm việc</p>
          <p className="font-bold text-on-surface">Thứ 2 - Thứ 6</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
