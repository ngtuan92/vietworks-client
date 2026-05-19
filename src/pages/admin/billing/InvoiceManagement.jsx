import { PageHeader, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const InvoiceManagement = () => (
  <div className="space-y-6">
    <PageHeader title="Quản lý hóa đơn" description="Quản lý yêu cầu xuất hóa đơn cho các giao dịch dịch vụ." />
    <SectionCard>
      <SimpleTable headers={['Mã hóa đơn', 'Giao dịch', 'Người yêu cầu', 'Tên công ty', 'MST', 'Số tiền', 'Trạng thái', 'Ngày yêu cầu', 'Hành động']}>
        <tr className="border-t border-slate-100">
          <td className="px-4 py-3">INV-001</td>
          <td className="px-4 py-3">TXN-20260518-001</td>
          <td className="px-4 py-3">Employer</td>
          <td className="px-4 py-3">ABC Technology</td>
          <td className="px-4 py-3">0312345678</td>
          <td className="px-4 py-3">5.000.000</td>
          <td className="px-4 py-3">Chờ xuất</td>
          <td className="px-4 py-3">2026-05-18</td>
          <td className="px-4 py-3">Xem</td>
        </tr>
      </SimpleTable>
    </SectionCard>
  </div>
);

export default InvoiceManagement;
