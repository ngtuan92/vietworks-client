import { X } from 'lucide-react';

const fieldLabelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500';
const fieldInputClass = 'w-full min-h-[44px] rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none';
const fieldSelectClass = 'w-full h-[44px] appearance-none cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 pr-10 text-sm font-semibold text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none';
const fieldTextAreaClass = 'w-full min-h-[120px] rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none resize-y';

export const PageHeader = ({ title, description, actions }) => (
  <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm md:p-8">
    <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl" />
    <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center rounded-full bg-slate-50 border border-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          VietWorks Admin
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-500 font-medium">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  </div>
);

export const SectionCard = ({ title, description, right, children, className = '' }) => (
  <section className={`bg-white rounded-[2rem] border border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
    {(title || description || right) && (
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/30 px-6 py-5 lg:flex-row lg:items-center lg:justify-between rounded-t-[2rem]">
        <div>
          {title ? <h2 className="text-base font-black tracking-tight text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
    )}
    <div className="p-6">{children}</div>
  </section>
);

export const StatCard = ({ label, value, tone = 'blue', note, icon }) => {
  const tones = {
    blue: 'bg-blue-50/50 text-blue-600',
    emerald: 'bg-emerald-50/50 text-emerald-600',
    amber: 'bg-amber-50/50 text-amber-600',
    indigo: 'bg-indigo-50/50 text-indigo-600',
    rose: 'bg-rose-50/50 text-rose-600',
  };

  const toneClass = tones[tone] || tones.blue;

  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <div className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
            {value}
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white ${toneClass}`}>
            {icon}
          </div>
        )}
      </div>
      {note && <p className="text-xs font-bold text-slate-500 mt-2">{note}</p>}
    </div>
  );
};

export const InputField = ({ label, required, type = 'text', value, onChange, placeholder = '' }) => (
  <div>
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className={fieldInputClass} />
  </div>
);

export const SelectField = ({ label, required, value, onChange, options = [], placeholder = 'Tất cả' }) => (
  <div>
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <div className="relative">
      <select value={value} onChange={(e) => onChange?.(e.target.value)} className={fieldSelectClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => Array.isArray(option) ? <option key={option[0]} value={option[0]}>{option[1]}</option> : <option key={option} value={option}>{option}</option>)}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </span>
    </div>
  </div>
);

export const TextAreaField = ({ label, required, value, onChange, placeholder = '', rows = 5 }) => (
  <div>
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <textarea rows={rows} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className={fieldTextAreaClass} />
  </div>
);

export const StatusBadge = ({ value, map = {} }) => {
  const defaultMap = {
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'PUBLISHED': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'BANNED': 'bg-red-50 text-red-700 border-red-200/60',
    'CLOSED': 'bg-slate-50 text-slate-700 border-slate-200',
    'DRAFT': 'bg-slate-50 text-slate-700 border-slate-200',
    'EXPIRED': 'bg-rose-50 text-rose-700 border-rose-200/60',
    'ACTIVE': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'INACTIVE': 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const labelMap = {
    'PENDING': 'ĐANG CHỜ',
    'PUBLISHED': 'ĐÃ DUYỆT',
    'BANNED': 'BỊ KHÓA',
    'CLOSED': 'ĐÃ ĐÓNG',
    'DRAFT': 'BẢN NHÁP',
    'EXPIRED': 'HẾT HẠN',
    'ACTIVE': 'HOẠT ĐỘNG',
    'INACTIVE': 'ĐÃ TẮT',
    'VERIFIED': 'ĐÃ XÁC MINH',
    'REJECTED': 'ĐÃ TỪ CHỐI',
    'SUCCESS': 'THÀNH CÔNG',
    'FAILED': 'THẤT BẠI'
  };

  const tone = map[value] || defaultMap[value] || 'bg-blue-50 text-blue-700 border-blue-200/60';
  const displayLabel = labelMap[value] || value;
  
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>{displayLabel}</span>;
};

export const ActionButton = ({ children, tone = 'default', className = '', ...props }) => {
  const tones = {
    default: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
    primary: 'bg-primary text-white hover:bg-blue-700 shadow-sm',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    soft: 'bg-blue-50 text-primary hover:bg-blue-100 border border-blue-100',
  };

  return <button {...props} className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${tones[tone]} ${className}`}>{children}</button>;
};

export const SimpleTable = ({ headers, children }) => (
  <div className="overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-sm">
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-100 bg-slate-50/50 text-left text-slate-400">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-6 py-4 text-[11px] font-bold uppercase tracking-wider">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-50 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/80">{children}</tbody>
      </table>
    </div>
  </div>
);

export const FilterGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {children}
  </div>
);

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-1.5 shadow-sm w-fit">
    {tabs.map((tab) => (
      <button key={tab} onClick={() => onChange(tab)} className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${active === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}>
        {tab}
      </button>
    ))}
  </div>
);

export const ModalShell = ({ title, children, onClose, footer }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur-sm">
    <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-xl animate-rise-in">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <h3 className="text-base font-black tracking-tight text-slate-900">{title}</h3>
        <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto px-6 py-6">{children}</div>
      {footer ? <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">{footer}</div> : null}
    </div>
  </div>
);
