import React, { useState } from 'react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  ActionButton,
  SelectField
} from '../shared/AdminPrimitives';
import { WalletCards, CreditCard, Receipt, TrendingUp } from 'lucide-react';

const MOCK_REVENUE = {
  summary: {
    totalRevenue: 15890000,
    totalDeposits: 12000000,
    totalPayments: 3890000,
    depositCount: 24,
    paymentCount: 18,
    transactionCount: 42,
  },
  revenueByRole: {
    JOBSEEKER: 4200000,
    EMPLOYER: 11690000,
    ADMIN: 0,
  },
  monthlyData: [
    { month: '2024-01', deposits: 5000000, payments: 1200000, depositsCount: 8, paymentsCount: 5 },
    { month: '2024-02', deposits: 3500000, payments: 890000, depositsCount: 6, paymentsCount: 4 },
    { month: '2024-03', deposits: 3500000, payments: 1800000, depositsCount: 10, paymentsCount: 9 },
  ],
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminRevenueReport = () => {
  const [dateRange, setDateRange] = useState('30days');

  const maxRevenue = Math.max(
    ...MOCK_REVENUE.monthlyData.map((m) => Math.max(m.deposits, m.payments))
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
          <p className="text-3xl font-black">{formatPrice(MOCK_REVENUE.summary.totalRevenue)}</p>
          <div className="mt-3 flex items-center gap-1.5 text-sm font-bold text-blue-200">
            <TrendingUp className="w-4 h-4" />
            Tăng 15% so với tháng trước
          </div>
        </div>

        <StatCard icon={<WalletCards className="w-6 h-6" />} label="Tiền nạp" value={formatPrice(MOCK_REVENUE.summary.totalDeposits)} tone="blue" />
        <StatCard icon={<CreditCard className="w-6 h-6" />} label="Thanh toán" value={formatPrice(MOCK_REVENUE.summary.totalPayments)} tone="indigo" />
        <StatCard icon={<Receipt className="w-6 h-6" />} label="Tổng giao dịch" value={MOCK_REVENUE.summary.transactionCount} tone="emerald" />
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
            <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-slate-100 pb-4">
              {MOCK_REVENUE.monthlyData.map((m) => {
                const monthLabel = new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full flex items-end gap-1.5 justify-center h-48">
                      <div
                        className="w-10 bg-blue-500/90 rounded-t-sm transition-all hover:bg-blue-600 relative group cursor-pointer"
                        style={{ height: `${(m.deposits / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                          {formatPrice(m.deposits)}
                        </div>
                      </div>
                      <div
                        className="w-10 bg-indigo-500/90 rounded-t-sm transition-all hover:bg-indigo-600 relative group cursor-pointer"
                        style={{ height: `${(m.payments / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
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

        <div className="lg:col-span-4">
          <SectionCard className="h-full">
            <h3 className="font-black text-slate-900 mb-8">Doanh thu theo vai trò</h3>
            <div className="space-y-6">
              {Object.entries(MOCK_REVENUE.revenueByRole).map(([role, amount]) => {
                const percentage = (amount / MOCK_REVENUE.summary.totalRevenue) * 100;
                const colors = {
                  JOBSEEKER: { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Ứng viên' },
                  EMPLOYER: { bg: 'bg-indigo-500', text: 'text-indigo-600', label: 'Nhà tuyển dụng' },
                  ADMIN: { bg: 'bg-slate-300', text: 'text-slate-500', label: 'Quản trị' },
                };
                const config = colors[role] || colors.JOBSEEKER;
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-bold uppercase tracking-wider text-[11px] ${config.text}`}>{config.label}</span>
                      <span className="font-black text-slate-900">{formatPrice(amount)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.bg} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Tổng cộng</span>
                <span className="font-black text-primary text-xl">{formatPrice(MOCK_REVENUE.summary.totalRevenue)}</span>
              </div>
            </div>
          </SectionCard>
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
            {MOCK_REVENUE.monthlyData.map((m) => (
              <tr key={m.month} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">
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
