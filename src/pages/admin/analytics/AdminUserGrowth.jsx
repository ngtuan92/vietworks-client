import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, SelectField } from '../shared/AdminPrimitives';
import { Users, User, Building2, BarChart2, Table, TrendingUp, TrendingDown } from 'lucide-react';

const AdminUserGrowth = () => {
  const [dateRange, setDateRange] = useState('year');
  const [viewMode, setViewMode] = useState('chart');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics/user-growth', { params: { range: dateRange } })
      .then(r => { if (r.data.success) setData(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[#0056b3] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const maxTotal = Math.max(...(data.growthData || []).map((d) => d.total));

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
          <p className="text-3xl font-black">{data.summary.totalUsers.toLocaleString()}</p>
        </div>

        <SectionCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ứng viên</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{data.summary.byRole.JOBSEEKER.toLocaleString()}</p>
          <div className="mt-2 w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${(data.summary.byRole.JOBSEEKER / data.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-[#5e5e62]">
            {((data.summary.byRole.JOBSEEKER / data.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nhà tuyển dụng</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{data.summary.byRole.EMPLOYER.toLocaleString()}</p>
          <div className="mt-2 w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${(data.summary.byRole.EMPLOYER / data.summary.totalUsers) * 100}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-[#5e5e62]">
            {((data.summary.byRole.EMPLOYER / data.summary.totalUsers) * 100).toFixed(1)}%
          </p>
        </SectionCard>
      </div>

      {viewMode === 'chart' ? (
      <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[#1b1c1c]">Tăng trưởng người dùng mới theo tháng</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#0056b3]"></div>
              <span className="text-xs font-medium text-[#5e5e62]">Ứng viên</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-400"></div>
              <span className="text-xs font-medium text-[#5e5e62]">Nhà tuyển dụng</span>
            </div>
          </div>
        </div>

        <div className="h-72 flex items-end justify-between gap-2 px-4">
          {data.growthData.map((d, idx) => {
            const monthLabel = new Date(d.date + '-01').toLocaleDateString('vi-VN', { month: 'short' });
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="w-full flex items-end justify-center gap-0.5 h-56">
                  <div
                    className="w-5 bg-[#0056b3]/70 hover:bg-[#0056b3] rounded-t-sm transition-all cursor-pointer"
                    style={{ height: `${(d.JOBSEEKER / maxTotal) * 100}%` }}
                  ></div>
                  <div
                    className="w-5 bg-indigo-400 hover:bg-indigo-600 rounded-t-sm transition-all cursor-pointer"
                    style={{ height: `${(d.EMPLOYER / maxTotal) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-[#5e5e62] uppercase">{monthLabel}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-[#1b1c1c] text-white text-[10px] rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  <div className="font-bold mb-1">{monthLabel} {d.date.split('-')[0]}</div>
                  <div>Ứng viên: <span className="text-[#0056b3]">{d.JOBSEEKER}</span></div>
                  <div>Nhà tuyển dụng: <span className="text-indigo-400">{d.EMPLOYER}</span></div>
                  <div className="font-black border-t border-white/20 pt-1 mt-1">Tổng: {d.total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
              {data.growthData.map((d, idx) => {
                const prevTotal = idx > 0 ? data.growthData[idx - 1].total : d.total;
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
