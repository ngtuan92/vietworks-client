import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Check, Building2 } from 'lucide-react';

const CompanyCard = ({
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

  return (
    <div className="rounded-2xl border-2 border-orange-300 bg-white p-4 hover:shadow-md transition-all flex items-start gap-4">
      <Link
        to={`/companies/${company._id}`}
        className="h-16 w-16 rounded-xl border border-orange-200 overflow-hidden bg-orange-50 flex items-center justify-center shrink-0"
      >
        {showLogo ? (
          <img
            src={company.avatarUrl}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className="text-2xl font-bold text-orange-700">
            {company.name?.charAt(0) || <Building2 className="w-7 h-7" />}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/companies/${company._id}`}
          className="block"
        >
          <h2 className="text-base font-black text-orange-700 line-clamp-1 uppercase hover:text-orange-800 transition">
            {company.name}
          </h2>
        </Link>
        {industry && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-1">
            {industry}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3 text-xs text-slate-500 min-w-0">
            {openJobsCount > 0 && (
              <span className="flex items-center gap-1 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
                {openJobsCount} việc làm
              </span>
            )}
          </div>
          {showFollowButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) onFollowClick(company._id);
              }}
              disabled={disabled}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 disabled:opacity-60 ${
                followMode === 'remove'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
