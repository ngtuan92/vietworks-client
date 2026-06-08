import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import adminCompanyVerificationService from '../../../services/adminCompanyVerificationService';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs } from '../shared/AdminPrimitives';

const tabs = [
  'Thông tin công ty',
  'Địa điểm',
  'Giấy tờ pháp lý',
  'Tin tuyển dụng',
  'Giao dịch',
  'Lịch sử kiểm duyệt',
];

const CompanyDetail = () => {
  const { companyId } = useParams();
  const [active, setActive] = useState(tabs[0]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchCompanyDetail();
  }, [companyId]);

  const handleApprove = async () => {
    try {
      const res = await adminCompanyVerificationService.approveCompanyVerification(companyId);
      setMessage(res.message || 'Đã duyệt công ty.');
      await fetchCompanyDetail();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Duyệt công ty thất bại.');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ công ty:');

    if (!reason?.trim()) {
      return;
    }

    try {
      setRejecting(true);
      const res = await adminCompanyVerificationService.rejectCompanyVerification(companyId, reason.trim());
      setMessage(res.message || 'Đã từ chối hồ sơ công ty.');
      await fetchCompanyDetail();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Từ chối công ty thất bại.');
    } finally {
      setRejecting(false);
    }
  };

  if (loading && !company) {
    return <div className="text-slate-600">Đang tải chi tiết công ty...</div>;
  }

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader
        title={company?.name || 'Chi tiết công ty'}
        description="Xem thông tin công ty, địa điểm và giấy tờ pháp lý để kiểm duyệt."
        actions={
          <>
            <ActionButton tone="primary" onClick={handleApprove}>Duyệt công ty</ActionButton>
            <ActionButton tone="danger" onClick={handleReject}>{rejecting ? 'Đang từ chối...' : 'Từ chối duyệt công ty'}</ActionButton>
          </>
        }
      />

      {message ? (
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/86 shadow-soft backdrop-blur-xl px-4 py-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {active === 'Thông tin công ty' && company ? (
        <SectionCard title="Thông tin chung">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Tên công ty" value={company.name} />
            <Info label="Mã số thuế" value={company.taxCode} />
            <Info label="Lĩnh vực" value={company.industry?.name} />
            <Info label="Quy mô" value={company.size?.name} />
            <Info label="Email" value={company.email} />
            <Info label="Số điện thoại" value={company.phone} />
            <Info label="Website" value={company.website} />
            <Info label="Trạng thái" value={company.verificationStatus} />
            <Info label="Người sở hữu" value={company.owner?.fullName || company.owner?.email} />
          </div>

          <div className="mt-5">
            <div className="text-sm text-slate-500">Mô tả</div>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800" dangerouslySetInnerHTML={{ __html: company.description || 'N/A' }} />
          </div>
        </SectionCard>
      ) : null}

      {active === 'Địa điểm' && (
        <SimpleTable headers={['Tên địa điểm', 'Địa chỉ', 'Tỉnh/TP', 'Quận/Huyện', 'Phường/Xã', 'Trụ sở chính']}>
          {(company?.locations || []).map((loc) => (
            <tr key={loc._id} className="border-t border-slate-100">
              <td className="px-4 py-3">{loc.name}</td>
              <td className="px-4 py-3">{loc.addressLine}</td>
              <td className="px-4 py-3">{loc.province}</td>
              <td className="px-4 py-3">{loc.district || '-'}</td>
              <td className="px-4 py-3">{loc.ward || '-'}</td>
              <td className="px-4 py-3">{loc.isPrimary ? 'Có' : 'Không'}</td>
            </tr>
          ))}
        </SimpleTable>
      )}

      {active === 'Giấy tờ pháp lý' && (
        <SectionCard title="Giấy phép kinh doanh">
          {company?.businessLicenseFile?.fileUrl ? (
            <div className="space-y-3">
              <a href={company.businessLicenseFile.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                {company.businessLicenseFile.fileName || 'Xem file giấy phép'}
              </a>

              {company.businessLicenseFile.fileType?.startsWith('image/') ? (
                <img src={company.businessLicenseFile.fileUrl} alt="Giấy phép kinh doanh" className="max-h-[560px] rounded-2xl border border-slate-200 object-contain" />
              ) : null}
            </div>
          ) : (
            <div className="text-slate-600">Công ty chưa upload giấy phép kinh doanh.</div>
          )}
        </SectionCard>
      )}

      {active !== 'Thông tin công ty' && active !== 'Địa điểm' && active !== 'Giấy tờ pháp lý' ? (
        <SectionCard title={active}>
          <div className="text-slate-600">
            Chưa tích hợp backend cho mục <b>{active}</b>.
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-2 font-semibold text-slate-900">{value || '-'}</div>
  </div>
);

export default CompanyDetail;


