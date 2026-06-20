import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { PageHeader, SectionCard, StatCard, SelectField, ActionButton, ModalShell } from '../shared/AdminPrimitives';
import { Clock, FileText, CheckCircle2, X, Receipt, Calendar, Send, Eye, SearchX } from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/60', icon: <Clock className="w-6 h-6 text-amber-600" /> },
  GENERATED: { label: 'Đã tạo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/60', icon: <FileText className="w-6 h-6 text-indigo-600" /> },
  SENT: { label: 'Đã gửi', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/60', icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" /> },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: <X className="w-6 h-6 text-slate-500" /> },
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    api.get('/admin/invoice-requests')
      .then(r => { if (r.data.success) setInvoices(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    return !filterStatus || inv.status === filterStatus;
  });

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await api.patch('/admin/invoice-requests/' + invoiceId, { status: newStatus });
      if (res.data.success) {
        setInvoices(invoices.map(inv =>
          inv._id === invoiceId
            ? { ...inv, status: newStatus, sentAt: newStatus === 'SENT' ? new Date().toISOString() : inv.sentAt }
            : inv
        ));
      }
    } catch (error) {
      console.error('Update invoice status error:', error);
    }
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Quản lý Yêu cầu Hóa đơn"
        description="Xử lý và theo dõi yêu cầu xuất hóa đơn điện tử từ nhà tuyển dụng"
        actions={
          <div className="w-48">
            <SelectField
              label=""
              value={filterStatus}
              onChange={setFilterStatus}
              options={[['PENDING', 'Chờ xử lý'], ['GENERATED', 'Đã tạo'], ['SENT', 'Đã gửi'], ['CANCELLED', 'Đã hủy']]}
              placeholder="Tất cả trạng thái"
            />
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Receipt className="w-6 h-6" />} label="Tổng yêu cầu" value={invoices.length} tone="blue" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Chờ xử lý" value={invoices.filter((i) => i.status === 'PENDING').length} tone="amber" />
        <StatCard icon={<FileText className="w-6 h-6" />} label="Đã tạo" value={invoices.filter((i) => i.status === 'GENERATED').length} tone="indigo" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="Đã gửi" value={invoices.filter((i) => i.status === 'SENT').length} tone="emerald" />
      </div>

      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const status = statusConfig[invoice.status] || statusConfig.PENDING;
          return (
            <SectionCard key={invoice._id} className="hover:-translate-y-0.5 transition-all">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${status.bg} ${status.border}`}>
                    {status.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-black text-slate-900">{invoice.buyerName}</h3>
                      <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{invoice.buyerEmail}</p>
                    {invoice.buyerTaxId && (
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Mã số thuế: <span className="text-slate-600">{invoice.buyerTaxId}</span></p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{formatPrice(invoice.amount)}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Mã HĐ: <span className="text-slate-900">{invoice.invoiceNumber}</span></p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Tạo: {new Date(invoice.issuedDate).toLocaleDateString('vi-VN')}
                  </span>
                  {invoice.sentAt && (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Send className="w-4 h-4" />
                      Gửi: {new Date(invoice.sentAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ActionButton tone="default" onClick={() => setSelectedInvoice(invoice)}>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> Xem</span>
                  </ActionButton>
                  {invoice.status === 'PENDING' && (
                    <>
                      <ActionButton tone="primary" onClick={() => handleUpdateStatus(invoice._id, 'GENERATED')}>
                        Tạo hóa đơn
                      </ActionButton>
                      <ActionButton tone="danger" onClick={() => handleUpdateStatus(invoice._id, 'CANCELLED')}>
                        Hủy
                      </ActionButton>
                    </>
                  )}
                  {invoice.status === 'GENERATED' && (
                    <ActionButton tone="soft" onClick={() => handleUpdateStatus(invoice._id, 'SENT')}>
                      <span className="flex items-center gap-1.5"><Send className="w-4 h-4" /> Gửi khách hàng</span>
                    </ActionButton>
                  )}
                </div>
              </div>
            </SectionCard>
          );
        })}

        {filteredInvoices.length === 0 && (
          <SectionCard className="text-center py-16">
            <SearchX className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 font-black text-slate-500 text-lg">Không có yêu cầu hóa đơn nào</p>
          </SectionCard>
        )}
      </div>

      {selectedInvoice && (
        <ModalShell
          title="Chi tiết hóa đơn"
          onClose={() => setSelectedInvoice(null)}
          footer={<ActionButton onClick={() => setSelectedInvoice(null)}>Đóng</ActionButton>}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mã hóa đơn</p>
              <p className="font-mono font-black text-primary mt-1">{selectedInvoice.invoiceNumber}</p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số tiền</p>
              <p className="text-xl font-black text-blue-700 mt-1">{formatPrice(selectedInvoice.amount)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Người mua</p>
              <p className="font-black text-slate-900 mt-1">{selectedInvoice.buyerName}</p>
              <p className="text-sm font-medium text-slate-500">{selectedInvoice.buyerEmail}</p>
            </div>
            {selectedInvoice.buyerTaxId && (
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mã số thuế</p>
                <p className="font-black text-slate-900 mt-1">{selectedInvoice.buyerTaxId}</p>
              </div>
            )}
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Trạng thái</p>
              <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-1.5 ${statusConfig[selectedInvoice.status].bg} ${statusConfig[selectedInvoice.status].text} ${statusConfig[selectedInvoice.status].border}`}>
                {statusConfig[selectedInvoice.status].label}
              </span>
            </div>
            {selectedInvoice.buyerAddress && (
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm col-span-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Địa chỉ xuất HĐ</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedInvoice.buyerAddress}</p>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default AdminInvoices;
