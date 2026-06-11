import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    role: 'Backend Developer',
    exp: '4 năm',
    skills: ['Node.js', 'PostgreSQL', 'Docker'],
    location: 'TP. Hồ Chí Minh',
    salary: '30 - 40 triệu',
    level: 'Senior',
    publicProfile: true,
    email: 'nguyenminhanh@gmail.com',
    phone: '0901234123',
  },
  {
    id: 2,
    name: 'Lê Gia Huy',
    role: 'UI/UX Designer',
    exp: '2 năm',
    skills: ['Figma', 'Design system', 'Prototyping'],
    location: 'Hà Nội',
    salary: '20 - 28 triệu',
    level: 'Junior',
    publicProfile: true,
    email: 'legiahuy@gmail.com',
    phone: '0912345566',
  },
  {
    id: 3,
    name: 'Trần Bảo Ngọc',
    role: 'Data Analyst',
    exp: '3 năm',
    skills: ['SQL', 'Power BI', 'Python'],
    location: 'Đà Nẵng',
    salary: '18 - 25 triệu',
    level: 'Nhân viên',
    publicProfile: false, // should be hidden
    email: 'tranbaongoc@gmail.com',
    phone: '0923456677',
  },
];

const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 4)}****@${domain}`;
};
const maskPhone = (phone) => `${phone.slice(0, 2)}******${phone.slice(-2)}`;

const CVSearch = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [salary, setSalary] = useState('');
  const [level, setLevel] = useState('');
  const [walletBalance, setWalletBalance] = useState(55000);
  const [unlockedIds, setUnlockedIds] = useState([2]);
  const [unlockTarget, setUnlockTarget] = useState(null);

  const candidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((c) => {
      if (!c.publicProfile) return false; // ràng buộc private profile
      if (keyword) {
        const blob = `${c.name} ${c.role} ${c.skills.join(' ')}`.toLowerCase();
        if (!blob.includes(keyword.toLowerCase())) return false;
      }
      if (location && c.location !== location) return false;
      if (experience && c.exp !== experience) return false;
      if (skills && !c.skills.join(' ').toLowerCase().includes(skills.toLowerCase())) return false;
      if (industry) {
        // UI-only filter hook
      }
      if (salary && c.salary !== salary) return false;
      if (level && c.level !== level) return false;
      return true;
    });
  }, [keyword, location, experience, skills, industry, salary, level]);

  const openUnlock = (candidate) => setUnlockTarget(candidate);
  const closeUnlock = () => setUnlockTarget(null);

  const confirmUnlock = () => {
    if (!unlockTarget) return;
    const cost = 20000;
    if (walletBalance < cost) return;
    setWalletBalance((prev) => prev - cost);
    setUnlockedIds((prev) => [...new Set([...prev, unlockTarget.id])]);
    closeUnlock();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tìm kiếm ứng viên</h1>
          <p className="text-slate-600 mt-1">Tìm ứng viên chủ động trong danh sách hồ sơ public.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
            Số dư ví: {walletBalance.toLocaleString('vi-VN')} VNĐ
          </div>
          <Link to="/employer/unlocked-candidates" className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Ứng viên đã mở khóa
          </Link>
        </div>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Field label="Từ khóa" value={keyword} onChange={setKeyword} placeholder="Vị trí, kỹ năng..." />
          <Select label="Địa điểm" value={location} onChange={setLocation} options={['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']} />
          <Select label="Kinh nghiệm" value={experience} onChange={setExperience} options={['1 năm', '2 năm', '3 năm', '4 năm']} />
          <Field label="Kỹ năng" value={skills} onChange={setSkills} placeholder="Node.js, React..." />
          <Select label="Ngành nghề" value={industry} onChange={setIndustry} options={['Công nghệ thông tin', 'Thiết kế', 'Marketing']} />
          <Select label="Mức lương mong muốn" value={salary} onChange={setSalary} options={['18 - 25 triệu', '20 - 28 triệu', '30 - 40 triệu']} />
          <Select label="Cấp bậc" value={level} onChange={setLevel} options={['Nhân viên', 'Junior', 'Senior']} />
          <div className="flex items-end">
            <button className="w-full px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {candidates.map((candidate) => {
          const unlocked = unlockedIds.includes(candidate.id);
          return (
            <div key={candidate.id} className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                  <p className="text-slate-600">{candidate.role}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {candidate.level}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="Kinh nghiệm" value={candidate.exp} />
                <Info label="Địa điểm" value={candidate.location} />
                <Info label="Mức lương mong muốn" value={candidate.salary} />
                <Info label="Email" value={unlocked ? candidate.email : maskEmail(candidate.email)} />
                <Info label="Số điện thoại" value={unlocked ? candidate.phone : maskPhone(candidate.phone)} />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Kỹ năng</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/employer/talent-pool/${candidate.id}`} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                  Xem chi tiết
                </Link>
                {!unlocked ? (
                  <button
                    onClick={() => openUnlock(candidate)}
                    className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50"
                  >
                    Mở khóa CV
                  </button>
                ) : (
                  <>
                    <button className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Tải CV</button>
                    <button onClick={() => navigate('/employer/messages')} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Chat</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {unlockTarget ? (
        <UnlockCVModal
          candidate={unlockTarget}
          balance={walletBalance}
          onClose={closeUnlock}
          onConfirm={confirmUnlock}
          onTopUp={() => navigate('/employer/wallet/topup')}
        />
      ) : null}
    </div>
  );
};

const UnlockCVModal = ({ candidate, balance, onClose, onConfirm, onTopUp }) => {
  const cost = 20000;
  const after = balance - cost;
  const insufficient = after < 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Mở khóa CV ứng viên</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <Info label="Tên ứng viên" value={candidate.name} />
          <Info label="Chi phí" value={`${cost.toLocaleString('vi-VN')} VNĐ / 1 CV`} />
          <Info label="Số dư hiện tại" value={`${balance.toLocaleString('vi-VN')} VNĐ`} />
          <Info label="Số dư sau giao dịch" value={`${Math.max(after, 0).toLocaleString('vi-VN')} VNĐ`} />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
            Không hoàn tiền sau khi mở khóa.
          </div>
          {insufficient ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">
              Số dư ví không đủ để mở khóa CV này.
            </div>
          ) : null}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700">Hủy</button>
          {insufficient ? (
            <button onClick={onTopUp} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold">
              Nạp tiền ngay
            </button>
          ) : (
            <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
              Xác nhận mở khóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
    >
      <option value="">Tất cả</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default CVSearch;
