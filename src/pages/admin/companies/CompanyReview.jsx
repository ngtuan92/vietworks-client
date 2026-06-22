import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminCompanyVerificationService from '../../../services/adminCompanyVerificationService';
import { ActionButton, ModalShell, PageHeader, SectionCard, SelectField, TextAreaField } from '../shared/AdminPrimitives';
import { Eye, Download, X } from 'lucide-react';
import InlinePdfViewer from '../../../components/shared/InlinePdfViewer';

const CompanyReview = () => {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        setLoading(true);
        const res = await adminCompanyVerificationService.getCompanyVerificationDetail(companyId);
        if (res.success) {
          setCompany(res.data);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Không thể tải chi tiết công ty.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [companyId]);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const res = await adminCompanyVerificationService.approveCompanyVerification(companyId);
      setMessage('Đã duyệt công ty thành công.');
      setTimeout(() => navigate('/admin/companies'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Duyệt công ty thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setMessage('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminCompanyVerificationService.rejectCompanyVerification(companyId, reason.trim());
      setMessage('Đã từ chối công ty.');
      setRejectOpen(false);
      setTimeout(() => navigate('/admin/companies'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Từ chối công ty thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Đang tải chi tiết công ty...</div>;
  }

  if (!company) {
    return <div className="text-slate-600">Không tìm thấy công ty.</div>;
  }

  return (
    <div className="space-y-7 pb-10 animate-rise-in max-w-7xl mx-auto">
      <PageHeader
        title={`Duyệt Hồ sơ Công ty: ${company.name}`}
        description="Đối chiếu thông tin đăng ký với giấy phép kinh doanh để cấp dấu xác minh VERIFIED."
      />

      {message ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 shadow-sm px-4 py-3 text-sm font-bold text-blue-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Thông tin doanh nghiệp">
          <Info label="Tên công ty" value={company.name} />
          <Info label="Mã số thuế" value={company.taxCode} />
          <Info label="Website" value={company.website} />
          <Info label="Email công ty" value={company.email} />
          <Info label="Điện thoại" value={company.phone} />
          <Info label="Lĩnh vực" value={company.industry?.name} />
          <Info label="Quy mô" value={company.size?.name} />
        </SectionCard>

        <SectionCard title="Tài liệu pháp lý" right={company.businessLicenseFile?.fileUrl ? <a href={company.businessLicenseFile.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Tải về</a> : null}>
          {company.businessLicenseFile?.fileUrl ? (
            company.businessLicenseFile.fileType?.startsWith('image/') || /\.(jpeg|jpg|png|gif)$/i.test(company.businessLicenseFile.fileUrl) ? (
              <img src={company.businessLicenseFile.fileUrl} alt="Giấy phép kinh doanh" className="max-h-[600px] rounded-2xl border border-slate-200 object-contain w-full" />
            ) : company.businessLicenseFile.fileType === 'application/pdf' || /\.pdf$/i.test(company.businessLicenseFile.fileUrl || company.businessLicenseFile.fileName) ? (
              <InlinePdfViewer url={company.businessLicenseFile.fileUrl} className="w-full h-[600px] rounded-2xl border border-slate-200" />
            ) : (
              <div className="h-48 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold">File giấy phép kinh doanh</div>
                  <a href={company.businessLicenseFile.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 block">
                    {company.businessLicenseFile.fileName || 'Tải file xuống'}
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="h-96 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 flex flex-col items-center justify-center">
              Chưa upload giấy phép kinh doanh
            </div>
          )}
          <div className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tải lên lúc: {company.updatedAt ? new Date(company.updatedAt).toLocaleString('vi-VN') : '-'}</div>
        </SectionCard>
      </div>

      <SectionCard title="Thao tác kiểm duyệt">
        <div className="flex flex-wrap gap-3">
          <ActionButton tone="primary" onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Duyệt hồ sơ (VERIFIED)'}
          </ActionButton>
          <ActionButton tone="danger" onClick={() => setRejectOpen(true)} disabled={isSubmitting}>
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
              <ActionButton onClick={() => setRejectOpen(false)} disabled={isSubmitting}>Hủy</ActionButton>
              <ActionButton tone="danger" disabled={!reason.trim() || isSubmitting} onClick={handleReject}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </ActionButton>
            </>
          }
        >
          <div className="space-y-5">
            <TextAreaField label="Lý do từ chối (bắt buộc)" required value={reason} onChange={setReason} placeholder="Nhập lý do từ chối chi tiết..." />
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
