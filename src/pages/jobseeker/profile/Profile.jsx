import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Bell, LayoutDashboard, FileText, CheckSquare, Heart, ThumbsUp, EyeOff, Award, Shield, Camera, Loader2, Smartphone, Mail } from 'lucide-react';
import authService from '../../../services/authService';
import jobseekerProfileService from '../../../services/jobseekerProfileService';
import useAuth from '../../../hooks/useAuth';


const accountStatusLabel = {
  ACTIVE: 'Đã xác thực',
  UNVERIFIED: 'Chưa xác thực',
  BANNED: 'Bị khóa',
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountStatus: '',
    avatarUrl: null,
    profileVisibility: 'PUBLIC',
    allowEmployerSearch: true,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { updateUser } = useAuth();

  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    jobseekerProfileService.getMyProfile()
      .then((res) => {
        if (res.success) {
          const d = res.data;
          setProfile({
            fullName: d.fullName || '',
            email: d.email || '',
            phone: d.phone || '',
            accountStatus: d.accountStatus || '',
            avatarUrl: d.avatarUrl || null,
            profileVisibility: d.profileVisibility || 'PUBLIC',
            allowEmployerSearch: d.allowEmployerSearch ?? true,
          });
          setAvatarPreview(d.avatarUrl || null);
          // Đồng bộ avatar vào auth store để Navbar hiển thị đúng
          updateUser({ avatarUrl: d.avatarUrl || null });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiện preview ngay từ file local trong lúc upload
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const uploaded = await jobseekerProfileService.uploadAvatar(file);
      const url = uploaded?.data?.fileUrl;
      if (!url) throw new Error('Upload thất bại');

      // Lưu URL ảnh vào hồ sơ
      const res = await jobseekerProfileService.updateMyProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: url,
      });
      if (!res.success) throw new Error('Lưu hồ sơ thất bại');

      setProfile((prev) => ({ ...prev, avatarUrl: url }));
      setAvatarPreview(url);
      updateUser({ avatarUrl: url }); // đồng bộ avatar lên Navbar
    } catch {
      // Khôi phục lại ảnh đã lưu nếu lỗi
      setAvatarPreview(profile.avatarUrl || null);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = (profile.fullName || profile.email || 'U').trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-6xl space-y-6">
        {/* Banner Hero */}
        <section className="rounded-3xl hero-gradient p-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => { if (!avatarUploading) fileInputRef.current.click(); }}>
                <div className="h-20 w-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-black overflow-hidden relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {avatarUploading
                      ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                      : <Camera className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>
              <div>
                <p className="text-sm text-white/75">Trang cá nhân ứng viên</p>
                <h1 className="text-2xl md:text-3xl font-black">{profile.fullName}</h1>
                <p className="text-white/80 mt-1">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/manage-cv" className="px-4 py-2 rounded-xl bg-white text-[#003f87] font-bold text-sm hover:bg-slate-100 transition">
                Quản lý CV
              </Link>
              <Link to="/job-preferences" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 font-bold text-sm hover:bg-white/20 transition">
                Nhu cầu việc làm
              </Link>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-2xl bg-white border border-slate-200 p-3 h-fit space-y-1">
            <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 min-h-[450px]">
            {activeTab === 'overview' && (
              <Overview profile={profile} setProfile={setProfile} />
            )}
            {activeTab === 'security' && (
              <Security security={security} setSecurity={setSecurity} />
            )}
            {activeTab === 'notifications' && <Notifications />}
            {activeTab === 'privacy' && (
              <PrivacySettingsTab
                allowEmployerSearch={profile.allowEmployerSearch}
                setAllowEmployerSearch={(val) => setProfile((p) => ({ ...p, allowEmployerSearch: val }))}
              />
            )}
            {activeTab === 'quickLinks' && <QuickLinks />}
          </div>
        </section>
      </main>
    </div>
  );
};

const ProfileNav = ({ activeTab, setActiveTab }) => {
  const items = [
    { key: 'overview', icon: <User className="w-5 h-5" />, label: 'Thông tin cá nhân' },
    { key: 'security', icon: <Lock className="w-5 h-5" />, label: 'Bảo mật & mật khẩu' },
    { key: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Cài đặt thông báo' },
    { key: 'quickLinks', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Lối tắt hồ sơ' },
  ];

  return items.map((item) => (
    <button
      key={item.key}
      onClick={() => setActiveTab(item.key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition cursor-pointer ${
        activeTab === item.key ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {item.icon}
      <span className="font-bold text-sm">{item.label}</span>
    </button>
  ));
};

const Overview = ({ profile, setProfile }) => {
  const { updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const handleSave = async () => {
    setSubmitting(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const res = await jobseekerProfileService.updateMyProfile({
        fullName: profile.fullName,
        phone: profile.phone,
      });
      if (res.success) {
        setProfile((prev) => ({ ...prev, ...res.data }));
        // Đồng bộ tên/SĐT vào auth store để topbar (Navbar) cập nhật ngay
        updateUser({
          fullName: res.data.fullName ?? profile.fullName,
          phone: res.data.phone ?? profile.phone,
        });
        setStatusMsg({ text: 'Cập nhật thông tin cá nhân thành công!', type: 'success' });
      } else {
        setStatusMsg({ text: res.message || 'Cập nhật thất bại.', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Cập nhật thất bại.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Thông tin cá nhân" description="Dùng để điền tự động khi ứng tuyển và hiển thị trên hồ sơ tuyển dụng." />

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-sm font-semibold ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Họ tên *"
          value={profile.fullName}
          onChange={(value) => setProfile((prev) => ({ ...prev, fullName: value }))}
        />
        <Field label="Email đăng nhập" value={profile.email} readOnly />
        <Field
          label="Số điện thoại"
          value={profile.phone}
          onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))}
        />
        <Field
          label="Trạng thái tài khoản"
          value={accountStatusLabel[profile.accountStatus] || profile.accountStatus}
          readOnly
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </div>
  );
};

const Security = ({ security, setSecurity }) => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    setMessage({ text: '', type: '' });

    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      setMessage({ text: 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.', type: 'error' });
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      setMessage({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmNewPassword: security.confirmPassword,
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ text: response.message || 'Đổi mật khẩu thành công.', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Đổi mật khẩu thất bại.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Bảo mật & đổi mật khẩu" description="Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Mật khẩu hiện tại" type="password" value={security.currentPassword} onChange={(v) => setSecurity((p) => ({ ...p, currentPassword: v }))} />
        <Field label="Mật khẩu mới" type="password" value={security.newPassword} onChange={(v) => setSecurity((p) => ({ ...p, newPassword: v }))} />
        <Field label="Nhập lại mật khẩu mới" type="password" value={security.confirmPassword} onChange={(v) => setSecurity((p) => ({ ...p, confirmPassword: v }))} />
      </div>
      {message.text && (
        <div className={`rounded-xl border p-4 text-sm font-semibold ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={handleChangePassword}
          disabled={submitting}
          className="px-5 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    jobseekerProfileService.getNotificationSettings()
      .then((res) => { if (res.success) setSettings(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (typeCode, channel) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.typeCode === typeCode ? { ...s, [channel]: !s[channel] } : s
      )
    );
  };

  const handleSelectAll = (channel, value) => {
    setSettings((prev) => prev.map((s) => ({ ...s, [channel]: value })));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const res = await jobseekerProfileService.updateNotificationSettings(
        settings.map(({ typeCode, inApp, email }) => ({ typeCode, inApp, email }))
      );
      if (res.success) {
        setStatusMsg({ text: res.message, type: 'success' });
      } else {
        setStatusMsg({ text: res.message || 'Lưu thất bại.', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Lưu thất bại.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3500);
    }
  };

  // Group settings by group name
  const groups = settings.reduce((acc, s) => {
    const g = s.group || 'Khác';
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {});

  const allInApp = settings.length > 0 && settings.every((s) => s.inApp);
  const allEmail = settings.length > 0 && settings.every((s) => s.email);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Cài đặt thông báo"
        description="Chọn kênh nhận thông báo (In-App / Email) cho từng loại sự kiện."
      />

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-sm font-semibold ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {/* Column headers + Select All */}
            <div className="grid grid-cols-[1fr_80px_80px] bg-slate-50 border-b border-slate-200 px-4 py-3 gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loại thông báo</span>
              <button
                onClick={() => handleSelectAll('inApp', !allInApp)}
                className="flex flex-col items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>In-App</span>
                <span className={`text-[10px] ${allInApp ? 'text-primary' : 'text-slate-400'}`}>
                  {allInApp ? 'Tắt tất cả' : 'Bật tất cả'}
                </span>
              </button>
              <button
                onClick={() => handleSelectAll('email', !allEmail)}
                className="flex flex-col items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
                <span className={`text-[10px] ${allEmail ? 'text-primary' : 'text-slate-400'}`}>
                  {allEmail ? 'Tắt tất cả' : 'Bật tất cả'}
                </span>
              </button>
            </div>

            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                {/* Group label */}
                <div className="px-4 py-2 bg-blue-50 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-primary uppercase tracking-wide">{groupName}</span>
                </div>

                {items.map((s, idx) => (
                  <div
                    key={s.typeCode}
                    className={`grid grid-cols-[1fr_80px_80px] items-center gap-2 px-4 py-4 hover:bg-slate-50 transition ${
                      idx < items.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                    </div>

                    {/* In-App toggle */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggle(s.typeCode, 'inApp')}
                        className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${s.inApp ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${s.inApp ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {/* Email toggle */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggle(s.typeCode, 'email')}
                        className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${s.email ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${s.email ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <strong>In-App</strong> — thông báo hiển thị trong ứng dụng web
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <strong>Email</strong> — thông báo gửi tới hòm thư của bạn
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const PrivacySettingsTab = ({ allowEmployerSearch, setAllowEmployerSearch }) => {
  const [pending, setPending] = useState(allowEmployerSearch);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    setPending(allowEmployerSearch);
  }, [allowEmployerSearch]);

  const isDirty = pending !== allowEmployerSearch;

  const handleSave = async () => {
    setSubmitting(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const res = await jobseekerProfileService.updatePrivacy({ allowEmployerSearch: pending });
      if (res.success) {
        setAllowEmployerSearch(res.data.allowEmployerSearch);
        setStatusMsg({ text: res.message, type: 'success' });
      } else {
        setStatusMsg({ text: res.message || 'Cập nhật thất bại.', type: 'error' });
      }
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.message || 'Cập nhật thất bại.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3500);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Quyền riêng tư hồ sơ"
        description="Kiểm soát việc Nhà tuyển dụng có thể chủ động tìm thấy bạn trong cơ sở dữ liệu ứng viên (Talent Pool) hay không."
      />

      {statusMsg.text && (
        <div className={`p-4 rounded-xl border text-sm font-semibold ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Toggle card */}
      <div className="rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${pending ? 'bg-emerald-50' : 'bg-slate-100'}`}>
            <EyeOff className={`w-5 h-5 ${pending ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm md:text-base">
              Cho phép nhà tuyển dụng tìm thấy hồ sơ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Khi tắt tùy chọn này, hồ sơ của bạn sẽ bị ẩn khỏi công cụ tìm kiếm của NTD.
              Tuy nhiên bạn vẫn ứng tuyển các tin tuyển dụng bình thường.
            </p>
          </div>
        </div>
        <button
          onClick={() => setPending((v) => !v)}
          aria-label="Toggle privacy"
          className={`relative h-7 w-14 rounded-full transition-colors flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${pending ? 'bg-primary' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${pending ? 'left-7' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl p-4 border flex items-center gap-3 transition-all ${
        pending
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <span className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${pending ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <span className="text-xs font-semibold">
          {pending
            ? 'HỒ SƠ CÔNG KHAI — Nhà tuyển dụng có thể tìm thấy và xem hồ sơ của bạn'
            : 'HỒ SƠ ẨN — Chỉ hiển thị khi bạn chủ động nộp đơn ứng tuyển'}
        </span>
      </div>

      {/* Info box */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 space-y-1">
        <p className="font-bold">Lưu ý về quyền riêng tư</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Dù bật hay tắt, bạn vẫn có thể ứng tuyển bất kỳ tin tuyển dụng nào bình thường.</li>
          <li>Khi <strong>bật</strong>, hồ sơ của bạn xuất hiện trong Talent Pool — NTD có thể chủ động liên hệ bạn.</li>
          <li>Khi <strong>tắt</strong>, hồ sơ bị ẩn hoàn toàn khỏi kết quả tìm kiếm của NTD.</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={submitting || !isDirty}
          className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Đang lưu...' : 'Lưu quyền riêng tư'}
        </button>
      </div>
    </div>
  );
};

const QuickLinks = () => {
  const links = [
    { to: '/manage-cv', icon: <FileText className="w-5 h-5" />, title: 'CV của tôi', desc: 'Tạo, upload, chỉnh sửa và tải CV' },
    { to: '/applied-jobs', icon: <CheckSquare className="w-5 h-5" />, title: 'Việc đã ứng tuyển', desc: 'Theo dõi tiến độ duyệt hồ sơ của NTD' },
    { to: '/saved-jobs', icon: <Heart className="w-5 h-5" />, title: 'Việc đã lưu', desc: 'Các công việc bạn đã lưu để xem lại sau' },
    { to: '/matched-jobs', icon: <ThumbsUp className="w-5 h-5" />, title: 'Việc làm phù hợp', desc: 'Cơ hội việc làm tự động gợi ý theo nhu cầu' },
    { to: '/ai-cv-review', icon: <Award className="w-5 h-5" />, title: 'AI CV Review', desc: 'Phân tích điểm số và cải thiện CV bằng trí tuệ nhân tạo' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Lối tắt hồ sơ" description="Bảng điều khiển các chức năng quản lý cá nhân của ứng viên." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="rounded-2xl border border-slate-200 p-4 hover:border-primary hover:bg-blue-50/50 transition">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                {link.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{link.title}</p>
                <p className="text-xs text-slate-500 mt-1">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', readOnly = false }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 mb-2">{label}</span>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary transition-all ${
        readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white'
      }`}
    />
  </label>
);

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-lg font-black text-slate-900">{title}</h2>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);

export { PrivacySettingsTab as PrivacySettings };
export default Profile;
