import { Link } from 'react-router-dom';
import { ActionButton, PageHeader, SectionCard, StatCard, SimpleTable } from '../shared/AdminPrimitives';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan hệ thống"
        description="Bảng điều khiển nhanh: người dùng, hàng chờ kiểm duyệt, giao dịch và vi phạm."
        actions={
          <>
            <ActionButton tone="soft">Hôm nay</ActionButton>
            <ActionButton tone="primary">Xuất báo cáo</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Người dùng" value="15,240" tone="blue" note="Tổng số" />
        <StatCard label="Job chờ duyệt" value="45" tone="amber" note="Cần kiểm duyệt" />
        <StatCard label="Công ty chờ duyệt" value="12" tone="violet" note="Cần xác minh" />
        <StatCard label="Vi phạm mới" value="5" tone="red" note="7 ngày gần nhất" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Lối tắt nhanh"
          description="Đi thẳng tới các trang kiểm duyệt quan trọng."
          right={<Link to="/admin/analytics" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Mở thống kê</Link>}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Link to="/admin/jobs" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <div className="text-sm text-slate-500">Kiểm duyệt</div>
              <div className="mt-1 text-lg font-bold text-slate-900">Tin tuyển dụng</div>
              <div className="mt-2 text-sm text-slate-600">45 tin chờ duyệt</div>
            </Link>
            <Link to="/admin/companies" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <div className="text-sm text-slate-500">Xác minh</div>
              <div className="mt-1 text-lg font-bold text-slate-900">Công ty</div>
              <div className="mt-2 text-sm text-slate-600">12 công ty chờ duyệt</div>
            </Link>
            <Link to="/admin/users" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <div className="text-sm text-slate-500">Người dùng</div>
              <div className="mt-1 text-lg font-bold text-slate-900">Tài khoản</div>
              <div className="mt-2 text-sm text-slate-600">Lọc theo cờ rủi ro</div>
            </Link>
            <Link to="/admin/violations" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <div className="text-sm text-slate-500">Báo cáo</div>
              <div className="mt-1 text-lg font-bold text-slate-900">Vi phạm</div>
              <div className="mt-2 text-sm text-slate-600">Báo cáo Job/Công ty/Người dùng</div>
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Hoạt động gần đây" description="Dữ liệu mẫu, backend có thể nạp thực tế sau.">
          <SimpleTable headers={['Thời gian', 'Sự kiện', 'Liên kết']}>
            <tr className="border-t border-slate-100">
              <td className="whitespace-nowrap px-4 py-3">2026-05-18 10:30</td>
              <td className="px-4 py-3 font-medium text-slate-900">Đã duyệt job Senior Backend Developer</td>
              <td className="px-4 py-3"><Link className="font-semibold text-[#0056b3]" to="/admin/jobs/1">Xem</Link></td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="whitespace-nowrap px-4 py-3">2026-05-18 09:50</td>
              <td className="px-4 py-3 font-medium text-slate-900">Đã khóa người dùng Tran Gia Huy</td>
              <td className="px-4 py-3"><Link className="font-semibold text-[#0056b3]" to="/admin/users/3">Xem</Link></td>
            </tr>
          </SimpleTable>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
