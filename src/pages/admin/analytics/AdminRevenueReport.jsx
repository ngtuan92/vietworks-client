import React, { useState } from 'react';

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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Báo cáo Doanh thu
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Thống kê doanh thu theo thời gian</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#c2c6d4] text-sm font-medium"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="bg-[#0056b3] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#0056b3]/90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-6 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Tổng doanh thu</span>
          </div>
          <p className="text-3xl font-black">{formatPrice(MOCK_REVENUE.summary.totalRevenue)}</p>
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
          <p className="text-2xl font-black text-emerald-600">{formatPrice(MOCK_REVENUE.summary.totalDeposits)}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">{MOCK_REVENUE.summary.depositCount} giao dịch</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-indigo-600">payments</span>
            </div>
            <span className="text-sm font-bold text-[#5e5e62] uppercase tracking-wider">Thanh toán</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{formatPrice(MOCK_REVENUE.summary.totalPayments)}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">{MOCK_REVENUE.summary.paymentCount} giao dịch</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-amber-600">receipt_long</span>
            </div>
            <span className="text-sm font-bold text-[#5e5e62] uppercase tracking-wider">Tổng giao dịch</span>
          </div>
          <p className="text-2xl font-black text-amber-600">{MOCK_REVENUE.summary.transactionCount}</p>
          <p className="mt-2 text-xs text-[#5e5e62]">Đã hoàn thành</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#1b1c1c]">Doanh thu theo tháng</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span className="text-xs font-medium text-[#5e5e62]">Tiền nạp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-500"></div>
                <span className="text-xs font-medium text-[#5e5e62]">Thanh toán</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {MOCK_REVENUE.monthlyData.map((m) => {
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
                  <span className="text-xs font-bold text-[#5e5e62] uppercase">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Role */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#c2c6d4]/50">
          <h3 className="font-bold text-[#1b1c1c] mb-6">Doanh thu theo vai trò</h3>
          <div className="space-y-4">
            {Object.entries(MOCK_REVENUE.revenueByRole).map(([role, amount]) => {
              const percentage = (amount / MOCK_REVENUE.summary.totalRevenue) * 100;
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

          <div className="mt-6 pt-4 border-t border-[#c2c6d4]/30">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-[#5e5e62]">Tổng cộng</span>
              <span className="font-black text-[#0056b3]">{formatPrice(MOCK_REVENUE.summary.totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-[#c2c6d4]/50 overflow-hidden">
        <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
          <h3 className="font-bold text-[#1b1c1c]">Giao dịch gần đây</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3f3] border-b border-[#c2c6d4]">
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Tháng</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Tiền nạp</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Thanh toán</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Số GD nạp</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Số GD thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REVENUE.monthlyData.map((m) => (
              <tr key={m.month} className="border-b border-[#c2c6d4]/30 hover:bg-[#f5f3f3]/50">
                <td className="py-4 px-4 font-bold text-[#1b1c1c]">
                  {new Date(m.month + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </td>
                <td className="py-4 px-4 font-black text-emerald-600">{formatPrice(m.deposits)}</td>
                <td className="py-4 px-4 font-black text-indigo-600">{formatPrice(m.payments)}</td>
                <td className="py-4 px-4 text-center font-bold">{m.depositsCount}</td>
                <td className="py-4 px-4 text-center font-bold">{m.paymentsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRevenueReport;