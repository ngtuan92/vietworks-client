import { X } from 'lucide-react';

const fieldLabelClass = 'mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500';
const fieldInputClass = 'vw-input min-h-12 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400';
const fieldSelectClass = 'vw-input h-12 appearance-none cursor-pointer rounded-2xl px-4 pr-10 text-sm font-semibold text-slate-800';
const fieldTextAreaClass = 'vw-input min-h-36 rounded-2xl px-4 py-3 text-sm leading-6 text-slate-800 placeholder:text-slate-400 resize-y';

export const PageHeader = ({ title, description, actions }) => (
  <div className="relative overflow-hidden rounded-[1.7rem] border border-white/75 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,.08)] backdrop-blur-2xl animate-rise-in md:p-6">
    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/25 blur-3xl" />
    <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#0056B3] ring-1 ring-blue-100">
          VietWorks Admin
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[2rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  </div>
);

export const SectionCard = ({ title, description, right, children, className = '' }) => (
  <section className={`vw-card overflow-hidden rounded-[1.6rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow ${className}`}>
    {(title || description || right) && (
      <div className="flex flex-col gap-3 border-b border-slate-100/80 bg-gradient-to-r from-blue-50/60 to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title ? <h2 className="text-[15px] font-black tracking-tight text-slate-950 md:text-base">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
    )}
    <div className="p-5 md:p-6">{children}</div>
  </section>
);

export const StatCard = ({ label, value, tone = 'blue', note, icon }) => {
  const tones = {
    blue: 'from-blue-50 to-white text-[#0056B3] border-blue-200/70',
    blueSoft: 'from-blue-50 to-white text-blue-700 border-blue-200/70',
    blueMid: 'from-blue-50 to-white text-blue-800 border-blue-200/70',
    blueDark: 'from-blue-50 to-white text-[#001a40] border-blue-200/70',
    blueAlt: 'from-blue-50 to-white text-[#004491] border-blue-200/70',
  };

  const badgeTones = {
    blue: 'bg-blue-600/10 text-[#0056B3]',
    blueSoft: 'bg-blue-600/10 text-blue-700',
    blueMid: 'bg-blue-600/10 text-blue-800',
    blueDark: 'bg-blue-600/10 text-[#001a40]',
    blueAlt: 'bg-blue-600/10 text-[#004491]',
  };

  const toneClass = tones[tone] || tones.blue;
  const badgeClass = badgeTones[tone] || badgeTones.blue;

  return (
    <div className={`group relative overflow-hidden rounded-[1.65rem] border bg-gradient-to-br p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${toneClass}`}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-current opacity-10 blur-3xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${badgeClass}`}>{label}</div>
          <div className="mt-4 text-4xl font-black tracking-tight text-slate-950 transition-transform origin-left group-hover:scale-105">{value}</div>
          {note ? <p className="mt-2 text-sm font-semibold text-slate-500">{note}</p> : null}
        </div>
        {icon && (
          <div className={`rounded-2xl bg-white/80 p-3 shadow-insetLight ${badgeClass}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export const InputField = ({ label, required, type = 'text', value, onChange, placeholder = '' }) => (
  <div className="space-y-1.5">
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-[#0056B3]">*</span> : null}
    </label>
    <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className={fieldInputClass} />
  </div>
);

export const SelectField = ({ label, required, value, onChange, options = [], placeholder = 'Tất cả' }) => (
  <div className="space-y-1.5">
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-[#0056B3]">*</span> : null}
    </label>
    <div className="relative">
      <select value={value} onChange={(e) => onChange?.(e.target.value)} className={fieldSelectClass}>
        <option value="">{placeholder}</option>
        {options.map((option) => Array.isArray(option) ? <option key={option[0]} value={option[0]}>{option[1]}</option> : <option key={option} value={option}>{option}</option>)}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
    </div>
  </div>
);

export const TextAreaField = ({ label, required, value, onChange, placeholder = '', rows = 5 }) => (
  <div className="space-y-1.5">
    <label className={fieldLabelClass}>
      {label} {required ? <span className="text-[#0056B3]">*</span> : null}
    </label>
    <textarea rows={rows} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className={fieldTextAreaClass} />
  </div>
);

export const StatusBadge = ({ value, map = {} }) => {
  const tone = map[value] || 'bg-blue-50 text-[#0056B3] ring-blue-100';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${tone}`}>{value}</span>;
};

export const ActionButton = ({ children, tone = 'default', className = '', ...props }) => {
  const tones = {
    default: 'border border-slate-200 bg-white/86 text-slate-700 hover:bg-blue-50 hover:text-[#0056B3] shadow-sm',
    primary: 'bg-[#0056B3] text-white hover:bg-[#004491] shadow-glow',
    danger: 'bg-[#001a40] text-white hover:bg-[#004491] shadow-sm',
    soft: 'bg-blue-50 text-[#0056B3] hover:bg-blue-100 ring-1 ring-blue-100',
  };

  return <button {...props} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-black transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${tones[tone]} ${className}`}>{children}</button>;
};

export const SimpleTable = ({ headers, children }) => (
  <div className="overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white/86 shadow-soft backdrop-blur-xl">
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-100 bg-blue-50/70 text-left text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-5 py-4 text-xs font-black uppercase tracking-wider">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-blue-50/45">{children}</tbody>
      </table>
    </div>
  </div>
);

export const FilterGrid = ({ children }) => (
  <div className="vw-card grid grid-cols-1 gap-3 rounded-[1.6rem] p-4 md:grid-cols-2 xl:grid-cols-4">
    {children}
  </div>
);

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200/70 bg-white/72 p-1.5 shadow-sm backdrop-blur-xl">
    {tabs.map((tab) => (
      <button key={tab} onClick={() => onChange(tab)} className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all cursor-pointer ${active === tab ? 'bg-[#0056B3] text-white shadow-glow' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0056B3]'}`}>
        {tab}
      </button>
    ))}
  </div>
);

export const ModalShell = ({ title, children, onClose, footer }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-10 backdrop-blur-sm">
    <div className="w-full max-w-2xl overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/95 shadow-lift backdrop-blur-2xl animate-rise-in">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
        <h3 className="text-sm font-black tracking-tight text-slate-950 md:text-base">{title}</h3>
        <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#0056B3] cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">{children}</div>
      {footer ? <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4">{footer}</div> : null}
    </div>
  </div>
);

