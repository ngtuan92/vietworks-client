import { Receipt, CheckCircle2, CreditCard, Eye, X, Search, WalletCards, RotateCcw, Landmark } from 'lucide-react';
import React, { useState } from 'react';

const MOCK_TRANSACTIONS = [
  {
    _id: 'tx1',
    userId: { fullName: 'Trần Thị Lan', email: 'lan.tran@company.com', role: 'EMPLOYER' },
    type: 'DEPOSIT',
    amount: 2990000,
    currency: 'VND',
    status: 'SUCCESS',
    description: 'Nạp tiền qua PayOS - 2990000 VND',
    paymentMethod: 'PAYTOS',
    payosTransactionId: 'PAY123456',
    createdAt: '2024-03-25T14:30:00Z',
  },
  {
    _id: 'tx2',
    userId: { fullName: 'Nguyễn Văn Minh', email: 'minh.nguyen@email.com', role: 'JOBSEEKER' },
    type: 'PAYMENT',
    amount: 990000,
    currency: 'VND',
    status: 'SUCCESS',
    description: 'Mua gói Cơ Bản',
    paymentMethod: 'PAYTOS',
    packageId: { name: 'Gói Cơ Bản', price: 990000 },
    createdAt: '2024-03-24T10:15:00Z',
  },
  {
    _id: 'tx3',
    userId: { fullName: 'Công ty ABC', email: 'hr@abc-corp.vn', role: 'EMPLOYER' },
    type: 'DEPOSIT',
    amount: 5990000,
    currency: 'VND',
    status: 'PENDING',
    description: 'Nạp tiền qua PayOS - 5990000 VND',
    paymentMethod: 'PAYTOS',
    createdAt: '2024-03-25T16:00:00Z',
  },
  {
    _id: 'tx4',
    userId: { fullName: 'Lê Hoàng Nam', email: 'nam.le@startup.vn', role: 'EMPLOYER' },
    type: 'PAYMENT',
    amount: 2990000,
    currency: 'VND',
    status: 'FAILED',
    description: 'Thanh toán gói Pro - thất bại',
    paymentMethod: 'PAYTOS',
    createdAt: '2024-03-23T09:00:00Z',
  },
  {
    _id: 'tx5',
    userId: { fullName: 'Phạm Quốc Khánh', email: 'khanh.pham@mail.com', role: 'JOBSEEKER' },
    type: 'REFUND',
    amount: 500000,
    currency: 'VND',
    status: 'SUCCESS',
    description: 'Hoàn tiền gói Premium',
    paymentMethod: 'PAYTOS',
    createdAt: '2024-03-22T11:30:00Z',
  },
];

const typeConfig = {
  DEPOSIT: { label: 'Nạp tiền', bg: 'bg-blue-100', text: 'text-blue-700', icon: <WalletCards className="w-3.5 h-3.5" /> },
  PAYMENT: { label: 'Thanh toán', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <CreditCard className="w-3.5 h-3.5" /> },
  REFUND: { label: 'Hoàn tiền', bg: 'bg-blue-100', text: 'text-blue-800', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  WITHDRAW: { label: 'Rút tiền', bg: 'bg-blue-100', text: 'text-[#004491]', icon: <Landmark className="w-3.5 h-3.5" /> },
};

const statusConfig = {
  SUCCESS: { label: 'Thành công', bg: 'bg-blue-100', text: 'text-blue-700' },
  PENDING: { label: 'Đang chờ', bg: 'bg-blue-100', text: 'text-blue-800' },
  FAILED: { label: 'Thất bại', bg: 'bg-blue-50', text: 'text-[#001a40]' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-slate-200', text: 'text-slate-500' },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminTransactions = () => {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);

  const filteredTx = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      tx.userId.fullName.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const activeFilterCount = [search, filterType !== 'all', filterStatus !== 'all'].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterStatus('all');
  };

  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalPayments = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'PAYMENT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Quản lý Giao dịch
          </h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi tất cả giao dịch trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-blue-800 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-blue-200" />
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng giao dịch</span>
          </div>
          <p className="text-3xl font-black">{transactions.length}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-700 uppercase">Thành công</span>
          </div>
          <p className="text-3xl font-black text-blue-700">
            {transactions.filter((tx) => tx.status === 'SUCCESS').length}
          </p>
        </div>
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-slate-500 uppercase">Tổng nạp tiền</span>
          </div>
          <p className="text-2xl font-black text-primary">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-slate-500 uppercase">Tổng thanh toán</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{formatPrice(totalPayments)}</p>
        </div>
      </div>

      {/* Filters */}
      <section className="vw-card overflow-hidden rounded-[1.75rem]">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">Bộ lọc giao dịch</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Đang hiển thị <span className="font-black text-[#0056B3]">{filteredTx.length}</span> / {transactions.length} giao dịch
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0056B3] ring-1 ring-blue-100">
                {activeFilterCount} bộ lọc đang bật
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-[#0056B3]"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1.3fr_.85fr_.85fr] lg:items-end">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Tìm kiếm giao dịch</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0056B3]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email hoặc mô tả giao dịch..."
                className="vw-input h-12 pl-11 pr-4 text-sm font-semibold placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Loại giao dịch</label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="vw-input h-12 appearance-none cursor-pointer pr-10 text-sm font-bold text-slate-700"
              >
                <option value="all">Tất cả loại</option>
                <option value="DEPOSIT">Nạp tiền</option>
                <option value="PAYMENT">Thanh toán</option>
                <option value="REFUND">Hoàn tiền</option>
                <option value="WITHDRAW">Rút tiền</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="vw-input h-12 appearance-none cursor-pointer pr-10 text-sm font-bold text-slate-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Đang chờ</option>
                <option value="FAILED">Thất bại</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0056B3]">⌄</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="vw-card rounded-[1.5rem] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Mã GD</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Người dùng</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Loại</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Số tiền</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Ngày</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((tx) => {
              const type = typeConfig[tx.type] || typeConfig.PAYMENT;
              const status = statusConfig[tx.status] || statusConfig.PENDING;
              return (
                <tr key={tx._id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-bold text-primary">{tx._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{tx.userId.fullName}</p>
                    <p className="text-xs text-slate-500">{tx.userId.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${type.bg} ${type.text}`}>
                      {type.icon}
                      {type.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-black ${tx.status === 'SUCCESS' ? 'text-blue-700' : 'text-slate-500'}`}>
                      {formatPrice(tx.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTx.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-3 font-bold">Không có giao dịch nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Chi tiết giao dịch</h2>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-slate-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mã giao dịch</p>
                  <p className="font-mono font-bold text-primary">{selectedTx._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Loại giao dịch</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${typeConfig[selectedTx.type].bg} ${typeConfig[selectedTx.type].text}`}>
                    {typeConfig[selectedTx.type].label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Số tiền</p>
                  <p className="text-xl font-black text-blue-700">{formatPrice(selectedTx.amount)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[selectedTx.status].bg} ${statusConfig[selectedTx.status].text}`}>
                    {statusConfig[selectedTx.status].label}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Người dùng</p>
                <p className="font-bold text-slate-900">{selectedTx.userId.fullName}</p>
                <p className="text-sm text-slate-500">{selectedTx.userId.email}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mô tả</p>
                <p className="text-sm text-slate-900">{selectedTx.description}</p>
              </div>
              {selectedTx.payosTransactionId && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">PayOS Transaction ID</p>
                  <p className="font-mono text-sm text-slate-900">{selectedTx.payosTransactionId}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ngày tạo</p>
                <p className="text-sm text-slate-900">
                  {new Date(selectedTx.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200">
              <button onClick={() => setSelectedTx(null)} className="w-full py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;

