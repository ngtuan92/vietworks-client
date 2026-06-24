import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, SelectField, ActionButton } from '../shared/AdminPrimitives';
import { WalletCards } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminRevenueReport = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/revenue-report', { params: { range: dateRange } })
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

  const maxRevenue = Math.max(
    ...(data.monthlyData || []).map((m) => Math.max(m.deposits || 0, m.payments || 0))
  );

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Báo cáo Doanh thu"
        description="Thống kê doanh thu chi tiết theo thời gian"
        actions={
          <div className="flex items-center gap-3">
            <div className="w-48">
              <SelectField
                label=""
                value={dateRange}
                onChange={setDateRange}
                options={[['7days', '7 ngày qua'], ['30days', '30 ngày qua'], ['90days', '90 ngày qua'], ['year', 'Năm nay']]}
              />
            </div>
            <ActionButton tone="primary">Xuất báo cáo</ActionButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-blue-800 p-6 rounded-[1.5rem] text-white shadow-soft hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <WalletCards className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Tổng doanh thu</span>
          </div>
          <p className="text-3xl font-black">{formatPrice(data.summary.totalRevenue)}</p>
          <div className="mt-3 flex items-center gap-1 text-sm text-blue-200">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Tăng 15% so với tháng trước
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-emerald-600">add_card</span>
            </div>
            <span className="text-sm font-bold text-[#5e5e62] uppercase tracking-wider">Tiền nạp</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatPrice(data.summary.totalDeposits)}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">{data.summary.depositCount} giao dịch</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-indigo-600">payments</span>
            </div>
            <span className="text-sm font-bold text-[#5e5e62] uppercase tracking-wider">Thanh toán</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{formatPrice(data.summary.totalPayments)}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">{data.summary.paymentCount} giao dịch</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-amber-600">receipt_long</span>
            </div>
            <span className="text-sm font-bold text-[#5e5e62] uppercase tracking-wider">Tổng giao dịch</span>
          </div>
          <p className="text-2xl font-black text-amber-600">{data.summary.transactionCount}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">Đã hoàn thành</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SectionCard className="h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-slate-900">Doanh thu theo tháng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiền nạp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thanh toán</span>
                </div>
              </div>
            </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {(data.monthlyData || []).map((m) => {
              const monthLabel = new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end gap-1 justify-center h-48">
                    <div
                      className="w-8 bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600 relative"
                      style={{ height: `${(m.deposits / maxRevenue) * 100}%` }}
                      title={formatPrice(m.deposits)}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 whitespace-nowrap">
                        {formatPrice(m.deposits)}
                      </div>
                    </div>
                    <div
                      className="w-8 bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600 relative"
                      style={{ height: `${(m.payments / maxRevenue) * 100}%` }}
                      title={formatPrice(m.payments)}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 whitespace-nowrap">
                        {formatPrice(m.payments)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{monthLabel}</span>
                </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Revenue by Role */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <h3 className="font-bold text-[#1b1c1c] mb-6">Doanh thu theo vai trò</h3>
          <div className="space-y-4">
            {Object.entries(data.revenueByRole || {}).map(([role, amount]) => {
              const percentage = (amount / data.summary.totalRevenue) * 100;
              const colors = {
                JOBSEEKER: { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Ứng viên' },
                EMPLOYER: { bg: 'bg-indigo-500', text: 'text-indigo-600', label: 'Nhà tuyển dụng' },
                ADMIN: { bg: 'bg-[#0056b3]/20', text: 'text-[#0056b3]', label: 'Quản trị' },
              };
              const config = colors[role] || colors.JOBSEEKER;
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-bold ${config.text}`}>{config.label}</span>
                    <span className="font-black text-[#1b1c1c]">{formatPrice(amount)}</span>
                  </div>
                  <div className="w-full h-3 bg-[#f5f3f3] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config.bg} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#727784] mt-0.5">
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SectionCard title="Giao dịch gần đây" className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tháng</th>
              <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiền nạp</th>
              <th className="text-left py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thanh toán</th>
              <th className="text-center py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số GD nạp</th>
              <th className="text-center py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số GD thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {(data.monthlyData || []).map((m) => (
              <tr key={m.month} className="border-b border-[#c2c6d4]/30 hover:bg-[#f5f3f3]/50">
                <td className="py-4 px-4 font-bold text-[#1b1c1c]">
                  {new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </td>
                <td className="py-4 px-6 font-black text-blue-600">{formatPrice(m.deposits)}</td>
                <td className="py-4 px-6 font-black text-indigo-600">{formatPrice(m.payments)}</td>
                <td className="py-4 px-6 text-center font-bold text-slate-700">{m.depositsCount}</td>
                <td className="py-4 px-6 text-center font-bold text-slate-700">{m.paymentsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
};

export default AdminRevenueReport;
