export const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description ? <p className="mt-1 text-slate-600">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);

export const SectionCard = ({ title, description, right, children, className = '' }) => (
  <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {(title || description || right) && (
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const StatCard = ({ label, value, tone = 'blue', note }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    violet: 'bg-violet-50 text-violet-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{label}</div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
      {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
    </div>
  );
};

export const InputField = ({ label, required, type = 'text', value, onChange, placeholder = '' }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#0056b3]" />
  </div>
);

export const SelectField = ({ label, required, value, onChange, options = [], placeholder = 'Tat ca' }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <select value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0056b3]">
      <option value="">{placeholder}</option>
      {options.map((option) => Array.isArray(option) ? <option key={option[0]} value={option[0]}>{option[1]}</option> : <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

export const TextAreaField = ({ label, required, value, onChange, placeholder = '', rows = 5 }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    <textarea rows={rows} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#0056b3]" />
  </div>
);

export const StatusBadge = ({ value, map = {} }) => {
  const tone = map[value] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
};

export const ActionButton = ({ children, tone = 'default', className = '', ...props }) => {
  const tones = {
    default: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300',
    primary: 'bg-[#0056b3] text-white hover:bg-[#004494]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    soft: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  };

  return <button {...props} className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${tones[tone]} ${className}`}>{children}</button>;
};

export const SimpleTable = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 text-left font-semibold">{header}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const FilterGrid = ({ children }) => <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>;

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => (
      <button key={tab} onClick={() => onChange(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active === tab ? 'bg-[#0056b3] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
        {tab}
      </button>
    ))}
  </div>
);

export const ModalShell = ({ title, children, onClose, footer }) => (
  <div className="fixed inset-0 z-[70] bg-slate-950/40 px-4 py-10">
    <div className="mx-auto max-w-2xl rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
      {footer ? <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div> : null}
    </div>
  </div>
);
