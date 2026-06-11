import { PageHeader, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const JobModerationHistory = () => (
  <div className="space-y-7 pb-10 animate-rise-in max-w-7xl mx-auto">
    <PageHeader title="Lịch sử Kiểm duyệt Tin" description="Theo dõi các hành động duyệt, từ chối và khóa tin tuyển dụng trên hệ thống." />
    <SectionCard className="p-0 overflow-hidden">
      <SimpleTable headers={['Thời gian', 'Tin tuyển dụng', 'Công ty', 'Trạng thái cũ', 'Trạng thái mới', 'Quản trị viên', 'Lý do', 'Ghi chú']}>
        <tr className="border-t border-slate-100/50 hover:bg-slate-50/50 transition-colors"><td className="px-6 py-4 font-semibold text-slate-500">2026-05-18 10:30</td><td className="px-6 py-4 font-bold text-slate-900">Senior Backend Developer</td><td className="px-6 py-4 text-slate-700">ABC Corp</td><td className="px-6 py-4 font-bold text-amber-600">PENDING</td><td className="px-6 py-4 font-bold text-emerald-600">PUBLISHED</td><td className="px-6 py-4 font-bold text-slate-800">admin01</td><td className="px-6 py-4 text-slate-600">Đạt yêu cầu</td><td className="px-6 py-4 text-slate-400">-</td></tr>
        <tr className="border-t border-slate-100/50 hover:bg-slate-50/50 transition-colors"><td className="px-6 py-4 font-semibold text-slate-500">2026-05-16 14:05</td><td className="px-6 py-4 font-bold text-slate-900">Data Entry Online</td><td className="px-6 py-4 text-slate-700">XYZ</td><td className="px-6 py-4 font-bold text-emerald-600">PUBLISHED</td><td className="px-6 py-4 font-bold text-red-600">BANNED</td><td className="px-6 py-4 font-bold text-slate-800">admin02</td><td className="px-6 py-4 text-slate-600">Nghi ngờ lừa đảo/Đa cấp</td><td className="px-6 py-4 text-slate-400">Khóa ngay lập tức</td></tr>
      </SimpleTable>
    </SectionCard>
  </div>
);

export default JobModerationHistory;


