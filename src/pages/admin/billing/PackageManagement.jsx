import { PageHeader, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const PackageManagement = () => (
  <div className="space-y-6">
    <PageHeader title="Quản lý gói dịch vụ" description="Tạo/sửa/ẩn gói Employer và JobSeeker; không xóa gói đã có giao dịch." />
    <SectionCard>
      <SimpleTable headers={['Tên gói', 'Đối tượng', 'Loại gói', 'Giá', 'Thời hạn', 'Quyền lợi', 'Trạng thái', 'Hành động']}>
        <tr className="border-t border-slate-100">
          <td className="px-4 py-3">Gói 50 CV</td>
          <td className="px-4 py-3">Employer</td>
          <td className="px-4 py-3">Unlock CV</td>
          <td className="px-4 py-3">800.000</td>
          <td className="px-4 py-3">30 ngày</td>
          <td className="px-4 py-3">Mở 50 CV trong 30 ngày</td>
          <td className="px-4 py-3">Active</td>
          <td className="px-4 py-3">Sửa / Ẩn</td>
        </tr>
      </SimpleTable>
    </SectionCard>
  </div>
);

export default PackageManagement;
