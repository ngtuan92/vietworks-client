import { BarChart2, Table, Users, User, Building2 } from 'lucide-react';
import React, { useState } from 'react';

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
    { date: '2024-11', JOBSEEPER: 380, EMPLOYER: 110, ADMIN: 2, total: 492 },
    { date: '2024-12', JOBSEEKER: 420, EMPLOYER: 125, ADMIN: 3, total: 548 },
  ],
};

const AdminUserGrowth = () => {
  const [dateRange, setDateRange] = useState('year');
  const [viewMode, setViewMode] = useState('chart');

  const maxTotal = Math.max(...MOCK_USER_GROWTH.growthData.map((d) => d.total));

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Thống kê Tăng trưởng Người dùng
          </h2>
          <p className="text-sm text-slate-500 mt-1">Phân tích sự tăng trưởng người dùng theo thời gian</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-slate-200/80 text-sm font-medium"
          >
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="year">Năm nay</option>
            <option value="all">Tất cả</option>
          </select>
          <div className="flex rounded-2xl border border-slate-200/80 overflow-hidden">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 text-sm font-bold transition-all ${viewMode === 'chart' ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <BarChart2 className="w-5 h-5 " />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <Table className="w-5 h-5 " />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 " />
            </div>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Tổng người dùng</span>
          </div>
          <p className="text-3xl font-black">{MOCK_USER_GROWTH.summary.totalUsers.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200/80 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-700" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ứng viên</span>
          </div>
          <p className="text-2xl font-black text-blue-700">{MOCK_USER_GROWTH.summary.byRole.JOBSEEKER.toLocaleString()}</p>
          <div className="mt-2 w-full h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(MOCK_USER_GROWTH.summary.byRole.JOBSEEKER / MOCK_USER_GROWTH.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {((MOCK_USER_GROWTH.summary.byRole.JOBSEEKER / MOCK_USER_GROWTH.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200/80 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nhà tuyển dụng</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{MOCK_USER_GROWTH.summary.byRole.EMPLOYER.toLocaleString()}</p>
          <div className="mt-2 w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${(MOCK_USER_GROWTH.summary.byRole.EMPLOYER / MOCK_USER_GROWTH.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {((MOCK_USER_GROWTH.summary.byRole.EMPLOYER / MOCK_USER_GROWTH.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </div>


      </div>

      {/* Growth Chart */}
      <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900">Tăng trưởng người dùng mới theo tháng</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-xs font-medium text-slate-500">Ứng viên</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-400"></div>
              <span className="text-xs font-medium text-slate-500">Nhà tuyển dụng</span>
            </div>
          </div>
        </div>

        <div className="h-72 flex items-end justify-between gap-2 px-4">
          {MOCK_USER_GROWTH.growthData.map((d, idx) => {
            const monthLabel = new Date(d.date + '-01').toLocaleDateString('vi-VN', { month: 'short' });
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="w-full flex items-end justify-center gap-0.5 h-56">
                  <div
                    className="w-5 bg-primary/70 hover:bg-primary rounded-t-sm transition-all cursor-pointer"
                    style={{ height: `${(d.JOBSEEKER / maxTotal) * 100}%` }}
                  ></div>
                  <div
                    className="w-5 bg-indigo-400 hover:bg-indigo-600 rounded-t-sm transition-all cursor-pointer"
                    style={{ height: `${(d.EMPLOYER / maxTotal) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{monthLabel}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-[#1b1c1c] text-white text-[10px] rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  <div className="font-bold mb-1">{monthLabel} 2024</div>
                  <div>Ứng viên: <span className="text-primary">{d.JOBSEEKER}</span></div>
                  <div>Nhà tuyển dụng: <span className="text-indigo-400">{d.EMPLOYER}</span></div>
                  <div className="font-black border-t border-white/20 pt-1 mt-1">Tổng: {d.total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="vw-card rounded-[1.5rem] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Tháng</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Ứng viên</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Nhà tuyển dụng</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Admin</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Tổng mới</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USER_GROWTH.growthData.map((d, idx) => {
                const prevTotal = idx > 0 ? MOCK_USER_GROWTH.growthData[idx - 1].total : d.total;
                const growth = ((d.total - prevTotal) / prevTotal) * 100;
                const monthLabel = new Date(d.date + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

                return (
                  <tr key={d.date} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="py-4 px-4 font-bold text-slate-900">{monthLabel}</td>
                    <td className="py-4 px-4 text-blue-700 font-bold">{d.JOBSEEKER}</td>
                    <td className="py-4 px-4 text-indigo-600 font-bold">{d.EMPLOYER}</td>
                    <td className="py-4 px-4 text-slate-500">{d.ADMIN}</td>
                    <td className="py-4 px-4 font-black text-slate-900">{d.total}</td>
                    <td className="py-4 px-4">
                      {idx > 0 && (
                        <span className={`flex items-center gap-1 ${growth >= 0 ? 'text-blue-700' : 'text-[#001a40]'}`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {growth >= 0 ? 'trending_up' : 'trending_down'}
                          </span>
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                        </span>
                      )}
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

export default AdminUserGrowth;


