import { useState } from 'react';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs } from '../shared/AdminPrimitives';

const tabs = [
  'Thông tin công ty',
  'Địa điểm',
  'Giấy tờ pháp lý',
  'Tin tuyển dụng',
  'Giao dịch',
  'Lịch sử kiểm duyệt',
  'Báo cáo vi phạm',
];

const CompanyDetail = () => {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết công ty"
        description="Xem toàn bộ thông tin công ty, lịch sử kiểm duyệt và dữ liệu liên quan."
        actions={
          <>
            <ActionButton tone="primary">Duyệt công ty</ActionButton>
            <ActionButton tone="danger">Khóa công ty</ActionButton>
          </>
        }
      />

      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {active === 'Thông tin công ty' && (
        <SectionCard title="Thông tin chung">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Tên công ty" value="ABC Technology" />
            <Info label="Mã số thuế" value="0312345678" />
            <Info label="Lĩnh vực" value="CNTT" />
            <Info label="Quy mô" value="51-200" />
            <Info label="Email" value="hr@abc.com" />
            <Info label="Người đại diện" value="Nguyễn Văn Hải" />
          </div>
        </SectionCard>
      )}

      {active === 'Tin tuyển dụng' && (
        <SimpleTable headers={['Job', 'Trạng thái', 'Hạn nộp', 'CV', 'Hành động']}>
          <tr className="border-t border-slate-100">
            <td className="px-4 py-3">Senior Backend Developer</td>
            <td className="px-4 py-3">PUBLISHED</td>
            <td className="px-4 py-3">2026-06-10</td>
            <td className="px-4 py-3">42</td>
            <td className="px-4 py-3">Xem Job</td>
          </tr>
        </SimpleTable>
      )}

      {active === 'Lịch sử kiểm duyệt' && (
        <SimpleTable headers={['Thời gian', 'Trạng thái cũ', 'Trạng thái mới', 'Admin xử lý', 'Lý do']}>
          <tr className="border-t border-slate-100">
            <td className="px-4 py-3">2026-05-17 15:20</td>
            <td className="px-4 py-3">PENDING</td>
            <td className="px-4 py-3">REJECTED</td>
            <td className="px-4 py-3">admin01</td>
            <td className="px-4 py-3">Ảnh giấy phép mờ</td>
          </tr>
          <tr className="border-t border-slate-100">
            <td className="px-4 py-3">2026-05-18 10:05</td>
            <td className="px-4 py-3">PENDING</td>
            <td className="px-4 py-3">VERIFIED</td>
            <td className="px-4 py-3">admin02</td>
            <td className="px-4 py-3">Hồ sơ hợp lệ</td>
          </tr>
        </SimpleTable>
      )}

      {active !== 'Thông tin công ty' && active !== 'Tin tuyển dụng' && active !== 'Lịch sử kiểm duyệt' ? (
        <SectionCard title={active}>
          <div className="text-slate-600">
            Đã tạo khung UI cho tab <b>{active}</b>, sẵn sàng nối dữ liệu backend.
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 font-semibold text-slate-900">{value}</div>
  </div>
);

export default CompanyDetail;
