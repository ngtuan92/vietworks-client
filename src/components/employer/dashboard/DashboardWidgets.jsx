import { AlertTriangle, Briefcase, Users, Wallet, CreditCard, Sparkles, RefreshCw, Star, Clock, AlertCircle, ArrowUpRight, CheckCircle2, TrendingUp, ChevronRight, Activity } from 'lucide-react';
import React from 'react';

const WarningBanner = () => (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/60 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-amber-100/80 rounded-2xl text-amber-600 shadow-sm">
        <AlertTriangle className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <h3 className="font-bold text-amber-900 text-sm md:text-base tracking-tight">Hồ sơ công ty của bạn chưa được xác thực</h3>
        <p className="text-xs md:text-sm text-amber-700/80 mt-1 leading-relaxed">
          Vui lòng cập nhật giấy phép ĐKKD để mở khóa toàn bộ tính năng đăng tin tuyển dụng.
        </p>
      </div>
    </div>
    <button className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex-shrink-0 whitespace-nowrap">
      Cập nhật ngay
    </button>
  </div>
);

const StatsGrid = () => {
  const stats = [
    {
      label: 'Tổng tin đăng',
      value: '24',
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      badgeBg: 'bg-blue-50 border-blue-100',
      trend: '+12%',
      trendColor: 'text-emerald-500',
      footer: (
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-emerald-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 12 Tuyển</span>
          <span className="text-amber-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 8 Chờ</span>
        </div>
      ),
    },
    {
      label: 'Tổng hồ sơ',
      value: '1.482',
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      badgeBg: 'bg-indigo-50 border-indigo-100',
      trend: '+24%',
      trendColor: 'text-emerald-500',
      footer: (
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-red-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> 156 Mới</span>
          <span className="text-indigo-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 42 Đã tuyển</span>
        </div>
      ),
    },
    {
      label: 'Số dư ví',
      value: '5.000.000 đ',
      icon: <Wallet className="w-6 h-6 text-emerald-500" />,
      badgeBg: 'bg-emerald-50 border-emerald-100',
      footer: <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3"/> Chi tiêu tháng: 12,5Tr</p>,
    },
    {
      label: 'Gói dịch vụ',
      value: 'Doanh Nghiệp',
      isText: true,
      icon: <CreditCard className="w-6 h-6 text-amber-500" />,
      badgeBg: 'bg-amber-50 border-amber-100',
      footer: (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">Mở khóa 85 CV</span>
          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">2 Job Nổi bật</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-slate-900 text-lg flex items-center gap-2.5 tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Activity className="w-4 h-4"/></div>
          Thống kê tổng quan
        </h2>
        <span className="text-xs text-slate-400 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">Cập nhật lúc: 10:30 Hôm nay</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h4 className={`font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent ${stat.isText ? 'text-xl' : 'text-3xl'}`}>
                    {stat.value}
                  </h4>
                  {stat.trend && (
                    <span className={`text-[10px] font-bold ${stat.trendColor} bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center`}>
                      <TrendingUp className="w-3 h-3 mr-0.5"/> {stat.trend}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-2.5 border rounded-xl group-hover:rotate-12 transition-transform duration-300 ${stat.badgeBg}`}>
                {stat.icon}
              </div>
            </div>
            {stat.footer}
          </div>
        ))}
      </div>
    </div>
  );
};

const ApplicationTrend = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="flex justify-between items-center mb-8 relative z-10">
      <div>
        <h3 className="font-black text-slate-900 text-base tracking-tight">Xu hướng ứng tuyển</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">Biến động hồ sơ theo thời gian thực</p>
      </div>
      <select className="text-sm border border-slate-200 rounded-xl bg-slate-50 p-2.5 outline-none font-bold text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer">
        <option>30 ngày qua</option>
        <option>90 ngày qua</option>
      </select>
    </div>

    {/* Elegant SVG Area Chart */}
    <div className="h-64 relative w-full pt-4">
      {/* Background grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 z-0">
        <div className="w-full border-t border-slate-100 border-dashed"></div>
        <div className="w-full border-t border-slate-100 border-dashed"></div>
        <div className="w-full border-t border-slate-100 border-dashed"></div>
        <div className="w-full border-t border-slate-100 border-dashed"></div>
        <div className="w-full border-t border-slate-100 border-dashed"></div>
      </div>

      <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Smoother, Subtle Spline Area */}
        <path
          d="M 0 150 C 60 150, 70 110, 100 110 C 140 110, 160 135, 200 135 C 240 135, 260 65, 300 65 C 340 65, 360 95, 400 95 C 440 95, 460 140, 500 140 L 500 200 L 0 200 Z"
          fill="url(#areaGrad)"
        />

        {/* Elegant Thin Stroke Line */}
        <path
          d="M 0 150 C 60 150, 70 110, 100 110 C 140 110, 160 135, 200 135 C 240 135, 260 65, 300 65 C 340 65, 360 95, 400 95 C 440 95, 460 140, 500 140"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Elegant Data Markers */}
        <g transform="translate(100, 110)">
          <circle cx="0" cy="0" r="3" className="fill-white stroke-blue-400 stroke-[2px]" />
        </g>
        <g transform="translate(200, 135)">
          <circle cx="0" cy="0" r="3" className="fill-white stroke-blue-400 stroke-[2px]" />
        </g>
        <g transform="translate(300, 65)">
          <circle cx="0" cy="0" r="4.5" className="fill-white stroke-primary stroke-[3px]" />
          {/* Subtle Tooltip */}
          <rect x="-26" y="-36" width="52" height="22" rx="6" fill="#0f172a" />
          <polygon points="-4,-14 4,-14 0,-10" fill="#0f172a" />
          <text x="0" y="-21" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">125 CV</text>
        </g>
        <g transform="translate(400, 95)">
          <circle cx="0" cy="0" r="3" className="fill-white stroke-blue-500 stroke-[2px]" />
        </g>
      </svg>
    </div>

    <div className="flex justify-between mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider px-2 relative z-10">
      <span>01 TH10</span>
      <span>10 TH10</span>
      <span>20 TH10</span>
      <span>30 TH10</span>
    </div>
  </div>
);

const QuickServicePacks = () => {
  const packages = [
    {
      title: 'Mở khóa 1 CV',
      price: '20.000 đ',
      desc: 'Mở khóa thông tin liên hệ',
      btnText: 'Mua ngay',
    },
    {
      title: 'Gói 50 CV',
      price: '800.000 đ',
      desc: 'Tiết kiệm 20% chi phí',
      btnText: 'Mua ngay',
      isPopular: true,
    },
    {
      title: 'Gói 100 CV',
      price: '1.500.000 đ',
      desc: 'Giải pháp tuyển dụng lớn',
      btnText: 'Mua ngay',
    },
    {
      title: 'Tin nổi bật VIP',
      price: '500.000 đ',
      desc: 'Tăng 3 lần lượt ứng tuyển',
      btnText: 'Chọn Việc',
      isAltButton: true,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900 text-base tracking-tight">Mua gói dịch vụ nhanh</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Chọn gói tối ưu để tìm ứng viên nhanh nhất</p>
        </div>
        <a className="text-primary text-sm font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors" href="#">
          Xem tất cả <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {packages.map((pkg, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border flex flex-col justify-between text-center relative transition-all duration-300 hover:-translate-y-1 ${
              pkg.isPopular
                ? 'border-primary bg-gradient-to-b from-blue-50/50 to-white shadow-md shadow-primary/10 ring-1 ring-primary/20'
                : 'border-slate-200/60 bg-white hover:shadow-lg'
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3 fill-white"/> Bán chạy
              </span>
            )}
            <div>
              <p className="text-[13px] font-bold text-slate-500 mb-2">{pkg.title}</p>
              <p className="text-2xl font-black text-slate-900 mb-1">{pkg.price}</p>
              <p className="text-xs text-slate-400 mb-6 font-medium px-2">{pkg.desc}</p>
            </div>
            <button
              className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                pkg.isAltButton
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                  : 'bg-primary text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              {pkg.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttentionJobs = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
    <div className="mb-6 flex justify-between items-end">
      <div>
        <h3 className="font-black text-slate-900 text-base tracking-tight mb-1">Việc làm cần chú ý</h3>
        <p className="text-xs text-slate-500 font-medium">Các tin tuyển dụng sắp hết hạn hoặc bị từ chối</p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
          <tr>
            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider rounded-tl-xl whitespace-nowrap">Vị trí tuyển dụng</th>
            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-center whitespace-nowrap">Tình trạng</th>
            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-right rounded-tr-xl whitespace-nowrap">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-4 py-4">
              <p className="font-bold text-slate-900 text-sm whitespace-nowrap">Lập trình viên React Senior</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">Hết hạn trong 2 ngày</p>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="inline-flex bg-amber-50 text-amber-600 border border-amber-200 text-[11px] px-3 py-1 rounded-lg font-bold whitespace-nowrap">
                Sắp hết hạn
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              <button className="text-primary font-bold hover:text-blue-700 text-sm cursor-pointer flex items-center justify-end gap-1 w-full opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Gia hạn <ChevronRight className="w-4 h-4"/>
              </button>
            </td>
          </tr>
          <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-4 py-4">
              <p className="font-bold text-slate-900 text-sm whitespace-nowrap">Chuyên viên Thiết kế UI/UX</p>
              <p className="text-[11px] text-red-400 font-bold mt-1">Lý do: Sai định dạng tiêu đề</p>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="inline-flex bg-red-50 text-red-600 border border-red-200 text-[11px] px-3 py-1 rounded-lg font-bold whitespace-nowrap">
                Bị từ chối
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              <button className="text-slate-600 font-bold hover:text-slate-900 text-sm cursor-pointer flex items-center justify-end gap-1 w-full opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chỉnh sửa <ChevronRight className="w-4 h-4"/>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const RecruitmentFunnel = () => {
  const items = [
    { label: 'Chưa xem', percent: '100%', count: '1.482', width: 'w-full', barColor: 'bg-primary' },
    { label: 'Đã xem', percent: '64%', count: '948', width: 'w-[64%]', barColor: 'bg-blue-400' },
    { label: 'Đã duyệt/Hẹn PV', percent: '12%', count: '178', width: 'w-[12%]', barColor: 'bg-emerald-400' },
    { label: 'Từ chối', percent: '28%', count: '415', width: 'w-[28%]', barColor: 'bg-red-400', isDanger: true },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <h3 className="font-black text-slate-900 text-base tracking-tight mb-6">Phễu tuyển dụng</h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label} className="group">
            <div className={`flex justify-between text-sm mb-2 font-bold ${item.isDanger ? 'text-red-500' : 'text-slate-700'}`}>
              <span>{item.label}</span>
              <span className="bg-slate-50 px-2 py-0.5 rounded text-xs">{item.percent} ({item.count})</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100">
              <div className={`h-full ${item.barColor} ${item.width} rounded-full group-hover:scale-y-125 transition-all origin-left`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OptimizeSuggestion = () => (
  <div className="bg-gradient-to-br from-indigo-600 via-primary to-blue-700 p-8 rounded-3xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/20">
        <Sparkles className="text-yellow-300 w-5 h-5 animate-pulse" />
      </div>
      <h3 className="font-black text-lg tracking-tight">Gợi ý tối ưu từ AI</h3>
    </div>
    <p className="text-sm leading-relaxed mb-8 opacity-95 font-medium">
      Tin tuyển dụng <span className="bg-white/20 px-2 py-0.5 rounded text-white font-bold inline-block mx-1">Lập trình viên Frontend</span> 
      đang có lượng xem cao nhưng tỷ lệ chuyển đổi thấp. Bật gói <strong className="text-yellow-300">Tin nổi bật 7 ngày</strong> để thu hút thêm ứng viên chất lượng.
    </p>
    <button className="w-full py-3.5 bg-yellow-400 text-indigo-950 font-black rounded-xl hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-1 transition-all text-sm cursor-pointer shadow-md">
      NÂNG CẤP NGAY
    </button>
  </div>
);

const NewApplicants = () => {
  const applicants = [
    { initials: 'HN', name: 'Nguyễn Hoàng Nam', role: 'Lập trình viên Java', time: '5 phút trước' },
    { initials: 'TT', name: 'Phan Thu Trang', role: 'Chuyên viên Marketing', time: '15 phút trước' },
    { initials: 'DA', name: 'Lê Duy Anh', role: 'Kế toán trưởng', time: '1 giờ trước' },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-900 text-base tracking-tight">Ứng viên mới nhất</h3>
        <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-blue-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {applicants.map((a) => (
          <div key={a.name} className="flex items-center gap-4 p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center font-black text-primary text-sm shadow-sm">
              {a.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{a.name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{a.role}</p>
            </div>
            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border border-slate-100">{a.time}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-3.5 text-sm font-bold text-primary bg-blue-50/50 rounded-xl hover:bg-blue-100/50 transition-all cursor-pointer border border-blue-100/50">
        Xem toàn bộ hồ sơ
      </button>
    </div>
  );
};

const ServiceCostChart = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="mb-6 relative z-10">
      <h3 className="font-black text-slate-900 text-base tracking-tight">Chi tiêu dịch vụ</h3>
      <p className="text-xs text-slate-500 mt-1 font-medium">Thống kê 6 tháng gần nhất</p>
    </div>

    {/* Enhanced Custom Column Chart */}
    <div className="h-32 relative w-full pt-4">
      <svg className="w-full h-full drop-shadow-md overflow-visible relative z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Background Grid */}
        <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

        {/* Animated Columns */}
        <rect x="15" y="80" width="24" height="20" rx="8" fill="#e2e8f0" className="hover:fill-[#cbd5e1] transition-all cursor-pointer" />
        <rect x="63" y="65" width="24" height="35" rx="8" fill="#cbd5e1" className="hover:fill-[#94a3b8] transition-all cursor-pointer" />
        <rect x="111" y="50" width="24" height="50" rx="8" fill="#94a3b8" className="hover:fill-[#64748b] transition-all cursor-pointer" />
        <rect x="159" y="25" width="24" height="75" rx="8" fill="url(#barGrad)" fillOpacity="0.7" className="hover:fill-[url(#barGradActive)] transition-all cursor-pointer" />
        <rect x="207" y="35" width="24" height="65" rx="8" fill="url(#barGrad)" fillOpacity="0.85" className="hover:fill-[url(#barGradActive)] transition-all cursor-pointer" />
        
        {/* Highest column with a tooltip */}
        <g className="group cursor-pointer">
          <rect x="255" y="10" width="24" height="90" rx="8" fill="url(#barGradActive)" className="hover:opacity-90 transition-opacity" />
          <rect x="242" y="-15" width="50" height="20" rx="6" fill="#1e293b" className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <polygon points="262,-1 272,-1 267,4" fill="#1e293b" className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <text x="267" y="-2" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">12.5Tr</text>
        </g>
      </svg>
    </div>

    <div className="flex justify-between mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 relative z-10">
      <span>T5</span>
      <span>T6</span>
      <span>T7</span>
      <span>T8</span>
      <span>T9</span>
      <span>T10</span>
    </div>
  </div>
);

export {
  WarningBanner,
  StatsGrid,
  ApplicationTrend,
  QuickServicePacks,
  AttentionJobs,
  RecruitmentFunnel,
  OptimizeSuggestion,
  NewApplicants,
  ServiceCostChart,
};
