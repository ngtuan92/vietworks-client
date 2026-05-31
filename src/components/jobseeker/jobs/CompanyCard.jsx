const CompanyCard = ({ company }) => {
  if (!company) return null;

  const companyName = company.name || 'Công ty không xác định';
  const companyDescription = company.description || 'Chưa có thông tin mô tả';
  const companySize = company.sizeId?.name || 'Không xác định';
  const companyIndustry = company.industryId?.name || 'Không xác định';
  const companyWebsite = company.website;
  
  const mainLocation = company.locations?.[0] || {};
  const locationText = mainLocation.districtName 
    ? `${mainLocation.districtName}, ${mainLocation.provinceName || ''}`
    : mainLocation.provinceName || 'Không xác định';

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h2 className="font-headline-md text-headline-md mb-6">Về {companyName}</h2>
      <p className="text-on-surface-variant font-body-md text-body-md mb-6">{companyDescription}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Quy mô</p>
          <p className="font-bold text-on-surface">{companySize}</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Ngành</p>
          <p className="font-bold text-on-surface">{companyIndustry}</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Địa điểm</p>
          <p className="font-bold text-on-surface">{locationText}</p>
        </div>
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Website</p>
          {companyWebsite ? (
            <a 
              href={companyWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline"
            >
              Truy cập
            </a>
          ) : (
            <p className="font-bold text-on-surface">Không có</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;