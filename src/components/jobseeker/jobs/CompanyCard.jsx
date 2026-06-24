const CompanyCard = ({ company }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h2 className="font-headline-md text-headline-md mb-6">
        Về {company?.name || 'công ty'}
      </h2>

      <p className="text-on-surface-variant font-body-md text-body-md mb-6 whitespace-pre-line">
        {company?.description || 'Công ty chưa cập nhật mô tả.'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 hover:shadow-sm transition-all">
          <p className="text-label-md text-blue-600/70 uppercase tracking-wider mb-1">Quy mô</p>
          <p className="font-bold text-blue-900">
            {company?.sizeId?.name || company?.size?.name || '-'}
          </p>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 hover:shadow-sm transition-all">
          <p className="text-label-md text-blue-600/70 uppercase tracking-wider mb-1">Ngành</p>
          <p className="font-bold text-blue-900">
            {company?.industryId?.name || company?.industry?.name || '-'}
          </p>
        </div>

        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 hover:shadow-sm transition-all">
          <p className="text-label-md text-blue-600/70 uppercase tracking-wider mb-1">Website</p>
          {company?.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline break-all"
            >
              Truy cập
            </a>
          ) : (
            <p className="font-bold text-blue-900">-</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;