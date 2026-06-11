import { useState } from 'react';
import { ActionButton, ModalShell, PageHeader, SectionCard, SelectField, TextAreaField } from '../shared/AdminPrimitives';

const CompanyReview = () => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-7 pb-10 animate-rise-in max-w-7xl mx-auto">
      <PageHeader
        title="Duyệt Hồ sơ Công ty"
        description="Đối chiếu thông tin đăng ký với giấy phép kinh doanh để cấp dấu xác minh VERIFIED."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Thông tin doanh nghiệp">
          <Info label="Tên công ty" value="ABC Technology" />
          <Info label="Mã số thuế" value="0312345678" />
          <Info label="Website" value="https://abc.vn" />
          <Info label="Email công ty" value="hr@abc.com" />
          <Info label="Điện thoại" value="0912345678" />
          <Info label="Địa chỉ" value="Quận 1, TP. Hồ Chí Minh" />
        </SectionCard>

        <SectionCard title="Tài liệu pháp lý" right={<ActionButton tone="soft">Tải về</ActionButton>}>
          <div className="h-96 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 flex flex-col items-center justify-center">
            Khu vực hiển thị ảnh/PDF giấy phép kinh doanh
          </div>
          <div className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tải lên lúc: 2026-05-17 14:25</div>
        </SectionCard>
      </div>

      <SectionCard title="Thao tác kiểm duyệt">
        <div className="flex flex-wrap gap-3">
          <ActionButton tone="primary">Duyệt hồ sơ (VERIFIED)</ActionButton>
          <ActionButton tone="soft">Yêu cầu bổ sung tài liệu</ActionButton>
          <ActionButton tone="danger" onClick={() => setRejectOpen(true)}>
            Từ chối duyệt
          </ActionButton>
        </div>
      </SectionCard>

      {rejectOpen ? (
        <ModalShell
          title="Từ chối xác minh công ty"
          onClose={() => setRejectOpen(false)}
          footer={
            <>
              <ActionButton onClick={() => setRejectOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="danger" disabled={!reason}>
                Xác nhận từ chối
              </ActionButton>
            </>
          }
        >
          <div className="space-y-5">
            <SelectField
              label="Lý do từ chối nhanh"
              options={['Ảnh giấy phép bị mờ/không rõ', 'Mã số thuế không khớp', 'Giấy phép không hợp lệ', 'Thiếu thông tin bắt buộc', 'Khác']}
              placeholder="Chọn lý do"
            />
            <TextAreaField label="Chi tiết lý do từ chối" required value={reason} onChange={setReason} />
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="mb-3 rounded-xl border border-slate-200/60 bg-slate-50/50 shadow-sm p-3.5 hover:shadow-md transition-shadow">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
    <div className="text-sm font-black text-slate-900">{value}</div>
  </div>
);

export default CompanyReview;
