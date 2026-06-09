import { Receipt, Clock, CheckCircle2, FileText, Calendar, Send, Eye, X } from 'lucide-react';
import React, { useState } from 'react';

const MOCK_INVOICES = [
  {
    _id: 'inv1',
    transactionId: { _id: 'tx1', amount: 2990000, userId: { fullName: 'Trần Thị Lan', email: 'lan.tran@company.com' } },
    invoiceNumber: 'INV-2024-001234',
    issuedDate: '2024-03-25T14:30:00Z',
    buyerName: 'Công ty TNHH ABC',
    buyerEmail: 'lan.tran@company.com',
    buyerTaxId: '0123456789',
    buyerAddress: '123 Nguyễn Trãi, Q1, TP.HCM',
    amount: 2990000,
    currency: 'VND',
    status: 'SENT',
    sentAt: '2024-03-25T16:00:00Z',
  },
  {
    _id: 'inv2',
    transactionId: { _id: 'tx2', amount: 990000, userId: { fullName: 'Nguyễn Văn Minh', email: 'minh.nguyen@email.com' } },
    invoiceNumber: 'INV-2024-001235',
    issuedDate: '2024-03-24T10:15:00Z',
    buyerName: 'Nguyễn Văn Minh',
    buyerEmail: 'minh.nguyen@email.com',
    buyerTaxId: null,
    buyerAddress: null,
    amount: 990000,
    currency: 'VND',
    status: 'PENDING',
    sentAt: null,
  },
  {
    _id: 'inv3',
    transactionId: { _id: 'tx3', amount: 5990000, userId: { fullName: 'Lê Hoàng Nam', email: 'nam.le@startup.vn' } },
    invoiceNumber: 'INV-2024-001236',
    issuedDate: '2024-03-23T09:00:00Z',
    buyerName: 'Công ty TNHH Startup VN',
    buyerEmail: 'nam.le@startup.vn',
    buyerTaxId: '9876543210',
    buyerAddress: '456 Lê Lợi, Q3, TP.HCM',
    amount: 5990000,
    currency: 'VND',
    status: 'GENERATED',
    sentAt: null,
  },
];

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', bg: 'bg-blue-100', text: 'text-blue-800', icon: 'pending' },
  GENERATED: { label: 'Đã tạo', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'description' },
  SENT: { label: 'Đã gửi', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'check_circle' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-[#c2c6d4]', text: 'text-slate-500', icon: 'cancel' },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = invoices.filter((inv) => {
    return filterStatus === 'all' || inv.status === filterStatus;
  });

  const handleUpdateStatus = (invoiceId, newStatus) => {
    setInvoices(
      invoices.map((inv) =>
        inv._id === invoiceId
          ? { ...inv, status: newStatus, sentAt: newStatus === 'SENT' ? new Date().toISOString() : inv.sentAt }
          : inv
      )
    );
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Quản lý Yêu cầu Hóa đơn
          </h2>
          <p className="text-sm text-slate-500 mt-1">Xử lý và theo dõi yêu cầu hóa đơn từ khách hàng</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-2xl border border-slate-200/80 text-sm font-medium"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="GENERATED">Đã tạo</option>
          <option value="SENT">Đã gửi</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="vw-card p-5 rounded-[1.5rem]">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-slate-500 uppercase">Tổng yêu cầu</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{invoices.length}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-800" />
            <span className="text-sm font-bold text-blue-800 uppercase">Chờ xử lý</span>
          </div>
          <p className="text-3xl font-black text-blue-800">{invoices.filter((i) => i.status === 'PENDING').length}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span className="text-sm font-bold text-blue-700 uppercase">Đã gửi</span>
          </div>
          <p className="text-3xl font-black text-blue-700">{invoices.filter((i) => i.status === 'SENT').length}</p>
        </div>
        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-600 uppercase">Đã tạo</span>
          </div>
          <p className="text-3xl font-black text-indigo-600">{invoices.filter((i) => i.status === 'GENERATED').length}</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const status = statusConfig[invoice.status] || statusConfig.PENDING;
          return (
            <div key={invoice._id} className="vw-card rounded-[1.5rem] p-6 hover:shadow-glow hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.bg}`}>
                    <span className={`material-symbols-outlined text-[24px] ${status.text}`}>{status.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{invoice.buyerName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{invoice.buyerEmail}</p>
                    {invoice.buyerTaxId && (
                      <p className="text-xs text-[#727784] mt-1">Mã số thuế: {invoice.buyerTaxId}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{formatPrice(invoice.amount)}</p>
                  <p className="text-xs text-slate-500 mt-1">Mã hóa đơn: {invoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 " />
                    Ngày tạo: {new Date(invoice.issuedDate).toLocaleDateString('vi-VN')}
                  </span>
                  {invoice.sentAt && (
                    <span className="flex items-center gap-1">
                      <Send className="w-4 h-4 " />
                      Đã gửi: {new Date(invoice.sentAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 transition-all"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5 " />
                  </button>
                  {invoice.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(invoice._id, 'GENERATED')}
                        className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold hover:bg-indigo-200 transition-all"
                      >
                        Tạo hóa đơn
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(invoice._id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#001a40] text-sm font-bold hover:bg-blue-200 transition-all"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                  {invoice.status === 'GENERATED' && (
                    <button
                      onClick={() => handleUpdateStatus(invoice._id, 'SENT')}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold hover:bg-blue-200 transition-all flex items-center gap-1"
                    >
                      <Send className="w-4 h-4 " />
                      Gửi hóa đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 vw-card rounded-[1.5rem]">
            <Receipt className="w-16 h-16 text-slate-300" />
            <p className="text-slate-500 mt-3 font-bold">Không có yêu cầu hóa đơn nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Chi tiết hóa đơn</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-50 rounded-lg">
                <X className="w-5 h-5 " />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mã hóa đơn</p>
                  <p className="font-mono font-bold text-primary">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Số tiền</p>
                  <p className="text-xl font-black text-blue-700">{formatPrice(selectedInvoice.amount)}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Người mua</p>
                <p className="font-bold text-slate-900">{selectedInvoice.buyerName}</p>
                <p className="text-sm text-slate-500">{selectedInvoice.buyerEmail}</p>
              </div>
              {selectedInvoice.buyerTaxId && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mã số thuế</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.buyerTaxId}</p>
                </div>
              )}
              {selectedInvoice.buyerAddress && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ</p>
                  <p className="text-sm text-slate-900">{selectedInvoice.buyerAddress}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[selectedInvoice.status].bg} ${statusConfig[selectedInvoice.status].text}`}>
                  {statusConfig[selectedInvoice.status].label}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200">
              <button onClick={() => setSelectedInvoice(null)} className="w-full py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;


