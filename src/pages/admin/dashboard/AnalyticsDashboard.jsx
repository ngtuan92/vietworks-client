import { PageHeader, StatCard, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader title="Báo cáo & Thống kê" description="Theo dõi tăng trưởng người dùng, hoạt động tuyển dụng, doanh thu và tỷ lệ thành công." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ứng viên mới" value="+128" tone="blue" note="7 ngày gần nhất" />
        <StatCard label="Employer mới" value="+34" tone="blue" note="7 ngày gần nhất" />
        <StatCard label="Job mới" value="+256" tone="blue" note="7 ngày gần nhất" />
        <StatCard label="Lượt ứng tuyển" value="1,842" tone="blue" note="7 ngày gần nhất" />
      </div>

      <SectionCard title="Biểu đồ (UI mẫu)" description="Sẵn sàng tích hợp Recharts/ECharts ở bước sau.">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-72 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">Khu vực biểu đồ tăng trưởng người dùng</div>
          <div className="h-72 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">Khu vực biểu đồ job / ứng tuyển</div>
        </div>
      </SectionCard>

      <SectionCard title="Chỉ số nổi bật">
        <SimpleTable headers={['Chỉ số', 'Giá trị', 'Ghi chú']}>
          <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-900">Doanh thu tháng này</td><td className="px-4 py-3">125,000,000 VND</td><td className="px-4 py-3">Doanh thu dịch vụ</td></tr>
          <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-slate-900">Tỷ lệ tuyển thành công</td><td className="px-4 py-3">12.8%</td><td className="px-4 py-3">Đã duyệt/Đã tuyển trên tổng lượt ứng tuyển</td></tr>
        </SimpleTable>
      </SectionCard>
    </div>
  );
};

export default AnalyticsDashboard;



