
import { useParams } from 'react-router-dom';

const CandidateDetail = () => {
  const { id } = useParams();
  const unlocked = id === '2';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chi tiết ứng viên Talent Pool</h1>
        <p className="text-slate-600 mt-1">Ứng viên #{id}</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <Info label="Họ tên" value={unlocked ? 'Lê Gia Huy' : 'Lê G*** H**'} />
          <Info label="Email" value={unlocked ? 'legiahuy@gmail.com' : 'legi****@gmail.com'} />
          <Info label="Số điện thoại" value={unlocked ? '0912345566' : '09******66'} />
          <Info label="Kinh nghiệm" value="2 năm" />
          <Info label="Vị trí mong muốn" value="UI/UX Designer" />
          <Info label="Địa điểm" value="Hà Nội" />
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
          <h3 className="font-semibold text-slate-900">Preview CV</h3>
          <p className="text-sm text-slate-600 mt-1">
            {unlocked ? 'Đã mở khóa: xem đầy đủ CV, tải CV, chat với ứng viên.' : 'Chưa mở khóa: thông tin liên hệ và CV đầy đủ đang bị che.'}
          </p>
        </div>
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default CandidateDetail;
