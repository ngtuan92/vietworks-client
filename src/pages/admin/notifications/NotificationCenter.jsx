import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField } from '../shared/AdminPrimitives';

const NotificationCenter = () => (
  <div className="space-y-6">
    <PageHeader title="Quản lý thông báo" description="Gửi thông báo hàng loạt hoặc cá nhân qua Web/Email/Push." />

    <SectionCard title="Thông báo đã gửi">
      <SimpleTable headers={['Tiêu đề', 'Đối tượng', 'Kênh', 'Trạng thái', 'Thời gian gửi', 'Người tạo', 'Hành động']}>
        <tr className="border-t border-slate-100"><td className="px-4 py-3">AI Review CV đã kích hoạt</td><td className="px-4 py-3">Tất cả Ứng viên</td><td className="px-4 py-3">Web + Email</td><td className="px-4 py-3">Đã gửi</td><td className="px-4 py-3">2026-05-18 08:30</td><td className="px-4 py-3">admin01</td><td className="px-4 py-3">Xem / Gửi lại</td></tr>
      </SimpleTable>
    </SectionCard>

    <SectionCard title="Tạo thông báo mới">
      <FilterGrid>
        <InputField label="Tiêu đề" placeholder="Nhập tiêu đề" />
        <SelectField label="Đối tượng" options={["Tất cả người dùng", "Tất cả Ứng viên", "Tất cả Nhà tuyển dụng", "Người dùng cụ thể"]} />
        <SelectField label="Lịch gửi" options={["Gửi ngay", "Lên lịch"]} />
        <InputField label="Liên kết" placeholder="/jobs/123" />
      </FilterGrid>
      <div className="mt-4"><TextAreaField label="Nội dung" required placeholder="Nhập nội dung thông báo" /></div>
      <div className="mt-4 flex gap-3"><button className="rounded-2xl bg-[#0056b3] px-4 py-2.5 font-semibold text-white">Gửi</button><button className="rounded-2xl border border-slate-200 px-4 py-2.5 font-semibold">Lưu nháp</button></div>
    </SectionCard>
  </div>
);

export default NotificationCenter;
