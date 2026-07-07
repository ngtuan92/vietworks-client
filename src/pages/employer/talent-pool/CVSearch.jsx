import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { getOrCreateConversation } from '../../../services/chatService';
import { useNotification } from '../../../contexts/NotificationContext';
import * as jobApi from '../../../services/jobService';
import { EXPERIENCE_LEVELS } from '../../../constants/masterDataConstants';
import companyLocationService from '../../../services/companyLocationService';

const maskEmail = (email) => {
  if (!email) return '****';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 4)}****@${domain}`;
};
const maskPhone = (phone) => { if (!phone) return '******'; return `${phone.slice(0, 2)}******${phone.slice(-2)}`; };



const CVSearch = () => {
  const navigate = useNavigate();
  const { error } = useNotification();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [salary, setSalary] = useState('');
  const [level, setLevel] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [unlockCredits, setUnlockCredits] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await companyLocationService.getProvinces();
        if (res.success) {
          setProvinces(res.data || []);
        } else {
          setProvinces(Array.isArray(res) ? res : (res.data || []));
        }
      } catch (err) {
        console.error('Failed to fetch provinces', err);
      }
    };
    fetchProvinces();

    const fetchInitialMasterData = async () => {
      try {
        const [resGroups, resLevels, resSkills] = await Promise.all([
          jobApi.getCareerGroups(),
          jobApi.getJobLevels(),
          jobApi.getAllSkills()
        ]);
        if (resGroups.success) setCareerGroups(resGroups.data);
        if (resLevels.success) setJobLevels(resLevels.data);
        if (resSkills.success) setAllSkills(resSkills.data);
      } catch (e) {
        console.error('Failed to fetch master data', e);
      }
    };
    fetchInitialMasterData();

    api.get('/employer/wallet').then(r => { if (r.data.success) setWalletBalance(r.data.data.balance); }).catch(console.error);
    api.get('/employer/cv-unlock/credits').then(r => {
      if (r.data.success) {
        const total = r.data.data.reduce((acc, bag) => acc + bag.remainingCredits, 0);
        setUnlockCredits(total);
      }
    }).catch(console.error);
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
      if (industry) params.industry = industry;
      if (salary) params.salary = salary;
      if (level) params.level = level;
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
      });
      // Refetch toàn bộ: email/phone chỉ có sau khi BE đã ghi UnlockedCandidate
      await fetchCandidates();
      api.get('/employer/cv-unlock/credits').then(r => {
        if (r.data.success) {
          const total = r.data.data.reduce((acc, bag) => acc + bag.remainingCredits, 0);
          setUnlockCredits(total);
        }
      });
      closeUnlock();
    } catch (error) {
      console.error('Unlock error:', error);
      if (error.response?.data?.code === 'INSUFFICIENT_BALANCE') {
        navigate('/employer/wallet/topup');
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleChat = async (candidateId) => {
    try {
      setChatLoadingId(candidateId);
      const res = await getOrCreateConversation(null, candidateId);
      if (res.success) {
        navigate(`/employer/messages?conversationId=${res.data._id}`);
      }
    } catch (err) {
      console.error('Cannot create chat', err);
      error('Lỗi tạo phòng chat. Vui lòng thử lại.');
    } finally {
      setChatLoadingId(null);
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
          <Select label="Địa điểm" value={location} onChange={setLocation} options={provinces.map(p => ({ value: p.code, label: p.name }))} />
          <Select label="Kinh nghiệm" value={experience} onChange={setExperience} options={[{value: '', label: 'Tất cả kinh nghiệm'}, ...EXPERIENCE_LEVELS.map(e => ({ value: e, label: e }))]} />
          <Select label="Ngành nghề" value={industry} onChange={setIndustry} options={careerGroups.map(c => ({ value: c._id, label: c.name }))} />
          <Select label="Mức lương" value={salary} onChange={setSalary} options={[
            { value: '', label: 'Tất cả mức lương' },
            { value: '0-9.999', label: 'Dưới 10 triệu' },
            { value: '10-20', label: '10 - 20 triệu' },
            { value: '20-30', label: '20 - 30 triệu' },
            { value: '30.001-999', label: 'Trên 30 triệu' }
          ]} />
          <Select label="Cấp bậc" value={level} onChange={setLevel} options={jobLevels.map(l => ({ value: l._id, label: l.name }))} />
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
            const { isUnlocked, isBoosted } = candidate;
            return (
              <div
                key={candidate._id}
                className={`bg-white border rounded-2xl p-5 transition-all ${
                  isBoosted
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-md shadow-amber-100/50'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{candidate.fullName}</h3>
                      {isBoosted && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm"
                          title="Ứng viên này đang dùng gói Boost CV - ưu tiên hiển thị"
                        >
                          ⚡ Boosted
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-0.5">{candidate.title}</p>
                  </div>
                  {candidate.experienceYears ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 shrink-0">
                      {candidate.experienceYears}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Kinh nghiệm" value={candidate.experienceYears || '—'} />
                  <Info label="Địa điểm" value={candidate.location?.provinceCode || '—'} />
                  <Info label="Email" value={isUnlocked ? (candidate.email || '—') : maskEmail(candidate.email)} />
                  <Info label="Số điện thoại" value={isUnlocked ? (candidate.phone || '—') : maskPhone(candidate.phone)} />
                </div>


                <div className="mt-5 flex flex-wrap gap-2">
                  {!isUnlocked ? (
                    <button
                      onClick={() => openUnlock(candidate)}
                      className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50"
                    >
                      Mở khóa CV
                    </button>
                  ) : (
                    <>
                      {candidate.fileUrl && (
                        <button 
                          onClick={() => setPreviewTarget(candidate)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                        >
                          Xem / Tải CV
                        </button>
                      )}
                      <button 
                        onClick={() => handleChat(candidate._id)} 
                        disabled={chatLoadingId === candidate._id}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        {chatLoadingId === candidate._id ? 'Đang tải...' : 'Chat'}
                      </button>
                      {candidate.isInvited ? (
                        <button 
                          disabled
                          className="px-3 py-2 rounded-xl bg-green-50 text-green-600 font-semibold border border-green-200 cursor-not-allowed"
                        >
                          Đã mời phỏng vấn
                        </button>
                      ) : (
                        <button 
                          onClick={() => setInviteTarget(candidate)}
                          className="px-3 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 shadow-sm shadow-primary/20"
                        >
                          Mời phỏng vấn
                        </button>
                      )}
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
          credits={unlockCredits}
          onClose={closeUnlock}
          onConfirm={confirmUnlock}
          onBuyPackage={() => navigate('/employer/services')}
        />
      ) : null}

      {previewTarget ? (
        <CVPreviewModal
          candidate={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      ) : null}

      {inviteTarget ? (
        <TalentPoolInterviewModal
          candidate={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSuccess={() => {
            setCandidates(prev => prev.map(c => c._id === inviteTarget._id ? { ...c, isInvited: true } : c));
            setInviteTarget(null);
          }}
        />
      ) : null}
    </div>
  );
};

const CVPreviewModal = ({ candidate, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    const loadPreview = async () => {
      try {
        if (!candidate?.fileUrl) {
          setError(true);
          setLoading(false);
          return;
        }
        
        // Fetch the PDF via the proxy endpoint to bypass attachment headers
        const res = await api.get(`/view-pdf`, {
          params: { url: candidate.fileUrl },
          responseType: 'blob'
        });
        
        objectUrl = URL.createObjectURL(res.data);
        setPreviewUrl(objectUrl);
      } catch (err) {
        console.error('Failed to load CV preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreview();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [candidate]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-900">Chi tiết CV: {candidate.fullName}</h3>
          <div className="flex items-center gap-3">
            {previewUrl && (
              <a 
                href={previewUrl} 
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90"
                download={candidate.fileName || 'CV.pdf'}
              >
                Tải CV xuống
              </a>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200">✕</button>
          </div>
        </div>
        <div className="flex-1 p-5 bg-slate-100 overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error || !previewUrl ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Không thể tải file CV để xem trước. Bạn có thể tải xuống để xem.
            </div>
          ) : (
            <object data={previewUrl} type="application/pdf" className="w-full h-full rounded-xl border border-slate-200 shadow-sm">
              <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
            </object>
          )}
        </div>
      </div>
    </div>
  );
};

const UnlockCVModal = ({ candidate, credits, onClose, onConfirm, onBuyPackage }) => {
  const insufficient = credits <= 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Mở khóa CV ứng viên</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <Info label="Tên ứng viên" value={candidate.fullName} />
          <Info label="Lượt mở khóa hiện tại" value={`${credits} lượt`} />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
            Mỗi lần mở khóa sẽ trừ đi 1 lượt từ gói dịch vụ của bạn. Không hoàn lại lượt sau khi đã mở khóa.
          </div>
          {insufficient ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">
              Bạn chưa có hoặc đã dùng hết lượt mở khóa CV. Hãy mua một gói dịch vụ để tiếp tục!
            </div>
          ) : null}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700">Hủy</button>
          {insufficient ? (
            <button onClick={onBuyPackage} className="px-4 py-2 rounded-xl bg-primary text-white font-semibold">
              Mua gói mở khóa CV
            </button>
          ) : (
            <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
              Xác nhận mở khóa (-1 lượt)
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
      {options.map((opt) => {
        const isObj = typeof opt === 'object';
        const val = isObj ? opt.value : opt;
        const lbl = isObj ? opt.label : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

const TalentPoolInterviewModal = ({ candidate, onClose, onSuccess }) => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  const [formData, setFormData] = useState({
    jobId: '',
    interviewTime: '',
    interviewType: 'OFFLINE',
    location: '',
    contactPerson: '',
    contactPhone: '',
    note: ''
  });

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, contactPhone: val });
    if (val && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val.replace(/\s+/g, ''))) {
      setPhoneError('SĐT không hợp lệ');
    } else {
      setPhoneError('');
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch ALL jobs created by the employer (assuming getMyJobs returns an array or object with data array)
        const res = await jobApi.getMyJobs({ limit: 100 });
        const allJobs = res.data?.jobs || res.data || [];
        // Only allow inviting to PUBLISHED jobs
        setJobs(allJobs.filter(j => j.status === 'PUBLISHED'));
      } catch (err) {
        console.error('Failed to load employer jobs', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contactPhone && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.contactPhone.replace(/\s+/g, ''))) {
      return setPhoneError('Vui lòng nhập SĐT hợp lệ');
    }
    
    setLoading(true);
    try {
      await api.post(`/employer/talent-pool/${candidate._id}/interview-invitation`, formData);
      success('Đã gửi lời mời phỏng vấn thành công!');
      onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi thư mời');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col my-8">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900">Mời ứng viên phỏng vấn</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {loadingJobs ? (
            <div className="py-8 text-center text-slate-500">Đang tải danh sách công việc...</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Bạn chưa có công việc nào đang tuyển. Vui lòng đăng tin tuyển dụng trước khi mời ứng viên.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mời cho vị trí <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary bg-white"
                >
                  <option value="" disabled>-- Chọn công việc đang tuyển --</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian phỏng vấn <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={formData.interviewTime}
                  onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hình thức <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.interviewType}
                  onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary bg-white"
                >
                  <option value="OFFLINE">Trực tiếp (Offline)</option>
                  <option value="ONLINE">Trực tuyến (Online)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Địa điểm / Link Meeting <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập địa chỉ hoặc link Meet/Zoom..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Người liên hệ (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Ms. Hoa (HR)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">SĐT liên hệ (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: 0987..."
                    value={formData.contactPhone}
                    onChange={handlePhoneChange}
                    className={`w-full rounded-xl border px-4 py-2.5 outline-none transition-colors ${phoneError ? 'border-red-500 focus:border-red-500 bg-red-50 text-red-900' : 'border-slate-200 focus:border-primary'}`}
                  />
                  {phoneError && <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú thêm (Tùy chọn)</label>
                <textarea
                  rows="3"
                  placeholder="Ví dụ: Trang phục, mang theo hồ sơ..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 border border-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi lời mời'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CVSearch;
