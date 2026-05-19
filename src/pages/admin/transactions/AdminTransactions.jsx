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
  DEPOSIT: { label: 'Nạp tiền', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'add_card' },
  PAYMENT: { label: 'Thanh toán', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'payments' },
  REFUND: { label: 'Hoàn tiền', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'replay' },
  WITHDRAW: { label: 'Rút tiền', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'account_balance' },
};

const statusConfig = {
  SUCCESS: { label: 'Thành công', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  PENDING: { label: 'Đang chờ', bg: 'bg-amber-100', text: 'text-amber-700' },
  FAILED: { label: 'Thất bại', bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-[#c2c6d4]', text: 'text-[#5e5e62]' },
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

  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalPayments = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'PAYMENT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0056b3] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#0056b3] rounded-full"></span>
            Quản lý Giao dịch
          </h2>
          <p className="text-sm text-[#5e5e62] mt-1">Theo dõi tất cả giao dịch trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#0056b3] to-blue-800 p-5 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-200">receipt_long</span>
            <span className="text-sm font-bold text-blue-200 uppercase">Tổng giao dịch</span>
          </div>
          <p className="text-3xl font-black">{transactions.length}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-bold text-emerald-600 uppercase">Thành công</span>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {transactions.filter((tx) => tx.status === 'SUCCESS').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#0056b3]">add_card</span>
            <span className="text-sm font-bold text-[#5e5e62] uppercase">Tổng nạp tiền</span>
          </div>
          <p className="text-2xl font-black text-[#0056b3]">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#c2c6d4]/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-indigo-600">payments</span>
            <span className="text-sm font-bold text-[#5e5e62] uppercase">Tổng thanh toán</span>
          </div>
          <p className="text-2xl font-black text-indigo-600">{formatPrice(totalPayments)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#c2c6d4]/50 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#5e5e62]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, mô tả..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#c2c6d4] focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/10 outline-none"
            />
          </div>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
        >
          <option value="all">Tất cả loại</option>
          <option value="DEPOSIT">Nạp tiền</option>
          <option value="PAYMENT">Thanh toán</option>
          <option value="REFUND">Hoàn tiền</option>
          <option value="WITHDRAW">Rút tiền</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[#c2c6d4] text-sm font-medium"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="SUCCESS">Thành công</option>
          <option value="PENDING">Đang chờ</option>
          <option value="FAILED">Thất bại</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#c2c6d4]/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f3f3] border-b border-[#c2c6d4]">
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Mã GD</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Người dùng</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Loại</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Số tiền</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Trạng thái</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Ngày</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-[#5e5e62] uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((tx) => {
              const type = typeConfig[tx.type] || typeConfig.PAYMENT;
              const status = statusConfig[tx.status] || statusConfig.PENDING;
              return (
                <tr key={tx._id} className="border-b border-[#c2c6d4]/30 hover:bg-[#f5f3f3]/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm font-bold text-[#0056b3]">{tx._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#1b1c1c]">{tx.userId.fullName}</p>
                    <p className="text-xs text-[#5e5e62]">{tx.userId.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${type.bg} ${type.text}`}>
                      <span className="material-symbols-outlined text-[14px]">{type.icon}</span>
                      {type.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-black ${tx.status === 'SUCCESS' ? 'text-emerald-600' : 'text-[#5e5e62]'}`}>
                      {formatPrice(tx.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#5e5e62]">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-2 rounded-lg hover:bg-[#0056b3]/10 text-[#5e5e62] transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTx.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[60px] text-[#c2c6d4]">receipt_long</span>
            <p className="text-[#5e5e62] mt-3 font-bold">Không có giao dịch nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#c2c6d4] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0056b3]">Chi tiết giao dịch</h2>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-[#f5f3f3] rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f5f3f3] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Mã giao dịch</p>
                  <p className="font-mono font-bold text-[#0056b3]">{selectedTx._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="bg-[#f5f3f3] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Loại giao dịch</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${typeConfig[selectedTx.type].bg} ${typeConfig[selectedTx.type].text}`}>
                    {typeConfig[selectedTx.type].label}
                  </span>
                </div>
                <div className="bg-[#f5f3f3] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Số tiền</p>
                  <p className="text-xl font-black text-emerald-600">{formatPrice(selectedTx.amount)}</p>
                </div>
                <div className="bg-[#f5f3f3] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[selectedTx.status].bg} ${statusConfig[selectedTx.status].text}`}>
                    {statusConfig[selectedTx.status].label}
                  </span>
                </div>
              </div>
              <div className="bg-[#f5f3f3] rounded-xl p-4">
                <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Người dùng</p>
                <p className="font-bold text-[#1b1c1c]">{selectedTx.userId.fullName}</p>
                <p className="text-sm text-[#5e5e62]">{selectedTx.userId.email}</p>
              </div>
              <div className="bg-[#f5f3f3] rounded-xl p-4">
                <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Mô tả</p>
                <p className="text-sm text-[#1b1c1c]">{selectedTx.description}</p>
              </div>
              {selectedTx.payosTransactionId && (
                <div className="bg-[#f5f3f3] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">PayOS Transaction ID</p>
                  <p className="font-mono text-sm text-[#1b1c1c]">{selectedTx.payosTransactionId}</p>
                </div>
              )}
              <div className="bg-[#f5f3f3] rounded-xl p-4">
                <p className="text-xs font-bold text-[#5e5e62] uppercase mb-1">Ngày tạo</p>
                <p className="text-sm text-[#1b1c1c]">
                  {new Date(selectedTx.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-[#c2c6d4]">
              <button onClick={() => setSelectedTx(null)} className="w-full py-3 rounded-xl font-bold border border-[#c2c6d4] hover:bg-[#f5f3f3]">
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