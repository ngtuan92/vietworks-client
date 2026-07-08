import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import adminCompanyVerificationService from '../../../services/adminCompanyVerificationService';
import InlinePdfViewer from '../../../components/shared/InlinePdfViewer';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs } from '../shared/AdminPrimitives';
import { Eye, Download, X } from 'lucide-react';

const tabs = [
  'Thông tin công ty',
  'Địa điểm',
  'Giấy tờ pháp lý',
];

const CompanyDetail = () => {
  const { id: companyId } = useParams();
  const [active, setActive] = useState(tabs[0]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

  const renderActions = () => {
    if (company?.verificationStatus === 'PENDING') {
      return (
        <>
          <ActionButton tone="primary" onClick={handleApprove}>Duyệt công ty</ActionButton>
          <ActionButton tone="danger" onClick={handleReject}>
            {rejecting ? 'Đang từ chối...' : 'Từ chối duyệt công ty'}
          </ActionButton>
        </>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader
        title={company?.name || 'Chi tiết công ty'}
        description="Xem thông tin công ty, địa điểm và giấy tờ pháp lý để kiểm duyệt."
        actions={renderActions()}
      />

      {message ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 shadow-sm px-4 py-3 text-sm font-bold text-blue-800">
          {message}
        </div>
      ) : null}

      <SectionCard>
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {active === 'Thông tin công ty' && company ? (
        <SectionCard title="Thông tin chung">
          {(company.avatarUrl || company.coverUrl) && (
            <div className="mb-6 space-y-4">
              {company.coverUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img src={company.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                  {company.avatarUrl && (
                    <div className="absolute bottom-4 left-4 h-20 w-20 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
                      <img src={company.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              )}
              {!company.coverUrl && company.avatarUrl && (
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <img src={company.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Tên công ty" value={company.name} />
            <Info label="Mã số thuế" value={company.taxCode} />
            <Info label="Lĩnh vực" value={company.industries?.map(i => i.name).join(', ')} />
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
        <SimpleTable headers={['Tên địa điểm', 'Địa chỉ', 'Tỉnh/TP', 'Phường/Xã', 'Trụ sở chính']}>
          {(company?.locations || []).map((loc) => (
            <tr key={loc._id} className="border-t border-slate-100">
              <td className="px-4 py-3">{loc.name}</td>
              <td className="px-4 py-3">{loc.addressLine}</td>
              <td className="px-4 py-3">{loc.province}</td>
              <td className="px-4 py-3">{loc.ward || '-'}</td>
              <td className="px-4 py-3">{loc.isPrimary ? 'Có' : 'Không'}</td>
            </tr>
          ))}
        </SimpleTable>
      )}

      {active === 'Giấy tờ pháp lý' && (
        <SectionCard title="Giấy phép kinh doanh">
          {company?.businessLicenseFile ? (
            <div className="space-y-4">
              {(() => {
                const isObject = typeof company.businessLicenseFile === 'object' && company.businessLicenseFile !== null;
                const fileUrl = isObject ? company.businessLicenseFile.fileUrl : company.businessLicenseFile;
                const fileName = isObject ? (company.businessLicenseFile.fileName || 'Giay_phep_kinh_doanh') : 'Giay_phep_kinh_doanh';
                const fileType = isObject ? company.businessLicenseFile.fileType : '';

                const isImage = fileType?.startsWith('image/') || /\.(jpeg|jpg|gif|png|webp)$/i.test(fileUrl);
                const isPdf = fileType === 'application/pdf' || /\.pdf$/i.test(fileUrl);

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-4">
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">
                          📄 {fileName} <span className="text-xs font-normal text-slate-400">(Mở trong tab mới ↗)</span>
                        </a>
                      </div>
                      
                      {/* Nút tải về máy */}
                      <a 
                        href={fileUrl} 
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors shadow-sm"
                      >
                        📥 Tải xuống file
                      </a>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-2 shadow-inner">
                      {isImage && (
                        <div className="flex justify-center p-2 bg-white rounded-xl">
                          <img src={fileUrl} alt="Giấy phép kinh doanh" className="max-h-[600px] object-contain rounded-lg" />
                        </div>
                      )}

                      {isPdf && (
                        <InlinePdfViewer 
                          url={fileUrl} 
                          className="w-full h-[650px] rounded-xl bg-white border border-slate-200" 
                        />
                      )}

                      {!isImage && !isPdf && (
                        <div className="p-8 text-center text-sm text-slate-500">
                          Định dạng file không hỗ trợ xem trước trực tiếp. Vui lòng bấm vào liên kết phía trên hoặc nút tải xuống để kiểm tra.
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-slate-600">Công ty chưa tải lên giấy phép kinh doanh.</div>
          )}
        </SectionCard>
      )}
    </div>
  );
};

const Info = ({ label, value }) => {
  if (!value || value === '-') return null;
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1.5 text-sm font-black text-slate-900">{value}</div>
    </div>
  );
};

export default CompanyDetail;