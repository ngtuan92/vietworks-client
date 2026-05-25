

const CVFilter = ({ totalCount = 0 }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-wrap items-center justify-between gap-stack-md">
      <div className="flex gap-stack-md">
        <button className="bg-primary-fixed text-on-primary-fixed px-stack-lg py-stack-sm rounded-full font-label-md">Tất cả ({totalCount})</button>
        <button className="bg-surface-container text-on-surface-variant px-stack-lg py-stack-sm rounded-full font-label-md hover:bg-surface-container-high">Đang dùng</button>
        <button className="bg-surface-container text-on-surface-variant px-stack-lg py-stack-sm rounded-full font-label-md hover:bg-surface-container-high">Bản nháp</button>
      </div>
      <div className="flex items-center gap-stack-sm text-on-surface-variant font-body-sm">
        <span className="material-symbols-outlined text-[18px]">info</span>
        <span>Tối đa 5 CV được phép</span>
      </div>
    </div>
  );
};

export default CVFilter;
