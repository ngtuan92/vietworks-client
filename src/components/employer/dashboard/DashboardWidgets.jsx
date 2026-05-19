
const WarningBanner = () => (
  <div className="bg-white border-l-4 border-[#ba1a1a] shadow-sm rounded-r-xl p-5 flex items-center justify-between gap-6">
    <div className="flex items-start gap-4">
      <div className="p-2 bg-[#ffdad6] rounded-lg">
        <span className="material-symbols-outlined text-[#ba1a1a]">report</span>
      </div>
      <div>
        <h3 className="font-bold">Hồ sơ công ty của bạn chưa được xác thực</h3>
        <p className="text-sm text-[#5e5e62] mt-1">
          Vui lòng cập nhật giấy đăng ký doanh nghiệp để được phép đăng tin tuyển dụng và truy cập đầy đủ tính năng.
        </p>
      </div>
    </div>
    <button className="bg-[#ba1a1a] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex-shrink-0">
      Cập nhật ngay
    </button>
  </div>
);

const StatsGrid = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
        Thống kê tuyển dụng
      </h2>
      <span className="text-xs text-[#5e5e62] italic">Cập nhật lúc: 10:30 Hôm nay</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng tin đăng */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-6xl">work</span>
        </div>
        <p className="text-xs font-bold text-[#5e5e62] uppercase tracking-widest mb-1">Tổng tin đăng</p>
        <h4 className="text-3xl font-black text-[#0056b3]">24</h4>
        <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase">
          <span className="text-green-600">12 Đang tuyển</span>
          <span className="text-amber-500">8 Chờ duyệt</span>
          <span className="text-[#5e5e62]">4 Đã đóng</span>
        </div>
      </div>

      {/* Tổng hồ sơ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-6xl">group</span>
        </div>
        <p className="text-xs font-bold text-[#5e5e62] uppercase tracking-widest mb-1">Tổng hồ sơ</p>
        <h4 className="text-3xl font-black text-[#0056b3]">1.482</h4>
        <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase">
          <span className="text-[#ba1a1a]">156 Chưa xem</span>
          <span className="text-[#0056b3]">42 Đã tuyển</span>
        </div>
      </div>

      {/* Số dư ví */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
        </div>
        <p className="text-xs font-bold text-[#5e5e62] uppercase tracking-widest mb-1">Số dư ví</p>
        <h4 className="text-2xl font-black text-[#0056b3]">5.000.000 VND</h4>
        <p className="mt-4 text-[10px] text-[#5e5e62] font-medium">Tổng chi tiêu tháng này: 12,5M VND</p>
      </div>

      {/* Gói dịch vụ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-6xl">card_membership</span>
        </div>
        <p className="text-xs font-bold text-[#5e5e62] uppercase tracking-widest mb-1">Gói dịch vụ</p>
        <h4 className="text-lg font-black text-[#0056b3] truncate">Enterprise Gold</h4>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-[#0056b3]/10 text-[#0056b3] text-[9px] px-2 py-0.5 rounded font-bold">85 CV Unlocks</span>
          <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded font-bold">2 Hot Jobs left</span>
        </div>
      </div>
    </div>
  </div>
);

const ApplicationTrend = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold">Xu hướng ứng tuyển (30 ngày)</h3>
      <select className="text-xs border-[#c2c6d4] rounded bg-[#fbf9f8] p-1 outline-none">
        <option>30 ngày qua</option>
        <option>90 ngày qua</option>
      </select>
    </div>
    <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 border-b border-[#c2c6d4]/30">
      {[40, 30, 55, 85, 45, 35, 60, 50, 20, 35].map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-sm transition-all hover:opacity-80 ${
            h === 85 ? 'bg-[#0056b3]' : 'bg-[#0056b3]/20'
          }`}
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-[10px] text-[#5e5e62] font-bold">
      <span>01 TH10</span>
      <span>10 TH10</span>
      <span>20 TH10</span>
      <span>30 TH10</span>
    </div>
  </div>
);

const QuickServicePacks = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold">Mua gói dịch vụ nhanh</h3>
      <a className="text-[#0056b3] text-xs font-bold hover:underline" href="#">Xem tất cả gói</a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="border border-[#c2c6d4]/50 p-4 rounded-lg flex flex-col items-center text-center">
        <p className="text-xs font-bold text-[#5e5e62] mb-1">Mở khóa 1 CV</p>
        <p className="text-lg font-black text-[#0056b3] mb-3">20.000 VNĐ</p>
        <button className="w-full py-2 bg-[#0056b3] text-white text-xs font-bold rounded hover:bg-[#0056b3]/90 transition-all">Mua ngay</button>
      </div>
      <div className="border border-[#0056b3] p-4 rounded-lg flex flex-col items-center text-center bg-[#0056b3]/5 relative">
        <span className="absolute -top-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Bán chạy</span>
        <p className="text-xs font-bold text-[#5e5e62] mb-1">Gói 50 CV</p>
        <p className="text-lg font-black text-[#0056b3] mb-3">800.000 VNĐ</p>
        <button className="w-full py-2 bg-[#0056b3] text-white text-xs font-bold rounded hover:bg-[#0056b3]/90 transition-all">Mua ngay</button>
      </div>
      <div className="border border-[#c2c6d4]/50 p-4 rounded-lg flex flex-col items-center text-center">
        <p className="text-xs font-bold text-[#5e5e62] mb-1">Gói 100 CV</p>
        <p className="text-lg font-black text-[#0056b3] mb-3">1.500k VNĐ</p>
        <button className="w-full py-2 bg-[#0056b3] text-white text-xs font-bold rounded hover:bg-[#0056b3]/90 transition-all">Mua ngay</button>
      </div>
      <div className="border border-[#c2c6d4]/50 p-4 rounded-lg flex flex-col items-center text-center">
        <p className="text-xs font-bold text-[#5e5e62] mb-1">Tin nổi bật 7 ngày</p>
        <p className="text-lg font-black text-[#0056b3] mb-3">500.000 VNĐ</p>
        <button className="w-full py-2 bg-[#5e5e62] text-white text-xs font-bold rounded hover:bg-[#5e5e62]/90 transition-all">Chọn Job</button>
      </div>
    </div>
  </div>
);

const AttentionJobs = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
    <h3 className="font-bold mb-6">Job cần chú ý</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-[#5e5e62] border-b border-[#c2c6d4]/30">
          <tr>
            <th className="pb-3 font-bold">Vị trí</th>
            <th className="pb-3 font-bold text-center">Tình trạng</th>
            <th className="pb-3 font-bold text-right">Lý do/Gợi ý</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#c2c6d4]/20">
          <tr>
            <td className="py-4">
              <p className="font-bold">Senior React Developer</p>
              <p className="text-[10px] text-[#5e5e62]">Đăng bởi: Minh Tran</p>
            </td>
            <td className="py-4 text-center">
              <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Sắp hết hạn</span>
            </td>
            <td className="py-4 text-right">
              <button className="text-[#0056b3] font-bold hover:underline">Gia hạn ngay</button>
            </td>
          </tr>
          <tr>
            <td className="py-4">
              <p className="font-bold">UI/UX Designer (Fintech)</p>
              <p className="text-[10px] text-[#5e5e62]">Đăng bởi: Minh Tran</p>
            </td>
            <td className="py-4 text-center">
              <span className="bg-[#ffdad6] text-[#ba1a1a] text-[10px] px-2 py-0.5 rounded-full font-bold">Bị từ chối</span>
            </td>
            <td className="py-4 text-right text-xs text-[#5e5e62] italic">Sai định dạng tiêu đề</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const RecruitmentFunnel = () => {
  const items = [
    { label: 'Chưa xem', percent: '100%', count: '1.482', width: 'w-full', barColor: 'bg-[#0056b3]' },
    { label: 'Đã xem', percent: '64%', count: '948', width: 'w-[64%]', barColor: 'bg-[#0056b3]/70' },
    { label: 'Đã duyệt/Hẹn PV', percent: '12%', count: '178', width: 'w-[12%]', barColor: 'bg-[#0056b3]/40' },
    { label: 'Từ chối', percent: '28%', count: '415', width: 'w-[28%]', barColor: 'bg-[#ba1a1a]/30', isDanger: true },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
      <h3 className="font-bold mb-6">Phễu tuyển dụng</h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className={`flex justify-between text-xs mb-1 font-bold ${item.isDanger ? 'text-[#ba1a1a]' : ''}`}>
              <span>{item.label}</span>
              <span>{item.percent} ({item.count})</span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden ${item.isDanger ? 'bg-[#ffdad6]' : 'bg-[#f5f3f3]'}`}>
              <div className={`h-full ${item.barColor} ${item.width} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OptimizeSuggestion = () => (
  <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-6 rounded-xl shadow-lg text-white">
    <div className="flex items-center gap-2 mb-4">
      <span className="material-symbols-outlined text-amber-400">auto_awesome</span>
      <h3 className="font-bold">Gợi ý tối ưu</h3>
    </div>
    <p className="text-sm leading-relaxed mb-6 opacity-90">
      Tin <strong className="underline decoration-amber-400">"Frontend Developer"</strong> đang có 200 lượt xem nhưng chỉ có 2 CV ứng tuyển. Bạn có thể bật gói <strong>Tin nổi bật 7 ngày</strong> để tăng 40% tỷ lệ hồ sơ tiềm năng.
    </p>
    <button className="w-full py-3 bg-amber-400 text-[#0056b3] font-black rounded-lg hover:bg-amber-300 transition-all shadow-md">
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold">Ứng viên mới</h3>
        <button className="material-symbols-outlined text-[#5e5e62] hover:text-[#0056b3] transition-colors">sync</button>
      </div>
      <div className="space-y-4">
        {applicants.map((a) => (
          <div key={a.initials} className="flex items-center gap-3 p-2 hover:bg-[#e4e2e2]/30 rounded-lg transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#f5f3f3] flex items-center justify-center font-bold text-[#0056b3]">{a.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{a.name}</p>
              <p className="text-[10px] text-[#5e5e62] truncate">{a.role}</p>
            </div>
            <span className="text-[10px] text-[#5e5e62]">{a.time}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-xs font-bold text-[#0056b3] border border-[#0056b3]/20 rounded-lg hover:bg-[#0056b3]/5 transition-all">
        Xem tất cả ứng viên
      </button>
    </div>
  );
};

const ServiceCostChart = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d4]/50">
    <h3 className="font-bold mb-4">Chi phí dịch vụ (6 tháng)</h3>
    <div className="flex items-end justify-between gap-1 h-20">
      {[20, 35, 50, 75, 65, 90].map((h, i) => (
        <div
          key={i}
          className={`w-full rounded-t-sm transition-all ${
            i >= 3 ? (i === 5 ? 'bg-[#0056b3]' : 'bg-[#0056b3]/60') : 'bg-[#5e5e62]/10'
          }`}
          style={{ height: `${h}%` }}
        ></div>
      ))}
    </div>
    <div className="flex justify-between mt-2 text-[8px] font-bold text-[#5e5e62] uppercase">
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
