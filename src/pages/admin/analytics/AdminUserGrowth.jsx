import { BarChart2, Table, Users, User, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import React, { useState } from 'react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  ActionButton,
  SelectField
} from '../shared/AdminPrimitives';

const MOCK_USER_GROWTH = {
  summary: {
    totalUsers: 15240,
    byRole: {
      JOBSEEKER: 12480,
      EMPLOYER: 2760,
      ADMIN: 0,
    },
    byStatus: {
      ACTIVE: 12890,
      UNVERIFIED: 2150,
    },
  },
  growthData: [
    { date: '2024-01', JOBSEEKER: 150, EMPLOYER: 45, ADMIN: 2, total: 197 },
    { date: '2024-02', JOBSEEKER: 180, EMPLOYER: 52, ADMIN: 1, total: 233 },
    { date: '2024-03', JOBSEEKER: 220, EMPLOYER: 68, ADMIN: 3, total: 291 },
    { date: '2024-04', JOBSEEKER: 195, EMPLOYER: 55, ADMIN: 2, total: 252 },
    { date: '2024-05', JOBSEEKER: 240, EMPLOYER: 72, ADMIN: 1, total: 313 },
    { date: '2024-06', JOBSEEKER: 280, EMPLOYER: 85, ADMIN: 2, total: 367 },
    { date: '2024-07', JOBSEEKER: 310, EMPLOYER: 92, ADMIN: 3, total: 405 },
    { date: '2024-08', JOBSEEKER: 325, EMPLOYER: 88, ADMIN: 2, total: 415 },
    { date: '2024-09', JOBSEEKER: 340, EMPLOYER: 95, ADMIN: 1, total: 436 },
    { date: '2024-10', JOBSEEKER: 355, EMPLOYER: 102, ADMIN: 2, total: 459 },
    { date: '2024-11', JOBSEEKER: 380, EMPLOYER: 110, ADMIN: 2, total: 492 },
    { date: '2024-12', JOBSEEKER: 420, EMPLOYER: 125, ADMIN: 3, total: 548 },
  ],
};

const AdminUserGrowth = () => {
  const [dateRange, setDateRange] = useState('year');
  const [viewMode, setViewMode] = useState('chart');

  const maxTotal = Math.max(...MOCK_USER_GROWTH.growthData.map((d) => d.total));

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Thống kê Tăng trưởng Người dùng"
        description="Phân tích sự tăng trưởng người dùng theo thời gian thực"
        actions={
          <div className="flex items-center gap-3">
            <div className="w-48">
              <SelectField
                label=""
                value={dateRange}
                onChange={setDateRange}
                options={[['30days', '30 ngày qua'], ['90days', '90 ngày qua'], ['year', 'Năm nay'], ['all', 'Tất cả']]}
              />
            </div>
            <div className="flex rounded-xl p-1 bg-slate-100 shadow-inner">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${viewMode === 'chart' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary to-blue-800 p-6 rounded-[1.5rem] text-white shadow-soft hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Tổng người dùng</span>
          </div>
          <p className="text-3xl font-black">{MOCK_USER_GROWTH.summary.totalUsers.toLocaleString()}</p>
        </div>

        <SectionCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ứng viên</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{MOCK_USER_GROWTH.summary.byRole.JOBSEEKER.toLocaleString()}</p>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(MOCK_USER_GROWTH.summary.byRole.JOBSEEKER / MOCK_USER_GROWTH.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
            {((MOCK_USER_GROWTH.summary.byRole.JOBSEEKER / MOCK_USER_GROWTH.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nhà tuyển dụng</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{MOCK_USER_GROWTH.summary.byRole.EMPLOYER.toLocaleString()}</p>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${(MOCK_USER_GROWTH.summary.byRole.EMPLOYER / MOCK_USER_GROWTH.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
            {((MOCK_USER_GROWTH.summary.byRole.EMPLOYER / MOCK_USER_GROWTH.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </SectionCard>
      </div>

      {viewMode === 'chart' ? (
        <SectionCard>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900">Tăng trưởng người dùng mới theo tháng</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ứng viên</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-400"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nhà tuyển dụng</span>
              </div>
            </div>
          </div>

          <div className="h-72 flex items-end justify-between gap-3 px-4 border-b border-slate-100 pb-4">
            {MOCK_USER_GROWTH.growthData.map((d, idx) => {
              const monthLabel = new Date(d.date + '-01').toLocaleDateString('vi-VN', { month: 'short' });
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="w-full flex items-end justify-center gap-1 h-56">
                    <div
                      className="w-6 bg-blue-500/80 hover:bg-blue-600 rounded-t-sm transition-all cursor-pointer relative"
                      style={{ height: `${(d.JOBSEEKER / maxTotal) * 100}%` }}
                    ></div>
                    <div
                      className="w-6 bg-indigo-400/80 hover:bg-indigo-500 rounded-t-sm transition-all cursor-pointer relative"
                      style={{ height: `${(d.EMPLOYER / maxTotal) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 transition-colors">{monthLabel}</span>

                  <div className="absolute bottom-full mb-3 bg-slate-900 text-white text-[11px] rounded-xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
                    <div className="font-black mb-2 text-sm">{monthLabel} 2024</div>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-slate-300 font-medium">Ứng viên</span>
                      <span className="font-bold text-blue-400">{d.JOBSEEKER}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-slate-300 font-medium">Nhà tuyển dụng</span>
                      <span className="font-bold text-indigo-400">{d.EMPLOYER}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 font-black border-t border-slate-700 pt-2 mt-2 text-sm">
                      <span className="text-white">Tổng cộng</span>
                      <span className="text-white">{d.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <SectionCard className="p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tháng</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ứng viên</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nhà tuyển dụng</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng mới</th>
                <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USER_GROWTH.growthData.map((d, idx) => {
                const prevTotal = idx > 0 ? MOCK_USER_GROWTH.growthData[idx - 1].total : d.total;
                const growth = ((d.total - prevTotal) / prevTotal) * 100;
                const monthLabel = new Date(d.date + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

                return (
                  <tr key={d.date} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{monthLabel}</td>
                    <td className="py-4 px-6 text-blue-600 font-black">{d.JOBSEEKER}</td>
                    <td className="py-4 px-6 text-indigo-600 font-black">{d.EMPLOYER}</td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{d.ADMIN}</td>
                    <td className="py-4 px-6 font-black text-slate-900">{d.total}</td>
                    <td className="py-4 px-6">
                      {idx > 0 && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>
      )}
    </div>
  );
};

export default AdminUserGrowth;
