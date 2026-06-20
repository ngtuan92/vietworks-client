import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const maskEmail = (email) => {
  if (!email) return '****';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 4)}****@${domain}`;
};
const maskPhone = (phone) => { if (!phone) return '******'; return `${phone.slice(0, 2)}******${phone.slice(-2)}`; };

const CVSearch = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [salary, setSalary] = useState('');
  const [level, setLevel] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    api.get('/employer/wallet').then(r => { if (r.data.success) setWalletBalance(r.data.data.balance); }).catch(console.error);
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.search = keyword;
      if (skills) params.skills = skills;
      if (location) params.location = location;
      if (experience) params.experience = experience;
      const res = await api.get('/employer/talent-pool', { params });
      if (res.data.success) setCandidates(res.data.data);
    } catch (error) {
      console.error('Fetch candidates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const openUnlock = (candidate) => setUnlockTarget(candidate);
  const closeUnlock = () => setUnlockTarget(null);

  const confirmUnlock = async () => {
    if (!unlockTarget) return;
    setUnlocking(true);
    try {
      await api.post('/employer/talent-pool/' + unlockTarget._id + '/unlock', {
        cvId: unlockTarget.cvId,
        amount: 20000
      });
      setCandidates(candidates.map(c =>
        c._id === unlockTarget._id ? { ...c, isUnlocked: true, email: unlockTarget.email, phone: unlockTarget.phone } : c
      ));
      setWalletBalance(prev => prev - 20000);
      closeUnlock();
    } catch (error) {
      console.error('Unlock error:', error);
      if (error.response?.data?.message === 'Insufficient balance') {
        navigate('/employer/wallet/topup');
      }
    } finally {
      setUnlocking(false);
    }
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
            <button onClick={handleSearch} className="w-full px-4 py-3 rounded-xl bg-[#003f87] text-white font-semibold hover:bg-[#0b4e9f]">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#003f87] border-t-transparent rounded-full"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500">Không tìm thấy ứng viên nào.</div>
        ) : (
          candidates.map((candidate) => {
            const { isUnlocked } = candidate;
            return (
              <div key={candidate._id} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{candidate.fullName}</h3>
                    <p className="text-slate-600">{candidate.title}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {candidate.experienceYears || 'Nhân viên'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Kinh nghiệm" value={candidate.experienceYears ? `${candidate.experienceYears} năm` : '—'} />
                  <Info label="Địa điểm" value={candidate.location?.provinceCode || '—'} />
                  <Info label="Kỹ năng" value={Array.isArray(candidate.skills) ? candidate.skills.slice(0, 3).join(', ') : '—'} />
                  <Info label="Email" value={isUnlocked ? (candidate.email || '—') : maskEmail(candidate.email)} />
                  <Info label="Số điện thoại" value={isUnlocked ? (candidate.phone || '—') : maskPhone(candidate.phone)} />
                </div>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Kỹ năng</p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills || []).map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/employer/talent-pool/${candidate._id}`} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                    Xem chi tiết
                  </Link>
                  {!isUnlocked ? (
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
          })
        )}
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
          <Info label="Tên ứng viên" value={candidate.fullName} />
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
