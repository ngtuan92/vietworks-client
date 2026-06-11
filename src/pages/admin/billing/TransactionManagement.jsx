import { useState } from 'react';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, Tabs } from '../shared/AdminPrimitives';

const tabs = ['Tất cả', 'Chờ xử lý', 'Thành công', 'Thất bại', 'Giao dịch Employer', 'Giao dịch JobSeeker'];

const TransactionManagement = () => {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader title="Quản lý giao dịch" description="Theo dõi giao dịch immutable: Pending, Success, Failed; hỗ trợ đối soát thủ công." />
      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      <SectionCard title="Bộ lọc giao dịch">
        <FilterGrid>
          <InputField label="Mã giao dịch" placeholder="Nhập mã giao dịch" />
          <InputField label="Người dùng" placeholder="Tên/email user" />
          <SelectField label="Loại user" options={['JobSeeker', 'Employer']} />
          <SelectField label="Loại giao dịch" options={['Nạp tiền', 'Mua gói', 'Mở CV']} />
          <SelectField label="Trạng thái" options={['PENDING', 'SUCCESS', 'FAILED']} />
          <SelectField label="Phương thức" options={['PayOS', 'Chuyển khoản']} />
          <InputField label="Ngày giao dịch từ" type="date" />
          <InputField label="Ngày giao dịch đến" type="date" />
        </FilterGrid>
      </SectionCard>

      <SimpleTable headers={['Mã GD', 'Người dùng', 'Loại user', 'Loại giao dịch', 'Số tiền', 'Phương thức', 'Trạng thái', 'Thời gian', 'Hành động']}>
        <tr className="border-t border-slate-100">
          <td className="px-4 py-3">TXN-20260518-001</td>
          <td className="px-4 py-3">Nguyễn Văn Hải</td>
          <td className="px-4 py-3">Employer</td>
          <td className="px-4 py-3">Nạp tiền</td>
          <td className="px-4 py-3">5.000.000</td>
          <td className="px-4 py-3">PayOS</td>
          <td className="px-4 py-3">SUCCESS</td>
          <td className="px-4 py-3">2026-05-18 09:00</td>
          <td className="px-4 py-3">Xem chi tiết</td>
        </tr>
      </SimpleTable>
    </div>
  );
};

export default TransactionManagement;


