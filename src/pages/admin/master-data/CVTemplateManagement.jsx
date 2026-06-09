import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable } from '../shared/AdminPrimitives';

const CVTemplateManagement = () => (
  <div className="space-y-7 animate-rise-in">
    <PageHeader title="Quản lý mẫu CV" description="Quản lý mẫu CV, font/màu hỗ trợ và trạng thái hiển thị." />
    <SectionCard title="Bộ lọc">
      <FilterGrid>
        <InputField label="Từ khóa" placeholder="Tên mẫu" />
        <SelectField label="Danh mục" options={["CNTT", "Bán hàng", "Tiếp thị"]} />
        <SelectField label="Trạng thái" options={["Hoạt động", "Ẩn"]} />
        <SelectField label="Loại mẫu" options={["Miễn phí", "Cao cấp"]} />
      </FilterGrid>
    </SectionCard>

    <SimpleTable headers={["Xem trước", "Mẫu", "Danh mục", "Loại", "Trạng thái", "Lượt dùng", "Tạo lúc", "Hành động"]}>
      <tr className="border-t border-slate-100"><td className="px-4 py-3">[Xem trước]</td><td className="px-4 py-3">Modern IT 01</td><td className="px-4 py-3">CNTT</td><td className="px-4 py-3">Miễn phí</td><td className="px-4 py-3">Hoạt động</td><td className="px-4 py-3">1,245</td><td className="px-4 py-3">2026-05-01</td><td className="px-4 py-3">Xem / Sửa / Ẩn</td></tr>
    </SimpleTable>
  </div>
);

export default CVTemplateManagement;


