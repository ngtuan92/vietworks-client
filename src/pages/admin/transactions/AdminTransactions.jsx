import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, StatCard, FilterGrid, InputField, SelectField, ActionButton, ModalShell } from '../shared/AdminPrimitives';
import { Receipt, CheckCircle2, CreditCard, Eye, SearchX } from 'lucide-react';

const typeConfig = {
  WALLET_DEPOSIT:       { label: 'Nạp tiền',         bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'add_card' },
  PACKAGE_PURCHASE:     { label: 'Mua gói',           bg: 'bg-indigo-100',  text: 'text-indigo-700',  icon: 'payments' },
  CV_UNLOCK_SINGLE:     { label: 'Mở khóa CV',        bg: 'bg-violet-100',  text: 'text-violet-700',  icon: 'lock_open' },
  CV_UNLOCK_BY_PACKAGE: { label: 'Mở khóa CV (gói)', bg: 'bg-violet-100',  text: 'text-violet-700',  icon: 'lock_open' },
  REFUND:               { label: 'Hoàn tiền',         bg: 'bg-amber-100',   text: 'text-amber-700',   icon: 'replay' },
  ADMIN_ADJUSTMENT:     { label: 'Điều chỉnh',        bg: 'bg-slate-100',   text: 'text-slate-700',   icon: 'tune' },
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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    api.get('/admin/transactions')
      .then(r => { if (r.data.success) setTransactions(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTx = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      (tx.userId?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || tx.type === filterType;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const activeFilterCount = [search, filterType, filterStatus].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterStatus('');
  };

  const totalRevenue = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'WALLET_DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalPayments = transactions
    .filter((tx) => tx.status === 'SUCCESS' && tx.type === 'PACKAGE_PURCHASE')
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
              const type = typeConfig[tx.type] || typeConfig.PACKAGE_PURCHASE;
              const status = statusConfig[tx.status] || statusConfig.PENDING;
              return (
                <tr key={tx._id} className="border-t border-slate-100 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-slate-700">{tx._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-[#1b1c1c]">{tx.userId?.fullName || 'N/A'}</p>
                    <p className="text-xs text-[#5e5e62]">{tx.userId?.email || 'N/A'}</p>
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
            })}
          </tbody>
        </table>
        {filteredTx.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[60px] text-[#c2c6d4]">search_off</span>
            <p className="text-[#5e5e62] mt-3 font-bold">Không tìm thấy giao dịch nào</p>
          </div>
        )}
      </div>
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
