import { useState } from 'react';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable } from '../shared/AdminPrimitives';

const MasterDataManagement = () => {
  const [tab, setTab] = useState('Địa điểm');
  const tabs = ['Địa điểm', 'Danh mục', 'Cấp bậc', 'Kinh nghiệm', 'Kỹ năng / Tags', 'Lĩnh vực công ty', 'Quy mô công ty'];

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý dữ liệu gốc" description="Quản lý dữ liệu dùng chung trên toàn nền tảng. Ưu tiên ẩn thay vì xóa cứng với dữ liệu đã được sử dụng." />
      <SectionCard><div className="flex flex-wrap gap-2">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-[#0056b3] text-white' : 'bg-slate-100 text-slate-700'}`}>{t}</button>)}</div></SectionCard>
      <SectionCard title={`Danh sách: ${tab}`}>
        <FilterGrid>
          <InputField label="Từ khóa" placeholder="Tìm kiếm" />
          <SelectField label="Trạng thái" options={['Đang hoạt động', 'Đã ẩn']} />
        </FilterGrid>
      </SectionCard>
      <SimpleTable headers={['Tên', 'Cấp', 'Cha', 'Trạng thái', 'Số job sử dụng', 'Thao tác']}>
        <tr className="border-t border-slate-100"><td className="px-4 py-3">Frontend Developer</td><td className="px-4 py-3">Vị trí</td><td className="px-4 py-3">Phát triển phần mềm</td><td className="px-4 py-3">Đang hoạt động</td><td className="px-4 py-3">124</td><td className="px-4 py-3">Sửa / Ẩn</td></tr>
      </SimpleTable>
    </div>
  );
};

export default MasterDataManagement;
