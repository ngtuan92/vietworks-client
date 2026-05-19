

const RelatedJobsSidebar = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h3 className="font-headline-md text-headline-md mb-6">Việc Làm Liên Quan</h3>
      <div className="space-y-4">
        {/* Job Item */}
        <a className="block p-4 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all" href="#">
          <h4 className="font-bold text-on-surface font-body-md mb-1 line-clamp-1">Quản lý Sản phẩm</h4>
          <p className="text-primary font-body-sm text-body-sm mb-2">Global FinTech Ltd.</p>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>$2,000 - $4,000</span>
            <span className="text-outline">Quận 7</span>
          </div>
        </a>
        {/* Job Item */}
        <a className="block p-4 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all" href="#">
          <h4 className="font-bold text-on-surface font-body-md mb-1 line-clamp-1">Kỹ sư React Lead</h4>
          <p className="text-primary font-body-sm text-body-sm mb-2">Creative Studio HCM</p>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>Thỏa thuận</span>
            <span className="text-outline">Làm từ xa</span>
          </div>
        </a>
        {/* Job Item */}
        <a className="block p-4 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all" href="#">
          <h4 className="font-bold text-on-surface font-body-md mb-1 line-clamp-1">Thiết kế UI/UX</h4>
          <p className="text-primary font-body-sm text-body-sm mb-2">Innovate Solutions</p>
          <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
            <span>$1,500 - $2,500</span>
            <span className="text-outline">Quận 3</span>
          </div>
        </a>
      </div>
      <button className="w-full mt-6 py-2 text-primary font-bold text-label-md border-t border-outline-variant pt-4 flex justify-center items-center gap-1 hover:gap-3 transition-all">
        Xem Thêm Việc Làm
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
};

export default RelatedJobsSidebar;
