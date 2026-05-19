import { useState } from 'react';
import { ActionButton, FilterGrid, InputField, ModalShell, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField } from '../shared/AdminPrimitives';

const reports = [
  { id: 1, type: 'Job', target: 'Data Entry Online', reporter: 'ngocanh@gmail.com', severity: 'Nghiêm trọng', status: 'Chờ xử lý', createdAt: '2026-05-18 09:40' },
  { id: 2, type: 'Công ty', target: 'XYZ Group', reporter: 'kien@gmail.com', severity: 'Trung bình', status: 'Đã xử lý', createdAt: '2026-05-17 21:10' },
];

const ViolationsManagement = () => {
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader title="Báo cáo vi phạm" description="Xem xét báo cáo cho Job/Công ty/Người dùng; lưu log và hành động xử lý." />
      <SectionCard title="Bộ lọc báo cáo">
        <FilterGrid>
          <SelectField label="Loại báo cáo" options={['Job', 'Công ty', 'Người dùng']} />
          <SelectField label="Trạng thái" options={['Chờ xử lý', 'Đã xử lý', 'Bỏ qua']} />
          <SelectField label="Mức độ" options={['Thấp', 'Trung bình', 'Nghiêm trọng']} />
          <InputField label="Từ khóa" placeholder="Job, công ty hoặc người dùng" />
          <InputField label="Từ ngày" type="date" />
          <InputField label="Đến ngày" type="date" />
        </FilterGrid>
      </SectionCard>

      <SimpleTable headers={['Đối tượng', 'Loại', 'Người báo cáo', 'Mức độ', 'Trạng thái', 'Thời gian', 'Thao tác']}>
        {reports.map((r) => (
          <tr key={r.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-semibold text-slate-900">{r.target}</td>
            <td className="px-4 py-3">{r.type}</td>
            <td className="px-4 py-3">{r.reporter}</td>
            <td className="px-4 py-3">{r.severity}</td>
            <td className="px-4 py-3">{r.status}</td>
            <td className="px-4 py-3">{r.createdAt}</td>
            <td className="px-4 py-3"><ActionButton tone="soft" onClick={() => setSelected(r)}>Xử lý</ActionButton></td>
          </tr>
        ))}
      </SimpleTable>

      {selected ? (
        <ModalShell title={`Chi tiết báo cáo #${selected.id}`} onClose={() => { setSelected(null); setAction(''); setNote(''); }} footer={<><ActionButton onClick={() => setSelected(null)}>Đóng</ActionButton><ActionButton tone="primary" disabled={!action}>Lưu xử lý</ActionButton></>}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div><b>Loại:</b> {selected.type}</div>
            <div><b>Đối tượng:</b> {selected.target}</div>
            <div><b>Mức độ:</b> {selected.severity}</div>
            <div><b>Người báo cáo:</b> {selected.reporter}</div>
          </div>
          <SelectField label="Hành động" required value={action} onChange={setAction} options={['Khóa Job', 'Khóa Công ty', 'Khóa Người dùng', 'Bỏ qua báo cáo', 'Gửi cảnh báo']} placeholder="Chọn hành động" />
          <TextAreaField label="Ghi chú nội bộ" value={note} onChange={setNote} placeholder="Thêm ghi chú hoặc bằng chứng..." />
        </ModalShell>
      ) : null}
    </div>
  );
};

export default ViolationsManagement;
