import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import adminCompanyVerificationService from '../../../services/adminCompanyVerificationService';
import jobAdminService from '../../../services/jobAdminService';
import {
  ArrowUpRight,
  BarChart2,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
  Activity,
  Loader2,
  Wallet
} from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState([]);
  const [jobApproval, setJobApproval] = useState([]);
  const [stats, setStats] = useState([]);
  const [queueItems, setQueueItems] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userData, jobData, pendingCompaniesRes, pendingJobsRes, revenueRes] = await Promise.all([
          adminService.getUserGrowth({ range: 'year' }),
          adminService.getJobAnalytics(),
          adminCompanyVerificationService.getPendingCompanies(),
          jobAdminService.getAllJobsPending({ page: 1, limit: 5 }),
          adminService.getRevenueReport({ range: 'year' })
        ]);

        const growthArray = userData?.growthData?.map(g => g.total) || [0,0,0,0,0,0,0,0,0,0,0,0];
        setUserGrowth(growthArray.length > 1 ? growthArray : [0, ...growthArray, 0]);

        const jobStatus = jobData?.summary?.byStatus || {};
        const totalJob = jobData?.summary?.totalJobs || 1; // prevent div by zero
        setJobApproval([
          { label: 'Đã duyệt', value: Math.round(((jobStatus.PUBLISHED || 0) / totalJob) * 100) || 0, color: '#3b82f6' },
          { label: 'Chờ duyệt', value: Math.round(((jobStatus.PENDING_APPROVAL || 0) / totalJob) * 100) || 0, color: '#f59e0b' },
          { label: 'Từ chối', value: Math.round(((jobStatus.REJECTED || 0) / totalJob) * 100) || 0, color: '#ef4444' },
        ]);

        const pendingJobsCount = jobStatus.PENDING_APPROVAL || 0;
        const pendingCompaniesCount = pendingCompaniesRes?.data?.length || 0;
        
        setStats([
          { label: 'Người dùng', value: userData?.summary?.totalUsers?.toLocaleString() || '0', note: 'Tổng số tài khoản hệ thống', icon: Users, badgeBg: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-500' },
          { label: 'Job chờ duyệt', value: pendingJobsCount.toString(), note: 'Cần kiểm duyệt ngay', icon: FileText, badgeBg: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-500' },
          { label: 'Công ty mới', value: pendingCompaniesCount.toString(), note: 'Cần xác minh pháp lý', icon: Building2, badgeBg: 'bg-indigo-50 border-indigo-100', iconColor: 'text-indigo-500' },
          { label: 'Tổng doanh thu', value: formatPrice(revenueRes?.summary?.totalRevenue || 0), note: 'Doanh thu năm nay', icon: Wallet, badgeBg: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-500' },
        ]);

        setRevenueStats(revenueRes?.monthlyData || []);

        const pendingJobs = pendingJobsRes?.data?.jobs || [];
        const pendingCompanies = pendingCompaniesRes?.data || [];
        
        const formatQueue = [];
        pendingJobs.slice(0, 3).forEach(job => {
          formatQueue.push({
            id: job._id.substring(0, 8).toUpperCase(),
            title: job.title,
            owner: job.companyId?.name || 'Unknown',
            type: 'Tin tuyển dụng',
            priority: job.isUrgent ? 'Khẩn cấp' : 'Trung bình',
            status: 'Chờ duyệt',
            time: new Date(job.createdAt).toLocaleDateString('vi-VN')
          });
        });
        
        pendingCompanies.slice(0, 3).forEach(comp => {
          formatQueue.push({
            id: comp._id.substring(0, 8).toUpperCase(),
            title: comp.name,
            owner: `MST: ${comp.taxCode || 'N/A'}`,
            type: 'Hồ sơ công ty',
            priority: 'Cao',
            status: 'Cần xác minh',
            time: new Date(comp.createdAt).toLocaleDateString('vi-VN')
          });
        });
        
        setQueueItems(formatQueue.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Premium SaaS Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-600 via-primary to-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-primary/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-colors duration-700"></div>
        <div className="absolute left-1/4 -bottom-24 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md mb-6">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Trung tâm điều hành
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Tổng quan hệ thống
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-blue-50/90 sm:text-base font-medium">
              Theo dõi biến động người dùng, hàng chờ kiểm duyệt và tỷ lệ chuyển đổi. Hệ thống đang hoạt động ổn định và bảo mật.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 xl:mt-0">
            <button className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:-translate-y-0.5">
              Hôm nay
            </button>
            <button className="rounded-xl bg-white px-6 py-3 text-sm font-black text-indigo-900 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20">
              Xuất báo cáo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid matching Employer Vibe */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Tăng trưởng người dùng"
          description="Biểu đồ người dùng đăng ký mới 12 tháng qua."
          action={<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600 flex items-center gap-1 border border-emerald-100"><TrendingUp className="w-3 h-3"/> +18.4%</span>}
        >
          <AreaChart values={userGrowth} />
        </Panel>

        <Panel
          title="Biến động Doanh thu"
          description="Tiền nạp và thanh toán trong 12 tháng qua."
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Nạp</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-indigo-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase">Thanh toán</span></div>
            </div>
          }
        >
          <RevenueBarChart data={revenueStats} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.3fr]">
        <Panel
          title="Tỷ lệ duyệt tin"
          description="Trạng thái kiểm duyệt Job."
          action={<Link to="/admin/jobs" className="text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Chi tiết</Link>}
        >
          <DonutChart data={jobApproval} />
        </Panel>

        <Panel
          title="Hàng chờ cần xử lý"
          description="Danh sách ưu tiên cần can thiệp ngay."
          action={<Link to="/admin/jobs" className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Xem tất cả</Link>}
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm">
            <div className="grid grid-cols-[1.2fr_.8fr_.7fr_.7fr] gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 max-lg:hidden">
              <span>Đối tượng</span>
              <span>Phân loại</span>
              <span>Ưu tiên</span>
              <span className="text-right">Trạng thái</span>
            </div>
            <div className="divide-y divide-slate-50">
              {queueItems.length > 0 ? queueItems.map((item) => (
                <QueueRow key={item.id} item={item} />
              )) : (
                <div className="p-8 text-center text-slate-500 font-medium">Không có hàng chờ xử lý nào</div>
              )}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
};

const MetricCard = ({ label, value, note, icon: Icon, badgeBg, iconColor, trend, trendColor }) => (
  <article className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <h4 className="font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent text-3xl">
            {value}
          </h4>
          {trend && (
            <span className={`text-[10px] font-bold ${trendColor} bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md flex items-center`}>
              <TrendingUp className="w-3 h-3 mr-0.5"/> {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 border rounded-xl group-hover:rotate-12 transition-transform duration-300 ${badgeBg} ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 opacity-50"/> {note}</p>
  </article>
);

const Panel = ({ title, description, action, children }) => (
  <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-black tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
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
  
  // Smoothing the curve
  const points = values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return [x, y];
  });

  const createSmoothPath = (points) => {
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i][0] + points[i + 1][0]) / 2;
      const yc = (points[i][1] + points[i + 1][1]) / 2;
      d += ` Q ${points[i][0]} ${points[i][1]}, ${xc} ${yc}`;
    }
    const last = points.length - 1;
    d += ` Q ${points[last - 1][0]} ${points[last - 1][1]}, ${points[last][0]} ${points[last][1]}`;
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="relative overflow-visible pt-4">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 z-0">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="w-full border-t border-slate-100 border-dashed"></div>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full relative z-10 overflow-visible drop-shadow-sm">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path d={areaPath} fill="url(#areaGradient)" className="animate-rise-in" />
        <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#softGlow)" />
        {points.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index === points.length - 1 ? 5 : 3.5} className="fill-white stroke-blue-500" strokeWidth={index === points.length - 1 ? 3 : 2} />
        ))}
      </svg>
    </div>
  );
};

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="p-8 text-center text-slate-500 font-medium">Không có dữ liệu thống kê</div>;
  }
  let offset = 25;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center mt-2">
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 drop-shadow-sm">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
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
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-1000 ease-out hover:stroke-opacity-80 cursor-pointer"
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{data[0].value}%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Đã duyệt</p>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[200px] space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
            <span className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="text-sm font-black text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RevenueBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500 font-medium">Không có dữ liệu thống kê</div>;
  const maxRevenue = Math.max(...data.map(m => Math.max(m.deposits || 0, m.payments || 0)), 1);

  return (
    <div className="h-72 flex items-end justify-between gap-2 px-2 pt-8 overflow-x-auto">
      {data.map((m) => {
        const monthLabel = new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'short' });
        return (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-2 min-w-[40px]">
            <div className="w-full flex items-end gap-1 justify-center h-48">
              <div
                className="w-full max-w-[16px] bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 relative group"
                style={{ height: `${(m.deposits / maxRevenue) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                  {new Intl.NumberFormat('vi-VN').format(m.deposits)}đ
                </div>
              </div>
              <div
                className="w-full max-w-[16px] bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600 relative group"
                style={{ height: `${(m.payments / maxRevenue) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                  {new Intl.NumberFormat('vi-VN').format(m.payments)}đ
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

const QueueRow = ({ item }) => (
  <div className="grid gap-3 px-6 py-4 transition hover:bg-slate-50/80 lg:grid-cols-[1.2fr_.8fr_.7fr_.7fr] lg:items-center group cursor-pointer">
    <div>
      <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{item.id} · {item.owner} · {item.time}</p>
    </div>
    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-100 w-fit shadow-sm">{item.type}</span>
    <PriorityBadge value={item.priority} />
    <div className="flex justify-end">
      <StatusBadge value={item.status} />
    </div>
  </div>
);

const PriorityBadge = ({ value }) => {
  const classes = {
    'Khẩn cấp': 'bg-red-50 text-red-600 border-red-200',
    Cao: 'bg-amber-50 text-amber-600 border-amber-200',
    'Trung bình': 'bg-blue-50 text-blue-600 border-blue-200',
  };
  return <span className={`w-fit rounded-lg px-2.5 py-1 text-[10px] font-bold border ${classes[value] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>{value}</span>;
};

const StatusBadge = ({ value }) => {
  const classes = {
    'Chờ duyệt': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'Cần xác minh': 'bg-blue-50 text-blue-700 border-blue-200/60',
    'Cảnh báo': 'bg-red-50 text-red-700 border-red-200/60',
  };
  const Icon = value === 'Cần xác minh' || value === 'Chờ duyệt' ? Clock3 : AlertCircle;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold border ${classes[value] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
};

export default AdminDashboard;
