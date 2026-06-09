import { PageHeader, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const CompanyModerationHistory = () => {
  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader title="Lịch sử kiểm duyệt công ty" description="Theo dõi toàn bộ hoạt động duyệt/từ chối hồ sơ doanh nghiệp." />
      <SectionCard>
        <SimpleTable headers={['Thời gian', 'Công ty', 'Trạng thái cũ', 'Trạng thái mới', 'Admin xử lý', 'Lý do', 'Ghi chú']}>
          <tr className="border-t border-slate-100">
            <td className="px-4 py-3">2026-05-18 10:05</td>
            <td className="px-4 py-3">ABC Technology</td>
            <td className="px-4 py-3">PENDING</td>
            <td className="px-4 py-3">VERIFIED</td>
            <td className="px-4 py-3">admin02</td>
            <td className="px-4 py-3">-</td>
            <td className="px-4 py-3">Đối chiếu hợp lệ</td>
          </tr>
          <tr className="border-t border-slate-100">
            <td className="px-4 py-3">2026-05-17 15:20</td>
            <td className="px-4 py-3">ABC Technology</td>
            <td className="px-4 py-3">PENDING</td>
            <td className="px-4 py-3">REJECTED</td>
            <td className="px-4 py-3">admin01</td>
            <td className="px-4 py-3">Ảnh giấy phép mờ</td>
            <td className="px-4 py-3">Yêu cầu upload lại</td>
          </tr>
        </SimpleTable>
      </SectionCard>
    </div>
  );
};

export default CompanyModerationHistory;


