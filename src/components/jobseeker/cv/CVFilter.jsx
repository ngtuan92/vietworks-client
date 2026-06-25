
import { Info } from 'lucide-react';


const CVFilter = ({ currentFilter = 'all', onFilterChange, counts = { all: 0, active: 0, draft: 0 } }) => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-wrap items-center justify-between gap-stack-md">
      <div className="flex gap-stack-md">
        <button
          onClick={() => onFilterChange?.('all')}
          className={`px-stack-lg py-stack-sm rounded-full font-label-md cursor-pointer transition-colors ${currentFilter === 'all'
            ? 'bg-primary-fixed text-on-primary-fixed'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
        >
          Tất cả ({counts.all})
        </button>
        <button
          onClick={() => onFilterChange?.('active')}
          className={`px-stack-lg py-stack-sm rounded-full font-label-md cursor-pointer transition-colors ${currentFilter === 'active'
            ? 'bg-primary-fixed text-on-primary-fixed'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
        >
          Đang dùng ({counts.active})
        </button>
        <button
          onClick={() => onFilterChange?.('draft')}
          className={`px-stack-lg py-stack-sm rounded-full font-label-md cursor-pointer transition-colors ${currentFilter === 'draft'
            ? 'bg-primary-fixed text-on-primary-fixed'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
        >
          Bản nháp ({counts.draft})
        </button>
      </div>
      <div className="flex items-center gap-stack-sm text-on-surface-variant font-body-sm">
        <Info className="w-5 h-5" />
        <span>Tối đa 10 CV được phép</span>
      </div>
    </div>
  );
};

export default CVFilter;
