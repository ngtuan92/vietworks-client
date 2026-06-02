const ContentBlock = ({ title, content }) => (
  <div className="mb-8 last:mb-0">
    <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">
      {title}
    </h2>
    <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed whitespace-pre-line">
      {content || 'Chưa cập nhật.'}
    </div>
  </div>
);

const SkillList = ({ skills = [] }) => {
  if (!skills.length) return null;

  return (
    <div className="mb-8">
      <h2 className="font-headline-md text-headline-md border-l-4 border-primary pl-4 mb-4">
        Kỹ Năng
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill._id || skill.name}
            className="px-3 py-1 bg-[#d9e3f2] text-[#3e4853] text-xs font-semibold rounded-full"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const JobDetailContent = ({ job }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <ContentBlock title="Mô Tả Công Việc" content={job?.description} />
      <ContentBlock title="Yêu Cầu Ứng Viên" content={job?.requirements} />
      <ContentBlock title="Phúc Lợi" content={job?.benefits} />
      <ContentBlock title="Thời Gian Làm Việc" content={job?.workingTime} />
      <ContentBlock title="Cách Thức Ứng Tuyển" content={job?.applyInstruction} />
      <SkillList skills={job?.skills || []} />
    </div>
  );
};

export default JobDetailContent;