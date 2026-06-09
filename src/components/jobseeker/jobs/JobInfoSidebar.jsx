import { Award, Signal, LayoutGrid, Briefcase, Calendar, Clock } from 'lucide-react';

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const saturdayMap = {
  NOT_SPECIFIED: 'Không đề cập',
  WORK_SATURDAY: 'Có làm Thứ 7',
  OFF_SATURDAY: 'Nghỉ Thứ 7',
};

const InfoItem = ({ icon, label, value, danger = false }) => (
  <div className="flex gap-4">
    <span className="text-primary shrink-0">{icon}</span>
    <div>
      <p className="text-on-surface-variant font-body-sm text-body-sm">{label}</p>
      <p className={`font-semibold font-body-md ${danger ? 'text-error' : 'text-on-surface'}`}>
        {value || '-'}
      </p>
    </div>
  </div>
);

const JobInfoSidebar = ({ job }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <h3 className="font-headline-md text-headline-md mb-6">Thông Tin Việc Làm</h3>

      <div className="space-y-6">
        <InfoItem
          icon={<Award className="w-5 h-5" />}
          label="Kinh nghiệm"
          value={job?.experienceLevelId?.name}
        />

        <InfoItem
          icon={<Signal className="w-5 h-5" />}
          label="Cấp bậc"
          value={job?.jobLevelId?.name}
        />

        <InfoItem
          icon={<LayoutGrid className="w-5 h-5" />}
          label="Ngành nghề"
          value={job?.careerId?.name}
        />

        <InfoItem
          icon={<Briefcase className="w-5 h-5" />}
          label="Vị trí"
          value={job?.careerPositionId?.name}
        />

        <InfoItem
          icon={<Calendar className="w-5 h-5" />}
          label="Chính sách Thứ 7"
          value={saturdayMap[job?.saturdayPolicy]}
        />

        <InfoItem
          icon={<Clock className="w-5 h-5" />}
          label="Hạn nộp hồ sơ"
          value={formatDate(job?.deadline)}
          danger
        />
      </div>
    </div>
  );
};

export default JobInfoSidebar;