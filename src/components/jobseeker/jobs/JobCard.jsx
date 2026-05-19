

const JobCard = ({
  title,
  company,
  location,
  salary,
  logo,
  updatedTime,
  tags = [],
  experience,
  level,
  workType,
  deadline,
  showExtra = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#003f87] transition-all group cursor-pointer">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 p-2">
          <img className="w-full h-full object-contain group-hover:scale-110 transition-transform" src={logo} alt={company} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-lg font-bold text-black group-hover:text-[#003f87] transition-colors line-clamp-1">{title}</h3>
              <p className="text-gray-600 font-medium">{company}</p>
            </div>
            <button className="text-gray-400 hover:text-[#003f87] transition-colors">
              <span className="material-symbols-outlined">bookmark_add</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="material-symbols-outlined text-base">payments</span>
              <span className="text-sm font-bold text-[#003f87]">{salary}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="material-symbols-outlined text-base">location_on</span>
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span className="text-sm">{updatedTime}</span>
            </div>
          </div>

          {showExtra ? (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {experience ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="material-symbols-outlined text-base">workspace_premium</span>
                  <span className="text-sm">{experience}</span>
                </div>
              ) : null}
              {level ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span className="text-sm">{level}</span>
                </div>
              ) : null}
              {workType ? (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="material-symbols-outlined text-base">work_history</span>
                  <span className="text-sm">{workType}</span>
                </div>
              ) : null}
              {deadline ? (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <span className="material-symbols-outlined text-base">event</span>
                  <span className="text-sm font-medium">Hạn nộp: {deadline}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-[#d9e3f2] text-[#3e4853] text-xs font-semibold rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
