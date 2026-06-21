const CompanyCard = ({ company }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h2 className="font-headline-md text-headline-md mb-6">
        Về {company?.name || 'công ty'}
      </h2>

      <p className="text-on-surface-variant font-body-md text-body-md mb-6 whitespace-pre-line">
        {company?.description || 'Công ty chưa cập nhật mô tả.'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Quy mô</p>
          <p className="font-bold text-on-surface">
            {company?.sizeId?.name || company?.size?.name || '-'}
          </p>
        </div>

        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Ngành</p>
          <p className="font-bold text-on-surface">
            {company?.industryId?.name || company?.industry?.name || '-'}
          </p>
        </div>

        

        <div>
          <p className="text-label-md text-outline uppercase tracking-wider mb-1">Website</p>
          {company?.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary hover:underline break-all"
            >
              Truy cập
            </a>
          ) : (
            <p className="font-bold text-on-surface">-</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;