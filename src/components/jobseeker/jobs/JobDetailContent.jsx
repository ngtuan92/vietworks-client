const JobDetailContent = ({ job }) => {
  if (!job) return null;

  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      {job.description && (
        <div className="mb-8">
          <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Mô Tả Công Việc</h2>
          <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
            {renderContent(job.description)}
          </div>
        </div>
      )}

      {job.requirements && (
        <div className="mb-8">
          <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Yêu Cầu Ứng Viên</h2>
          <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
            {renderContent(job.requirements)}
          </div>
        </div>
      )}

      {job.benefits && (
        <div>
          <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">Phúc Lợi</h2>
          <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
            {renderContent(job.benefits)}
          </div>
        </div>
      )}

      {job.skills && job.skills.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-on-surface mb-3">Kỹ năng yêu cầu</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#d9e3f2] text-[#3e4853] text-xs font-semibold rounded-full"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailContent;