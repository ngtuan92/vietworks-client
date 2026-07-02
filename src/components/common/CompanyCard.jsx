import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Check, Building2, MapPin, Users } from 'lucide-react';

const CompanyCard = memo(({
  company,
  openJobsCount = 0,
  followMode = 'add',
  onFollowClick,
  disabled = false
}) => {
  const industry = company.industryId?.name;
  const showFollowButton = !!onFollowClick;
  const [logoError, setLogoError] = useState(false);
  const showLogo = company.avatarUrl && !logoError;

  const location = company.locations?.[0]?.province
    || company.locations?.[0]?.provinceName
    || company.province
    || null;

  const sizeName = company.sizeId?.name || company.size?.name || null;

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0056B3] via-blue-400 to-[#0ea5e9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <Link
            to={`/companies/${company._id}`}
            className="relative shrink-0"
          >
            <div className="w-14 h-14 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden flex items-center justify-center group-hover:border-blue-200 group-hover:shadow-md group-hover:shadow-blue-100/50 transition-all duration-300">
              {showLogo ? (
                <img
                  src={company.avatarUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0056B3]/5 to-blue-50">
                  <span className="text-xl font-black text-[#0056B3]/60">
                    {company.name?.charAt(0)?.toUpperCase() || <Building2 className="w-6 h-6" />}
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <Link to={`/companies/${company._id}`} className="block">
              <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-[#0056B3] transition-colors duration-200">
                {company.name}
              </h3>
            </Link>

            {industry && (
              <p className="mt-0.5 text-sm text-slate-500 line-clamp-1 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                {industry}
              </p>
            )}

            {/* Meta info row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
              {openJobsCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Briefcase className="w-3 h-3" />
                  {openJobsCount} việc làm
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  {location}
                </span>
              )}
              {sizeName && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Users className="w-3 h-3" />
                  {sizeName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row with follow button */}
        {showFollowButton && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex-1 min-w-0" />

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) onFollowClick(company._id);
              }}
              disabled={disabled}
              className={`
                inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${followMode === 'remove'
                  ? 'bg-blue-50 text-[#0056B3] border border-blue-200 hover:bg-blue-100 hover:border-blue-300 active:scale-95'
                  : 'bg-[#0056B3] text-white border border-transparent hover:bg-[#004491] active:scale-95 shadow-sm shadow-blue-200/50'
                }
              `}
            >
              {followMode === 'remove' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Đang theo dõi
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Theo dõi
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

CompanyCard.displayName = 'CompanyCard';

export default CompanyCard;
