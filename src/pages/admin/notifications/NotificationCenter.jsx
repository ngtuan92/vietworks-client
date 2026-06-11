import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField, ActionButton } from '../shared/AdminPrimitives';
import { Send, Save, BellRing } from 'lucide-react';

const NotificationCenter = () => (
  <div className="space-y-7 pb-10 animate-rise-in">
    <PageHeader 
      title="Quản lý Thông báo" 
      description="Gửi và quản lý thông báo hàng loạt hoặc cá nhân qua Web, Email, và Push Notifications." 
      actions={
        <ActionButton tone="primary">
          <span className="flex items-center gap-1.5"><BellRing className="w-4 h-4" /> Báo cáo hiệu suất</span>
        </ActionButton>
      }
    />

    <SectionCard title="Tạo thông báo mới">
      <FilterGrid>
        <InputField label="Tiêu đề" placeholder="Nhập tiêu đề thông báo..." />
        <SelectField label="Đối tượng" options={["Tất cả người dùng", "Tất cả Ứng viên", "Tất cả Nhà tuyển dụng", "Người dùng cụ thể"]} placeholder="Chọn đối tượng" />
        <SelectField label="Lịch gửi" options={["Gửi ngay", "Lên lịch vào lúc..."]} placeholder="Chọn thời gian" />
        <InputField label="Liên kết (URL)" placeholder="/jobs/123" />
      </FilterGrid>
      <div className="mt-6">
        <TextAreaField label="Nội dung" required placeholder="Nhập nội dung chi tiết của thông báo..." rows={4} />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <ActionButton tone="default">
          <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Lưu nháp</span>
        </ActionButton>
        <ActionButton tone="primary">
          <span className="flex items-center gap-1.5"><Send className="w-4 h-4" /> Gửi thông báo</span>
        </ActionButton>
      </div>
    </SectionCard>

    <SectionCard title="Lịch sử thông báo" className="p-0 overflow-hidden">
      <SimpleTable headers={['Tiêu đề', 'Đối tượng', 'Kênh', 'Trạng thái', 'Thời gian gửi', 'Người tạo', 'Hành động']}>
        <tr className="border-t border-slate-100/50 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 font-bold text-slate-900">Tính năng mới: AI Review CV</td>
          <td className="px-6 py-4 text-slate-600 font-medium">Tất cả Ứng viên</td>
          <td className="px-6 py-4">
            <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
              Web + Email
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="inline-flex rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Đã gửi
            </span>
          </td>
          <td className="px-6 py-4 text-slate-500 font-medium text-sm">2026-05-18 08:30</td>
          <td className="px-6 py-4 text-slate-700 font-bold text-sm">admin01</td>
          <td className="px-6 py-4">
            <ActionButton tone="soft">Xem chi tiết</ActionButton>
          </td>
        </tr>
      </SimpleTable>
    </SectionCard>
  </div>
);

export default NotificationCenter;
