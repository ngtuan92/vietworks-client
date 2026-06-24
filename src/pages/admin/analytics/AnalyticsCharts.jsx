import React, { useEffect, useState } from 'react';
import { FiBriefcase, FiFileText, FiUserCheck, FiTrendingUp, FiActivity } from 'react-icons/fi';
import adminService from '../../../services/adminService';

const STATUS_LABELS = {
  // Job
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  PUBLISHED: 'Đã đăng',
  EXPIRED: 'Hết hạn',
  CLOSED: 'Đã đóng',
  REJECTED: 'Bị từ chối',
  BANNED: 'Bị khóa',
  // Application
  UNREAD: 'Chưa đọc',
  APPLIED: 'Đã ứng tuyển',
  VIEWED: 'Đã xem',
  APPROVED: 'Đã duyệt',
  HIRED: 'Đã tuyển',
  REJECTED: 'Bị từ chối'
};

const STATUS_COLORS = {
  DRAFT: '#94a3b8',
  PENDING_APPROVAL: '#f59e0b',
  PUBLISHED: '#10b981',
  EXPIRED: '#64748b',
  CLOSED: '#475569',
  REJECTED: '#ef4444',
  BANNED: '#dc2626',
  UNREAD: '#94a3b8',
  APPLIED: '#3b82f6',
  VIEWED: '#8b5cf6',
  APPROVED: '#10b981',
  HIRED: '#059669',
  REJECTED_APP: '#ef4444'
};

const formatNumber = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const DateRangePicker = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="date"
      value={value.startDate}
      onChange={(e) => onChange({ ...value, startDate: e.target.value })}
      className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none"
    />
    <span className="text-slate-400">→</span>
    <input
      type="date"
      value={value.endDate}
      onChange={(e) => onChange({ ...value, endDate: e.target.value })}
      className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 outline-none"
    />
  </div>
);

const AnalyticsCharts = () => {
  const [range, setRange] = useState({ startDate: '', endDate: '' });
  const [jobs, setJobs] = useState(null);
  const [apps, setApps] = useState(null);
  const [hiring, setHiring] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {
        ...(range.startDate && { startDate: range.startDate }),
        ...(range.endDate && { endDate: range.endDate })
      };
      const [j, a, h] = await Promise.all([
        adminService.getJobAnalytics(params),
        adminService.getApplicationAnalytics(params),
        adminService.getHiringSuccess(params)
      ]);
      setJobs(j);
      setApps(a);
      setHiring(h);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [range.startDate, range.endDate]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            Analytics hệ thống
          </h2>
          <p className="text-sm text-slate-500 mt-1">Jobs · Applications · Hiring Success</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* ─── Top metric cards ─── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          loading={loading}
          label="Tổng số Job"
          value={jobs?.summary.totalJobs}
          icon={FiBriefcase}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          sub={`${formatNumber(jobs?.summary.byStatus?.PUBLISHED)} đã đăng · ${formatNumber(jobs?.summary.byStatus?.PENDING_APPROVAL)} chờ duyệt`}
          trend={`${jobs?.summary.publishedRate || 0}% đã publish`}
        />
        <MetricCard
          loading={loading}
          label="Tổng Application"
          value={apps?.summary.totalApplications}
          icon={FiFileText}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          sub={`${formatNumber(apps?.summary.byStatus?.APPROVED)} duyệt · ${formatNumber(apps?.summary.byStatus?.HIRED)} tuyển`}
          trend={`${apps?.summary.reviewedRate || 0}% đã review`}
        />
        <MetricCard
          loading={loading}
          label="Tỷ lệ tuyển thành công"
          value={hiring?.summary.successRate != null ? `${hiring.summary.successRate}%` : '--'}
          icon={FiUserCheck}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          sub={`${formatNumber(hiring?.summary.successCount)} hồ sơ đạt`}
          trend={`${hiring?.summary.viewedRate || 0}% đã review`}
        />
      </div>

      {/* ─── Jobs by status + Applications by status ─── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Job theo trạng thái" description="Phân bổ Job trong hệ thống">
          {loading ? <Skeleton /> : <StatusBreakdown data={jobs?.summary.byStatus} />}
        </SectionCard>

        <SectionCard title="Application theo trạng thái" description="Phễu chuyển đổi ứng viên">
          {loading ? <Skeleton /> : <StatusBreakdown data={apps?.summary.byStatus} />}
        </SectionCard>
      </div>

      {/* ─── Top jobs + Top companies ─── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top Job nhận nhiều application" description="Job hot nhất">
          {loading ? <Skeleton /> : (
            <TopList items={apps?.topJobs} valueKey="applicationCount" labelKey="title" emptyText="Chưa có dữ liệu" />
          )}
        </SectionCard>

        <SectionCard title="Top Công ty nhận nhiều application" description="Công ty tuyển nhiều nhất">
          {loading ? <Skeleton /> : (
            <TopList items={apps?.topCompanies} valueKey="applicationCount" labelKey="name" emptyText="Chưa có dữ liệu" />
          )}
        </SectionCard>
      </div>

      {/* ─── Hiring success breakdown ─── */}
      <SectionCard title="Phễu tuyển dụng" description="Tỷ lệ chuyển đổi qua từng giai đoạn">
        {loading ? <Skeleton /> : <HiringFunnel data={hiring?.summary} />}
      </SectionCard>
    </div>
  );
};

const MetricCard = ({ loading, label, value, icon: Icon, iconBg, iconColor, sub, trend }) => (
  <article className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <h4 className="font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent text-3xl">
          {loading ? '--' : (value ?? '--')}
        </h4>
      </div>
      <div className={`p-3 border rounded-xl ${iconBg} ${iconColor}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <p className="text-xs font-bold text-slate-500">{loading ? 'Đang tải...' : sub}</p>
    {!loading && trend && (
      <p className="text-[10px] mt-1 text-emerald-600 font-bold inline-flex items-center gap-1">
        <FiTrendingUp className="w-3 h-3" /> {trend}
      </p>
    )}
  </article>
);

const SectionCard = ({ title, description, children }) => (
  <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
    <div className="mb-5">
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
    </div>
    {children}
  </section>
);

const StatusBreakdown = ({ data = {} }) => {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) {
    return <EmptyState text="Chưa có dữ liệu" />;
  }
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="space-y-3">
      {entries
        .sort(([, a], [, b]) => b - a)
        .map(([status, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          const color = STATUS_COLORS[status] || '#94a3b8';
          return (
            <div key={status}>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {STATUS_LABELS[status] || status}
                </span>
                <span>{formatNumber(count)} · {pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};

const TopList = ({ items = [], valueKey, labelKey, emptyText }) => {
  if (!items.length) return <EmptyState text={emptyText} />;
  const max = Math.max(...items.map(i => i[valueKey] || 0));
  return (
    <ol className="space-y-3">
      {items.map((item, idx) => {
        const val = item[valueKey] || 0;
        const pct = max > 0 ? (val / max) * 100 : 0;
        return (
          <li key={idx} className="flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{item[labelKey] || '(không tên)'}</p>
              <div className="mt-1 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="text-sm font-black text-slate-900 ml-2">{formatNumber(val)}</span>
          </li>
        );
      })}
    </ol>
  );
};

const HiringFunnel = ({ data }) => {
  if (!data) return <EmptyState text="Chưa có dữ liệu" />;
  const stages = [
    { key: 'totalApplications', label: 'Tổng ứng tuyển', color: '#3b82f6' },
    { key: 'viewed',            label: 'Đã review',       color: '#8b5cf6' },
    { key: 'approved',          label: 'Đã duyệt',        color: '#10b981' },
    { key: 'hired',             label: 'Đã tuyển',        color: '#059669' }
  ];
  const max = data.totalApplications || 1;
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const val = data[s.key] || 0;
        const pct = (val / max) * 100;
        const dropFromPrev = i > 0 ? (data[stages[i - 1].key] || 0) - val : 0;
        return (
          <div key={s.key}>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span>
                {formatNumber(val)} ({pct.toFixed(1)}%)
                {i > 0 && dropFromPrev > 0 && (
                  <span className="text-rose-500 ml-2">−{formatNumber(dropFromPrev)}</span>
                )}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: s.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="py-8 text-center text-slate-400 text-sm font-medium">{text}</div>
);

const Skeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-8 bg-slate-100 rounded-lg" />
    ))}
  </div>
);

export default AnalyticsCharts;