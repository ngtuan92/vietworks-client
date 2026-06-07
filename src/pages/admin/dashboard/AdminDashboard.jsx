import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

const userGrowth = [28, 36, 34, 48, 55, 62, 74, 83, 91, 105, 118, 132];
const jobApproval = [
  { label: 'Đã duyệt', value: 68, color: '#0056B3' },
  { label: 'Chờ duyệt', value: 22, color: '#0b6bdc' },
  { label: 'Từ chối', value: 10, color: '#93c5fd' },
];

const queueItems = [
  { id: 'JOB-2481', title: 'Senior Backend Engineer', owner: 'TechNova Solutions', type: 'Tin tuyển dụng', priority: 'Cao', status: 'Chờ duyệt', time: '12 phút trước' },
  { id: 'COM-1022', title: 'FinTrust Group', owner: 'Mã số thuế: 0319***', type: 'Hồ sơ công ty', priority: 'Trung bình', status: 'Cần xác minh', time: '28 phút trước' },
  { id: 'JOB-2478', title: 'Product Designer UI/UX', owner: 'BrightSide Creative', type: 'Tin tuyển dụng', priority: 'Cao', status: 'Chờ duyệt', time: '42 phút trước' },
  { id: 'REP-0881', title: 'Báo cáo tin nghi ngờ', owner: 'Ứng viên ẩn danh', type: 'Vi phạm', priority: 'Khẩn cấp', status: 'Cảnh báo', time: '1 giờ trước' },
];

const stats = [
  { label: 'Người dùng', value: '15,240', note: '+12.8% tháng này', icon: Users, tone: 'blue' },
  { label: 'Job chờ duyệt', value: '45', note: '18 tin ưu tiên cao', icon: FileText, tone: 'sky' },
  { label: 'Công ty chờ duyệt', value: '12', note: 'Cần xác minh pháp lý', icon: Building2, tone: 'navy' },
  { label: 'Vi phạm mới', value: '5', note: '7 ngày gần nhất', icon: AlertTriangle, tone: 'blueDark' },
];

const quickLinks = [
  { to: '/admin/jobs', icon: FileText, title: 'Kiểm duyệt tin tuyển dụng', description: '45 tin đang chờ xử lý', tone: 'sky' },
  { to: '/admin/companies', icon: Building2, title: 'Xác minh công ty', description: '12 hồ sơ cần đối chiếu', tone: 'navy' },
  { to: '/admin/users', icon: Users, title: 'Quản lý tài khoản', description: 'Lọc theo vai trò và rủi ro', tone: 'blue' },
  { to: '/admin/violations', icon: ShieldCheck, title: 'Trung tâm vi phạm', description: 'Theo dõi cảnh báo hệ thống', tone: 'blueDark' },
];

const toneClass = {
  blue: 'from-blue-50 to-white text-[#0056B3] border-blue-200/70 bg-blue-50',
  sky: 'from-blue-50 to-white text-blue-700 border-blue-200/70 bg-blue-50',
  navy: 'from-blue-50 to-white text-[#004491] border-blue-200/70 bg-blue-50',
  blueDark: 'from-blue-50 to-white text-[#001a40] border-blue-200/70 bg-blue-50',
  blueSoft: 'from-blue-50 to-white text-[#0056B3] border-blue-200/70 bg-blue-50',
};

const AdminDashboard = () => {
  return (
    <div className="space-y-7 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#001a40] via-[#004491] to-[#0056B3] p-6 text-white shadow-glow lg:p-8 vw-tech-grid">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-blue-100" />
              VietWorks Admin Command Center
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Tổng quan hệ thống
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50/90 sm:text-base">
              Theo dõi người dùng, hàng chờ kiểm duyệt, tỷ lệ duyệt tin và các cảnh báo vận hành trong một giao diện quản trị hiện đại, rõ ràng và đáng tin cậy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-extrabold text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/18">
              Hôm nay
            </button>
            <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#0056B3] shadow-soft transition hover:scale-105">
              Xuất báo cáo
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_.9fr]">
        <Panel
          title="Tăng trưởng người dùng"
          description="Biểu đồ vùng gradient theo 12 tháng gần nhất."
          action={<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">+18.4%</span>}
        >
          <AreaChart values={userGrowth} />
        </Panel>

        <Panel
          title="Tỷ lệ duyệt tin"
          description="Tổng hợp trạng thái kiểm duyệt job."
          action={<Link to="/admin/jobs" className="text-xs font-black text-[#0056B3] hover:underline">Chi tiết</Link>}
        >
          <DonutChart data={jobApproval} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.3fr]">
        <Panel title="Lối tắt xử lý" description="Đi thẳng tới các khu vực quản trị trọng yếu.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickLinks.map((item) => (
              <QuickLink key={item.to} {...item} />
            ))}
          </div>
        </Panel>

        <Panel
          title="Hàng chờ cần xử lý"
          description="Danh sách ưu tiên cao với status badge rõ ràng."
          action={<Link to="/admin/jobs" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-50">Xem tất cả</Link>}
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="grid grid-cols-[1.1fr_.8fr_.7fr_.6fr] gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500 max-lg:hidden">
              <span>Đối tượng</span>
              <span>Phân loại</span>
              <span>Ưu tiên</span>
              <span>Trạng thái</span>
            </div>
            <div className="divide-y divide-slate-100">
              {queueItems.map((item) => (
                <QueueRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
};

const MetricCard = ({ label, value, note, icon: Icon, tone }) => (
  <article className={`group relative overflow-hidden rounded-[1.7rem] border bg-gradient-to-br p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${toneClass[tone]}`}>
    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-current opacity-10 blur-2xl transition-transform group-hover:scale-150" />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] opacity-75">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 text-sm font-bold text-slate-500">{note}</p>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/78 shadow-insetLight">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </article>
);

const Panel = ({ title, description, action, children }) => (
  <section className="vw-card rounded-[1.8rem] p-5 lg:p-6">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
    {children}
  </section>
);

const AreaChart = ({ values }) => {
  const width = 760;
  const height = 260;
  const padding = 22;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return [x, y];
  });
  const linePath = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/80 to-white p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0056B3" stopOpacity="0.36" />
            <stop offset="55%" stopColor="#0b6bdc" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0056B3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0056B3" />
            <stop offset="100%" stopColor="#0b6bdc" />
          </linearGradient>
          <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0, 1, 2, 3].map((row) => (
          <line key={row} x1="22" x2="738" y1={padding + row * 58} y2={padding + row * 58} stroke="#cbd5e1" strokeDasharray="5 8" strokeOpacity="0.55" />
        ))}
        <path d={areaPath} fill="url(#areaGradient)" className="animate-rise-in" />
        <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#chartGlow)" style={{ strokeDasharray: 1200, strokeDashoffset: 0 }} />
        {points.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r="5" fill="#ffffff" stroke={index === points.length - 1 ? '#0b6bdc' : '#0056B3'} strokeWidth="3" />
        ))}
      </svg>
      <div className="absolute right-5 top-5 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur-md">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Tháng này</p>
        <p className="text-2xl font-black text-[#0056B3]">+1,320</p>
      </div>
    </div>
  );
};

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-slate-50 to-white p-5 sm:flex-row sm:justify-center">
      <div className="relative h-56 w-56">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 drop-shadow-lg">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="22" />
          {data.map((item) => {
            const dash = (item.value / total) * circumference;
            const segment = (
              <circle
                key={item.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-4xl font-black text-slate-950">{data[0].value}%</p>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Đã duyệt</p>
          </div>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <span className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-950">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuickLink = ({ to, icon: Icon, title, description, tone }) => (
  <Link to={to} className={`group flex items-start gap-3 rounded-3xl border bg-gradient-to-br p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${toneClass[tone]}`}>
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 shadow-insetLight transition-transform group-hover:scale-110">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="font-black text-slate-950">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
    </div>
    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
  </Link>
);

const QueueRow = ({ item }) => (
  <div className="grid gap-3 px-5 py-4 transition hover:bg-blue-50/40 lg:grid-cols-[1.1fr_.8fr_.7fr_.6fr] lg:items-center">
    <div>
      <p className="text-sm font-black text-slate-950">{item.title}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{item.id} · {item.owner} · {item.time}</p>
    </div>
    <span className="text-sm font-extrabold text-slate-600">{item.type}</span>
    <PriorityBadge value={item.priority} />
    <StatusBadge value={item.status} />
  </div>
);

const PriorityBadge = ({ value }) => {
  const classes = {
    'Khẩn cấp': 'bg-blue-100 text-blue-800 ring-blue-200',
    Cao: 'bg-blue-100 text-blue-800 ring-blue-200',
    'Trung bình': 'bg-blue-100 text-blue-700 ring-blue-200',
  };
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${classes[value] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{value}</span>;
};

const StatusBadge = ({ value }) => {
  const classes = {
    'Chờ duyệt': 'bg-blue-50 text-blue-800 ring-blue-200',
    'Cần xác minh': 'bg-blue-50 text-blue-800 ring-blue-200',
    'Cảnh báo': 'bg-blue-50 text-blue-800 ring-blue-200',
  };
  const Icon = value === 'Cảnh báo' ? AlertTriangle : value === 'Cần xác minh' ? Clock3 : CheckCircle2;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ${classes[value] || 'bg-slate-50 text-slate-700 ring-slate-200'}`}>
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  );
};

export default AdminDashboard;






