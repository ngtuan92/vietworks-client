

const JobDetailHeader = () => {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 mb-stack-lg shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-24 h-24 bg-surface rounded-lg border border-outline-variant p-2 flex items-center justify-center shrink-0">
          <img 
            alt="Company Logo" 
            className="max-w-full" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1xfDr5_sTnuGRX163OIYm03SOVusydKAEiJoafu_4jjmSgOcxIGZK3MVYveXV4aq8cX63d7mfmpNzUyuUgLPkLWRGCPaXyUigw2SDpanPL-1Io2BV0wvA4FxW_DQ12GC4QuS3PO-tgNr6xEUsgqXl60AMWoyVbRYEgVSVk5FMIl_EAmf6C1INPrj6-UfYxXAhEVMVPIV0v3b4238qM4-9RThOLiGVnFCtt6e47hQrVg2AlngPvRp22EoiteWIpg1e468yi5kZ-mHH"
          />
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-md">Mới</span>
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-label-md">Nhà tuyển dụng Xác minh</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Senior Full Stack Developer (React/Node.js)</h1>
          <p className="font-headline-md text-headline-md text-primary mb-4">TechVision Solutions Vietnam</p>
          <div className="flex flex-wrap gap-6 text-on-surface-variant font-body-sm text-body-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span className="font-semibold text-primary">$2,500 - $3,500</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              <span>Thành phố Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <span>Đăng 2 ngày trước</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button className="w-full md:w-48 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg active:scale-95 transition-all text-body-md">Ứng Tuyển Ngay</button>
          <button className="w-full md:w-48 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary-fixed transition-all text-body-md flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">bookmark</span>
            Lưu Việc Làm
          </button>
        </div>
      </div>
    </section>
  );
};

export default JobDetailHeader;
