import { Receipt, CheckCircle2, CreditCard, Eye, SearchX, WalletCards, RotateCcw, Landmark } from 'lucide-react';
import React, { useState } from 'react';
import {
  PageHeader,
  SectionCard,
  SimpleTable,
  FilterGrid,
  InputField,
  SelectField,
  ModalShell,
  ActionButton,
  StatCard,
} from '../shared/AdminPrimitives';

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
  DEPOSIT: { label: 'Nạp tiền', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', icon: <WalletCards className="w-3.5 h-3.5" /> },
  PAYMENT: { label: 'Thanh toán', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/60', icon: <CreditCard className="w-3.5 h-3.5" /> },
  REFUND: { label: 'Hoàn tiền', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', icon: <RotateCcw className="w-3.5 h-3.5" /> },
  WITHDRAW: { label: 'Rút tiền', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/60', icon: <Landmark className="w-3.5 h-3.5" /> },
};

const statusConfig = {
  SUCCESS: { label: 'Thành công', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60' },
  PENDING: { label: 'Đang chờ', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60' },
  FAILED: { label: 'Thất bại', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/60' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminTransactions = () => {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const filteredTx = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      tx.userId.fullName.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId.email.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || tx.type === filterType;
    const matchStatus = !filterStatus || tx.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const activeFilterCount = [search, filterType, filterStatus].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
  };

  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalPayments = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'PAYMENT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Quản lý Giao dịch"
        description="Theo dõi tất cả giao dịch trong hệ thống"
        actions={
          <ActionButton tone="primary">Xuất báo cáo</ActionButton>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Receipt className="w-6 h-6" />} label="Tổng giao dịch" value={transactions.length} tone="blue" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Thành công" value={transactions.filter((tx) => tx.status === 'SUCCESS').length} tone="emerald" />
        <StatCard icon={<CreditCard className="w-6 h-6" />} label="Tổng nạp tiền" value={formatPrice(totalRevenue)} tone="indigo" />
        <StatCard icon={<CreditCard className="w-6 h-6" />} label="Tổng thanh toán" value={formatPrice(totalPayments)} tone="amber" />
      </div>

      <SectionCard 
        title="Danh sách giao dịch" 
        description="Lịch sử chi tiết dòng tiền"
        right={activeFilterCount > 0 && (
          <ActionButton tone="soft" onClick={clearFilters}>Xóa bộ lọc ({activeFilterCount})</ActionButton>
        )}
      >
        <div className="mb-6">
          <FilterGrid>
            <InputField label="Tìm kiếm" value={search} onChange={setSearch} placeholder="Tên, email, mô tả..." />
            <SelectField label="Loại giao dịch" value={filterType} onChange={setFilterType} options={[['DEPOSIT', 'Nạp tiền'], ['PAYMENT', 'Thanh toán'], ['REFUND', 'Hoàn tiền'], ['WITHDRAW', 'Rút tiền']]} placeholder="Tất cả loại" />
            <SelectField label="Trạng thái" value={filterStatus} onChange={setFilterStatus} options={[['SUCCESS', 'Thành công'], ['PENDING', 'Đang chờ'], ['FAILED', 'Thất bại'], ['CANCELLED', 'Đã hủy']]} placeholder="Tất cả trạng thái" />
          </FilterGrid>
        </div>

        <SimpleTable headers={['Mã GD', 'Người dùng', 'Loại', 'Số tiền', 'Trạng thái', 'Ngày', 'Thao tác']}>
          {filteredTx.length > 0 ? (
            filteredTx.map((tx) => {
              const type = typeConfig[tx.type] || typeConfig.PAYMENT;
              const status = statusConfig[tx.status] || statusConfig.PENDING;
              return (
                <tr key={tx._id} className="border-t border-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-slate-700">{tx._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{tx.userId.fullName}</p>
                    <p className="text-xs font-medium text-slate-500">{tx.userId.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${type.bg} ${type.text} ${type.border}`}>
                      {type.icon}
                      {type.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-black ${tx.status === 'SUCCESS' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {formatPrice(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} ${status.border}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="rounded-xl border border-transparent p-2 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="py-12 text-center">
                <SearchX className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-3 font-bold text-slate-500">Không tìm thấy giao dịch nào</p>
              </td>
            </tr>
          )}
        </SimpleTable>
      </SectionCard>

      {selectedTx && (
        <ModalShell
          title="Chi tiết giao dịch"
          onClose={() => setSelectedTx(null)}
          footer={<ActionButton onClick={() => setSelectedTx(null)}>Đóng</ActionButton>}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mã giao dịch</p>
              <p className="font-mono font-black text-slate-900 mt-1">{selectedTx._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Loại giao dịch</p>
              <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1.5 ${typeConfig[selectedTx.type].bg} ${typeConfig[selectedTx.type].text} ${typeConfig[selectedTx.type].border}`}>
                {typeConfig[selectedTx.type].label}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số tiền</p>
              <p className="text-xl font-black text-blue-700 mt-1">{formatPrice(selectedTx.amount)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Trạng thái</p>
              <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1.5 ${statusConfig[selectedTx.status].bg} ${statusConfig[selectedTx.status].text} ${statusConfig[selectedTx.status].border}`}>
                {statusConfig[selectedTx.status].label}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Người dùng</p>
            <p className="font-black text-slate-900 mt-1">{selectedTx.userId.fullName}</p>
            <p className="text-sm font-medium text-slate-500">{selectedTx.userId.email}</p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mô tả</p>
            <p className="text-sm font-black text-slate-900 mt-1">{selectedTx.description}</p>
          </div>
          {selectedTx.payosTransactionId && (
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">PayOS Transaction ID</p>
              <p className="font-mono text-sm font-black text-slate-900 mt-1">{selectedTx.payosTransactionId}</p>
            </div>
          )}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ngày tạo</p>
            <p className="text-sm font-black text-slate-900 mt-1">
              {new Date(selectedTx.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminTransactions;
