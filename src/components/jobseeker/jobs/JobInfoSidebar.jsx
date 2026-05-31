import { useNavigate } from 'react-router-dom';

const JobInfoSidebar = ({ job }) => {
  const navigate = useNavigate();
  
  if (!job) return null;

  const experienceLevel = job.experienceLevelId?.name || 'Không yêu cầu';
  const jobLevel = job.jobLevelId?.name || 'Không xác định';
  const workType = job.workLocations?.length > 0 ? 'Toàn thời gian' : 'Không xác định';
  const deadline = job.deadline ? (() => {
    const d = new Date(job.deadline);
    return isNaN(d.getTime()) ? 'Không có' : d.toLocaleDateString('vi-VN');
  })() : 'Không có';
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

  const formatWorkingTime = (workingTime) => {
    if (!workingTime) return 'Không có thông tin';
    return workingTime;
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h3 className="font-headline-md text-headline-md mb-6">Thông Tin Việc Làm</h3>
      <div className="space-y-6">
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">military_tech</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Kinh nghiệm</p>
            <p className="font-semibold text-on-surface font-body-md">{experienceLevel}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">signal_cellular_alt</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Cấp bậc</p>
            <p className="font-semibold text-on-surface font-body-md">{jobLevel}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">work</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Loại hình</p>
            <p className="font-semibold text-on-surface font-body-md">{workType}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">schedule</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Giờ làm việc</p>
            <p className="font-semibold text-on-surface font-body-md">{formatWorkingTime(job.workingTime)}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary shrink-0">alarm_on</span>
          <div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Hạn nộp hồ sơ</p>
            <p className={`font-semibold font-body-md ${isExpired ? 'text-error' : 'text-on-surface'}`}>
              {deadline}
            </p>
          </div>
        </div>
        {job.saturdayPolicy && job.saturdayPolicy !== 'NOT_SPECIFIED' && (
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary shrink-0">calendar_month</span>
            <div>
              <p className="text-on-surface-variant font-body-sm text-body-sm">Chính sách thứ 7</p>
              <p className="font-semibold text-on-surface font-body-md">
                {job.saturdayPolicy === 'WORKING_SATURDAY' ? 'Làm việc Thứ 7' : 'Nghỉ Thứ 7'}
              </p>
            </div>
          </div>
        )}
      </div>

      {job.applyInstruction && (
        <div className="mt-6 pt-6 border-t border-outline-variant">
          <h4 className="font-semibold text-on-surface mb-3">Hướng dẫn ứng tuyển</h4>
          <p className="text-on-surface-variant text-body-sm">{job.applyInstruction}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate(`/jobs/${job._id}/apply`)}
          className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all"
        >
          Ứng tuyển ngay
        </button>
      </div>
    </div>
  );
};

export default JobInfoSidebar;