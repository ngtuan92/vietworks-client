import { AlertTriangle, Briefcase, Users, Wallet, CreditCard, Sparkles, RefreshCw } from 'lucide-react';

const WarningBanner = () => (
  <div className="bg-white border-l-4 border-red-600 shadow-sm rounded-r-2xl p-5 flex items-center justify-between gap-6">
    <div className="flex items-start gap-4">
      <div className="p-2.5 bg-red-50 rounded-xl">
        <AlertTriangle className="text-red-600 w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm md:text-base">Hồ sơ công ty của bạn chưa được xác thực</h3>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Vui lòng cập nhật giấy đăng ký doanh nghiệp để được phép đăng tin tuyển dụng và truy cập đầy đủ tính năng của VietWorks.
        </p>
      </div>
    </div>
    <button className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-700 transition-all flex-shrink-0 cursor-pointer">
      Cập nhật ngay
    </button>
  </div>
);

const StatsGrid = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
        Thống kê tuyển dụng
      </h2>
      <span className="text-xs text-slate-400 italic">Cập nhật lúc: 10:30 Hôm nay</span>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tổng tin đăng */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
        <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Briefcase className="w-10 h-10 text-slate-700" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tin đăng</p>
        <h4 className="text-3xl font-black text-primary">24</h4>
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase">
          <span className="text-emerald-600">12 Đang tuyển</span>
          <span className="text-amber-500">8 Chờ duyệt</span>
          <span className="text-slate-400">4 Đã đóng</span>
        </div>
      </div>

      {/* Tổng hồ sơ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
        <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Users className="w-10 h-10 text-slate-700" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng hồ sơ</p>
        <h4 className="text-3xl font-black text-primary">1.482</h4>
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase">
          <span className="text-red-500">156 Chưa xem</span>
          <span className="text-primary">42 Đã tuyển</span>
        </div>
      </div>

      {/* Số dư ví */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
        <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-10 h-10 text-slate-700" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Số dư ví</p>
        <h4 className="text-2xl font-black text-primary">5.000.000 VND</h4>
        <p className="mt-4 text-[10px] text-slate-400 font-medium">Tổng chi tiêu tháng này: 12,5M VND</p>
      </div>

      {/* Gói dịch vụ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
        <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <CreditCard className="w-10 h-10 text-slate-700" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gói dịch vụ</p>
        <h4 className="text-lg font-black text-primary truncate">Enterprise Gold</h4>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-lg font-bold">85 CV Unlocks</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] px-2 py-0.5 rounded-lg font-bold">2 Hot Jobs left</span>
        </div>
      </div>
    </div>
  </div>
);

const ApplicationTrend = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-slate-900 text-sm md:text-base">Xu hướng ứng tuyển (30 ngày)</h3>
      <select className="text-xs border border-slate-200 rounded-lg bg-slate-50 p-1.5 outline-none font-semibold text-slate-600 focus:border-primary">
        <option>30 ngày qua</option>
        <option>90 ngày qua</option>
      </select>
    </div>
    <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-100">
      {[40, 30, 55, 85, 45, 35, 60, 50, 20, 35].map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-lg transition-all hover:opacity-85 ${
            h === 85 ? 'bg-primary' : 'bg-primary/20'
          }`}
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
      <span>01 TH10</span>
      <span>10 TH10</span>
      <span>20 TH10</span>
      <span>30 TH10</span>
    </div>
  </div>
);

const QuickServicePacks = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-slate-900 text-sm md:text-base">Mua gói dịch vụ nhanh</h3>
      <a className="text-primary text-xs font-bold hover:underline" href="#">Xem tất cả gói</a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center">
        <p className="text-xs font-bold text-slate-400 mb-1">Mở khóa 1 CV</p>
        <p className="text-lg font-black text-primary mb-3">20.000 VNĐ</p>
        <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer">Mua ngay</button>
      </div>
      <div className="border-2 border-primary p-4 rounded-xl flex flex-col items-center text-center bg-blue-50/20 relative">
        <span className="absolute -top-2.5 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Bán chạy</span>
        <p className="text-xs font-bold text-slate-400 mb-1">Gói 50 CV</p>
        <p className="text-lg font-black text-primary mb-3">800.000 VNĐ</p>
        <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer">Mua ngay</button>
      </div>
      <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center">
        <p className="text-xs font-bold text-slate-400 mb-1">Gói 100 CV</p>
        <p className="text-lg font-black text-primary mb-3">1.500k VNĐ</p>
        <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer">Mua ngay</button>
      </div>
      <div className="border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center">
        <p className="text-xs font-bold text-slate-400 mb-1">Tin nổi bật 7 ngày</p>
        <p className="text-lg font-black text-primary mb-3">500.000 VNĐ</p>
        <button className="w-full py-2 bg-slate-600 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all cursor-pointer">Chọn Job</button>
      </div>
    </div>
  </div>
);

const AttentionJobs = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-6">Job cần chú ý</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-400 border-b border-slate-100">
          <tr>
            <th className="pb-3 font-bold text-xs uppercase tracking-wider">Vị trí</th>
            <th className="pb-3 font-bold text-xs uppercase tracking-wider text-center">Tình trạng</th>
            <th className="pb-3 font-bold text-xs uppercase tracking-wider text-right">Lý do/Gợi ý</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          <tr>
            <td className="py-4">
              <p className="font-bold text-slate-800">Senior React Developer</p>
              <p className="text-[10px] text-slate-400">Đăng bởi: Minh Tran</p>
            </td>
            <td className="py-4 text-center">
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Sắp hết hạn</span>
            </td>
            <td className="py-4 text-right">
              <button className="text-primary font-bold hover:underline text-xs cursor-pointer">Gia hạn ngay</button>
            </td>
          </tr>
          <tr>
            <td className="py-4">
              <p className="font-bold text-slate-800">UI/UX Designer (Fintech)</p>
              <p className="text-[10px] text-slate-400">Đăng bởi: Minh Tran</p>
            </td>
            <td className="py-4 text-center">
              <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Bị từ chối</span>
            </td>
            <td className="py-4 text-right text-xs text-slate-400 italic">Sai định dạng tiêu đề</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const RecruitmentFunnel = () => {
  const items = [
    { label: 'Chưa xem', percent: '100%', count: '1.482', width: 'w-full', barColor: 'bg-primary' },
    { label: 'Đã xem', percent: '64%', count: '948', width: 'w-[64%]', barColor: 'bg-primary/70' },
    { label: 'Đã duyệt/Hẹn PV', percent: '12%', count: '178', width: 'w-[12%]', barColor: 'bg-primary/40' },
    { label: 'Từ chối', percent: '28%', count: '415', width: 'w-[28%]', barColor: 'bg-red-500/40', isDanger: true },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-900 text-sm md:text-base mb-6">Phễu tuyển dụng</h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className={`flex justify-between text-xs mb-1 font-bold ${item.isDanger ? 'text-red-500' : 'text-slate-700'}`}>
              <span>{item.label}</span>
              <span>{item.percent} ({item.count})</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${item.isDanger ? 'bg-red-50' : 'bg-slate-50'}`}>
              <div className={`h-full ${item.barColor} ${item.width} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OptimizeSuggestion = () => (
  <div className="bg-gradient-to-br from-primary via-[#004a9e] to-blue-900 p-6 rounded-2xl shadow-md text-white">
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="text-yellow-300 w-5 h-5" />
      <h3 className="font-bold text-sm md:text-base">Gợi ý tối ưu</h3>
    </div>
    <p className="text-xs md:text-sm leading-relaxed mb-6 opacity-90">
      Tin <strong className="underline decoration-yellow-300 font-black">"Frontend Developer"</strong> đang có 200 lượt xem nhưng chỉ có 2 CV ứng tuyển. Bạn có thể bật gói <strong>Tin nổi bật 7 ngày</strong> để tăng 40% tỷ lệ hồ sơ tiềm năng.
    </p>
    <button className="w-full py-3 bg-yellow-400 text-primary font-black rounded-xl hover:bg-yellow-300 transition-all shadow-md text-xs cursor-pointer">
      BẬT TIN NỔI BẬT NGAY
    </button>
  </div>
);

const NewApplicants = () => {
  const applicants = [
    { initials: 'NH', name: 'Nguyễn Hoàng Nam', role: 'Java Web Developer', time: '5 phút trước' },
    { initials: 'PT', name: 'Phan Thu Trang', role: 'Marketing Specialist', time: '15 phút trước' },
    { initials: 'LD', name: 'Lê Duy Anh', role: 'Senior Accountant', time: '1 giờ trước' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 text-sm md:text-base">Ứng viên mới</h3>
        <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {applicants.map((a) => (
          <div key={a.initials} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">{a.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{a.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{a.role}</p>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{a.time}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-xs font-bold text-primary border border-slate-200 rounded-xl hover:bg-blue-50/30 transition-all cursor-pointer">
        Xem tất cả ứng viên
      </button>
    </div>
  );
};

const ServiceCostChart = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-4">Chi phí dịch vụ (6 tháng)</h3>
    <div className="flex items-end justify-between gap-1.5 h-20">
      {[20, 35, 50, 75, 65, 90].map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-lg transition-all ${
            i >= 3 ? (i === 5 ? 'bg-primary' : 'bg-primary/60') : 'bg-slate-200'
          }`}
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
      <span>T5</span><span>T6</span><span>T7</span><span>T8</span><span>T9</span><span>T10</span>
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
