import {
  AlertTriangle, Briefcase, Users, Wallet, CreditCard, Sparkles, RefreshCw,
  Star, Clock, AlertCircle, ArrowUpRight, CheckCircle2, TrendingUp, ChevronRight,
  Activity, Crown, Loader2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Helpers ───────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0));
const fmtMoney = (n) => `${fmt(n)} đ`;

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── WarningBanner ─────────────────────────────────────
const WarningBanner = ({ verificationStatus }) => {
  const navigate = useNavigate();
  if (verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED') return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/60 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100/80 rounded-2xl text-amber-600 shadow-sm">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-sm md:text-base tracking-tight">
            {verificationStatus === 'REJECTED' ? 'Hồ sơ xác thực bị từ chối' : 'Hồ sơ công ty của bạn chưa được xác thực'}
          </h3>
          <p className="text-xs md:text-sm text-amber-700/80 mt-1 leading-relaxed">
            {verificationStatus === 'REJECTED'
              ? 'Vui lòng cập nhật lại giấy phép ĐKKD chính xác để Admin duyệt lại.'
              : 'Vui lòng cập nhật giấy phép ĐKKD để mở khóa toàn bộ tính năng đăng tin tuyển dụng.'}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/employer/company-profile?tab=legal')}
        className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex-shrink-0 whitespace-nowrap"
      >
        Cập nhật ngay
      </button>
    </div>
  );
};

// ─── StatsGrid ─────────────────────────────────────────
const StatsGrid = ({ data }) => {
  const totalJobs = data?.totalJobs ?? '—';
  const publishedJobs = data?.publishedJobs ?? 0;
  const pendingJobs = data?.pendingJobs ?? 0;
  const totalApplications = data?.funnelTotals?.total ?? '—';
  const newApplications = (data?.funnelTotals?.UNREAD || 0) + (data?.funnelTotals?.APPLIED || 0);
  const hiredApplications = data?.funnelTotals?.HIRED ?? 0;
  const walletBalance = data?.wallet?.balance !== undefined ? fmtMoney(data.wallet.balance) : '—';

  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const stats = [
    {
      label: 'Tổng tin đăng',
      value: String(totalJobs),
      icon: <Briefcase className="w-6 h-6 text-blue-500" />,
      badgeBg: 'bg-blue-50 border-blue-100',
      footer: (
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-emerald-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {publishedJobs} Tuyển</span>
          <span className="text-amber-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {pendingJobs} Chờ</span>
        </div>
      ),
    },
    {
      label: 'Tổng hồ sơ',
      value: String(totalApplications),
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      badgeBg: 'bg-indigo-50 border-indigo-100',
      footer: (
        <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-red-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {newApplications} Mới</span>
          <span className="text-indigo-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> {hiredApplications} Đã tuyển</span>
        </div>
      ),
    },
    {
      label: 'Số dư ví',
      value: walletBalance,
      isText: true,
      icon: <Wallet className="w-6 h-6 text-emerald-500" />,
      badgeBg: 'bg-emerald-50 border-emerald-100',
      footer: <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3"/>Số dư hiện tại</p>,
    },
    {
      label: 'Trạng thái hồ sơ',
      value: data?.funnelTotals?.APPROVED > 0 ? `${data.funnelTotals.APPROVED} Duyệt` : 'Chưa có',
      isText: true,
      icon: <CreditCard className="w-6 h-6 text-amber-500" />,
      badgeBg: 'bg-amber-50 border-amber-100',
      footer: (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">{data?.funnelTotals?.APPROVED || 0} Đã duyệt</span>
          <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2.5 py-1 rounded-lg font-bold">{data?.funnelTotals?.REJECTED || 0} Từ chối</span>
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

// ─── ApplicationTrend ─────────────────────────────
const ApplicationTrend = ({ analytics, atsJobs }) => {
  const chartData = analytics?.applicationsByMonth || [];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="font-black text-slate-900 text-base tracking-tight">Xu hướng ứng tuyển</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">6 tháng gần nhất</p>
        </div>
        <Link to="/employer/candidates" className="text-primary text-sm font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
          Xem tất cả <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }} />
          <Area type="monotone" dataKey="Tổng hồ sơ" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradTotal)" dot={{ r: 3, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="Đã duyệt"   stroke="#10b981" strokeWidth={2}   fill="url(#gradApproved)" dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="Từ chối"    stroke="#ef4444" strokeWidth={2}   fill="none" strokeDasharray="4 2" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


// ─── QuickServicePacks ────────────────────────────────
const QuickServicePacks = () => {
  const navigate = useNavigate();
  const packages = [
    { title: 'Mở khóa 1 CV', price: '20.000 đ', desc: 'Mở khóa thông tin liên hệ', to: '/employer/packages' },
    { title: 'Gói 50 CV', price: '800.000 đ', desc: 'Tiết kiệm 20% chi phí', to: '/employer/packages', isPopular: true },
    { title: 'Gói 100 CV', price: '1.500.000 đ', desc: 'Giải pháp tuyển dụng lớn', to: '/employer/packages' },
    { title: 'Tin nổi bật VIP', price: '500.000 đ', desc: 'Tăng 3 lần lượt ứng tuyển', to: '/employer/packages', isAltButton: true },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-black text-slate-900 text-base tracking-tight">Mua gói dịch vụ nhanh</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Chọn gói tối ưu để tìm ứng viên nhanh nhất</p>
        </div>
        <Link to="/employer/packages" className="text-primary text-sm font-bold hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
          Xem tất cả <ArrowUpRight className="w-4 h-4" />
        </Link>
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
              onClick={() => navigate(pkg.to)}
              className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                pkg.isAltButton
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
                  : 'bg-primary text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-primary/20'
              }`}
            >
              Mua ngay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AttentionJobs ────────────────────────────────────
const AttentionJobs = ({ jobs }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="font-black text-slate-900 text-base tracking-tight mb-1">Việc làm cần chú ý</h3>
          <p className="text-xs text-slate-500 font-medium">Các tin tuyển dụng sắp hết hạn hoặc đã hết hạn</p>
        </div>
        <Link to="/employer/jobs" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
          Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400" />
          <p className="text-sm font-medium text-emerald-600">Tất cả tin tuyển dụng đang hoạt động tốt!</p>
        </div>
      ) : (
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
              {jobs.map((job) => {
                const days = daysUntil(job.deadline);
                const isExpired = job.status === 'EXPIRED';
                const isUrgent = days !== null && days <= 1;
                return (
                  <tr key={job._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{job.title}</p>
                      <p className={`text-[11px] font-bold mt-1 ${isUrgent ? 'text-red-400' : 'text-amber-500'}`}>
                        {isExpired ? 'Đã hết hạn' : days !== null ? `Hết hạn trong ${days} ngày` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex text-[11px] px-3 py-1 rounded-lg font-bold whitespace-nowrap ${
                        isExpired ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {isExpired ? 'Hết hạn' : 'Sắp hết hạn'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => navigate('/employer/jobs')}
                        className="text-primary font-bold hover:text-blue-700 text-sm cursor-pointer flex items-center justify-end gap-1 w-full opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        Xem chi tiết <ChevronRight className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── RecruitmentFunnel ────────────────────────────────
const RecruitmentFunnel = ({ funnel }) => {
  const total = funnel?.total || 0;
  const items = [
    { label: 'Chưa xem', count: funnel?.UNREAD || 0, barColor: 'bg-primary' },
    { label: 'Đã xem', count: funnel?.VIEWED || 0, barColor: 'bg-blue-400' },
    { label: 'Đã duyệt', count: funnel?.APPROVED || 0, barColor: 'bg-emerald-400' },
    { label: 'Từ chối', count: funnel?.REJECTED || 0, barColor: 'bg-red-400', isDanger: true },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-slate-900 text-base tracking-tight">Phễu tuyển dụng</h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          Tổng: {total} hồ sơ
        </span>
      </div>
      <div className="space-y-5">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="group">
              <div className={`flex justify-between text-sm mb-2 font-bold ${item.isDanger ? 'text-red-500' : 'text-slate-700'}`}>
                <span>{item.label}</span>
                <span className="bg-slate-50 px-2 py-0.5 rounded text-xs">{pct}% ({item.count})</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-100">
                <div
                  className={`h-full ${item.barColor} rounded-full group-hover:scale-y-125 transition-all origin-left`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── OptimizeSuggestion ───────────────────────────────
const OptimizeSuggestion = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-primary to-blue-700 p-8 rounded-3xl shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/20">
          <Sparkles className="text-yellow-300 w-5 h-5 animate-pulse" />
        </div>
        <h3 className="font-black text-lg tracking-tight">Tối ưu tin tuyển dụng</h3>
      </div>
      <p className="text-sm leading-relaxed mb-8 opacity-95 font-medium">
        Nâng cấp tin tuyển dụng của bạn với gói <strong className="text-yellow-300">Tin nổi bật</strong> để tăng tỷ lệ tiếp cận và thu hút thêm ứng viên chất lượng cao.
      </p>
      <button
        onClick={() => navigate('/employer/packages')}
        className="w-full py-3.5 bg-yellow-400 text-indigo-950 font-black rounded-xl hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-1 transition-all text-sm cursor-pointer shadow-md"
      >
        NÂNG CẤP NGAY
      </button>
    </div>
  );
};

// ─── NewApplicants ─────────────────────────────────────
const NewApplicants = ({ topJobs }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-900 text-base tracking-tight">Tin có hồ sơ mới</h3>
        <Link to="/employer/candidates" className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-blue-50">
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {topJobs.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có hồ sơ nào cần xem</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topJobs.map((job) => {
            const newCount = (job.stats?.UNREAD || 0) + (job.stats?.APPLIED || 0);
            const initial = (job.title || 'J').trim().charAt(0).toUpperCase();
            return (
              <button
                key={job.jobId}
                onClick={() => navigate(`/employer/candidates?jobId=${job.jobId}`)}
                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer group text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center font-black text-primary text-sm shadow-sm shrink-0 overflow-hidden">
                  {job.company?.avatarUrl ? (
                    <img src={job.company.avatarUrl} alt={job.title} className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                    {job.applicationCount} hồ sơ · {job.stats?.HIRED || 0} đã tuyển
                  </p>
                </div>
                {newCount > 0 && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full shrink-0">
                    {newCount} mới
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Link
        to="/employer/candidates"
        className="flex items-center justify-center w-full mt-4 py-3.5 text-sm font-bold text-primary bg-blue-50/50 rounded-xl hover:bg-blue-100/50 transition-all border border-blue-100/50"
      >
        Xem toàn bộ hồ sơ
      </Link>
    </div>
  );
};

// ─ ServiceCostChart ─────────────────────────
const ServiceCostChart = ({ analytics }) => {
  const chartData = analytics?.transactionsByMonth || [];
  const hasData = chartData.some(d => d['Chi tiêu'] > 0);
  const totalSpend = chartData.reduce((s, d) => s + (d['Chi tiêu'] || 0), 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="mb-4 relative z-10 flex items-start justify-between">
        <div>
          <h3 className="font-black text-slate-900 text-base tracking-tight">Chi tiêu dịch vụ</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">6 tháng gần nhất</p>
        </div>
        {totalSpend > 0 && (
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            Tổng: {new Intl.NumberFormat('vi-VN').format(totalSpend)}đ
          </span>
        )}
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barCategoryGap="30%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}Tr` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}
              formatter={(v) => [new Intl.NumberFormat('vi-VN').format(v) + 'đ', 'Chi tiêu']}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="Chi tiêu" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Activity className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm font-medium">Chưa có giao dịch nào</p>
        </div>
      )}

      <Link to="/employer/transactions" className="flex items-center justify-center gap-1.5 mt-4 text-xs font-bold text-primary hover:underline">
        Xem lịch sử giao dịch <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

// ─── MySubscriptionsWidget ─────────────────────────────
const MySubscriptionsWidget = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/employer/my-subscriptions', { params: { status: 'ACTIVE', limit: 3 } })
      .then(r => {
        if (r.data?.success) {
          setSubs(r.data.data || []);
          setTotal(r.data.pagination?.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">Gói đang dùng</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {loading ? 'Đang tải...' : total > 0 ? `${total} gói đang hoạt động` : 'Chưa có gói nào'}
            </p>
          </div>
        </div>
        <Link
          to="/employer/my-subscriptions"
          className="text-primary text-xs font-bold hover:underline flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full"
        >
          Xem tất cả <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div className="text-center py-6 rounded-xl border border-dashed border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Bạn chưa có gói nào đang dùng</p>
          <Link to="/employer/packages" className="inline-block mt-3 text-xs font-bold text-primary hover:underline">
            Khám phá gói ngay →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {subs.map(sub => {
            const pkg = sub.packageId;
            const daysRemaining = sub.daysRemaining;
            const isCritical = daysRemaining !== null && daysRemaining <= 3;
            return (
              <Link
                key={sub._id}
                to="/employer/my-subscriptions"
                className="block p-3 rounded-xl border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {pkg?.name || sub.packageCode}
                      </p>
                    </div>
                    {sub.targetTitle && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {sub.targetType === 'JOB' ? '📌' : '📄'} {sub.targetTitle}
                      </p>
                    )}
                  </div>
                  {daysRemaining !== null && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isCritical ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {daysRemaining}d
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export {
  WarningBanner,
  StatsGrid,
  ApplicationTrend,
  AttentionJobs,
  RecruitmentFunnel,
  NewApplicants,
  ServiceCostChart,
  MySubscriptionsWidget,
};