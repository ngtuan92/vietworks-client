import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Bell, LayoutDashboard, FileText, CheckSquare, Heart, ThumbsUp, EyeOff, Award, Shield, Camera } from 'lucide-react';
import authService from '../../../services/authService';

const notificationOptions = [
  'Nhà tuyển dụng đã xem CV của tôi',
  'Lời mời phỏng vấn / kết quả ứng tuyển từ doanh nghiệp',
  'Được gợi ý việc làm phù hợp theo nhu cầu',
  'Tính năng mới, mẹo viết CV & mẫu CV mới ra mắt',
  'Thanh toán gói dịch vụ và hóa đơn',
];

const Profile = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null') || {};
    } catch {
      return {};
    }
  })();

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState({
    fullName: user.fullName || 'Nguyễn Văn A',
    email: user.email || 'nguyenvana@gmail.com',
    phone: user.phone || '0987654321',
  });
  
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState(() => notificationOptions.reduce((acc, item) => ({ ...acc, [item]: true }), {}));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const initials = (profile.fullName || profile.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-6xl space-y-6">
        {/* Banner Hero */}
        <section className="rounded-3xl hero-gradient p-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
                <div className="h-20 w-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-black overflow-hidden relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  {/* Hover Camera Icon overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div>
                <p className="text-sm text-white/75">Trang cá nhân ứng viên</p>
                <h1 className="text-2xl md:text-3xl font-black">{profile.fullName}</h1>
                <p className="text-white/80 mt-1">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/manage-cv" className="px-4 py-2 rounded-xl bg-white text-[#003f87] font-bold text-sm hover:bg-slate-100 transition">Quản lý CV</Link>
              <Link to="/job-preferences" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 font-bold text-sm hover:bg-white/20 transition">Nhu cầu việc làm</Link>
            </div>
          </div>
        </section>

        {/* Body content */}
        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-2xl bg-white border border-slate-200 p-3 h-fit space-y-1">
            <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 min-h-[450px]">
            {activeTab === 'overview' && <Overview profile={profile} setProfile={setProfile} />}
            {activeTab === 'security' && <Security security={security} setSecurity={setSecurity} />}
            {activeTab === 'notifications' && <Notifications notifications={notifications} setNotifications={setNotifications} />}
            {activeTab === 'privacy' && <PrivacySettingsTab />}
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
    { key: 'privacy', icon: <Shield className="w-5 h-5" />, label: 'Quyền riêng tư' },
    { key: 'quickLinks', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Lối tắt hồ sơ' },
  ];

  return items.map((item) => (
    <button
      key={item.key}
      onClick={() => setActiveTab(item.key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition cursor-pointer ${activeTab === item.key ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-50'}`}
    >
      {item.icon}
      <span className="font-bold text-sm">{item.label}</span>
    </button>
  ));
};

const Overview = ({ profile, setProfile }) => {
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = () => {
    setSubmitting(true);
    setStatusMsg('');
    setTimeout(() => {
      setSubmitting(false);
      setStatusMsg('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setStatusMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Thông tin cá nhân" description="Dùng để điền tự động khi ứng tuyển và hiển thị trên hồ sơ tuyển dụng." />
      
      {statusMsg && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Họ tên *" value={profile.fullName} onChange={(value) => setProfile((prev) => ({ ...prev, fullName: value }))} />
        <Field label="Email đăng nhập" value={profile.email} readOnly />
        <Field label="Số điện thoại *" value={profile.phone} onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))} />
        <Field label="Trạng thái tài khoản" value="Đã xác thực (ACTIVE)" readOnly />
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </div>
  );
};

const Security = ({ security, setSecurity }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    setMessage('');

    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      setMessage('Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.');
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmNewPassword: security.confirmPassword,
      });
      setSecurity((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setMessage(response.message || 'Đổi mật khẩu thành công.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Bảo mật & đổi mật khẩu" description="Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Mật khẩu hiện tại" type="password" value={security.currentPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, currentPassword: value }))} />
        <Field label="Mật khẩu mới" type="password" value={security.newPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, newPassword: value }))} />
        <Field label="Nhập lại mật khẩu mới" type="password" value={security.confirmPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, confirmPassword: value }))} />
      </div>
      {message ? <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">{message}</div> : null}
      <div className="flex justify-end">
        <button onClick={handleChangePassword} disabled={submitting} className="px-5 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
          {submitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
};

const Notifications = ({ notifications, setNotifications }) => {
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = () => {
    setSubmitting(true);
    setStatusMsg('');
    setTimeout(() => {
      setSubmitting(false);
      setStatusMsg('Lưu cài đặt thông báo thành công!');
      setTimeout(() => setStatusMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="Cài đặt thông báo" description="Lựa chọn các loại thông báo bạn muốn nhận qua Email và hệ thống in-app." />
      
      {statusMsg && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
        {notificationOptions.map((item) => (
          <label key={item} className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50">
            <span className="font-semibold text-slate-700 text-sm">{item}</span>
            <input type="checkbox" checked={notifications[item]} onChange={(event) => setNotifications((prev) => ({ ...prev, [item]: event.target.checked }))} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={submitting} className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition cursor-pointer disabled:opacity-50">
          {submitting ? 'Đang lưu...' : 'Lưu cài đặt'}
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

const PrivacySettingsTab = () => {
  const [allowSearch, setAllowSearch] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = () => {
    setSubmitting(true);
    setStatusMsg('');
    setTimeout(() => {
      setSubmitting(false);
      setStatusMsg('Cập nhật cài đặt quyền riêng tư thành công!');
      setTimeout(() => setStatusMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Quyền riêng tư hồ sơ" description="Kiểm soát việc Nhà tuyển dụng có thể chủ động tìm thấy bạn trong cơ sở dữ liệu ứng viên (Talent Pool) hay không." />
      
      {statusMsg && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
            <EyeOff className="w-5 h-5 text-primary" />
            Cho phép nhà tuyển dụng tìm thấy hồ sơ
          </h2>
          <p className="text-xs text-slate-500 mt-1">Khi tắt tùy chọn này, hồ sơ của bạn sẽ bị ẩn khỏi công cụ tìm kiếm của NTD. Tuy nhiên bạn vẫn ứng tuyển các tin tuyển dụng bình thường.</p>
        </div>
        <button 
          onClick={() => setAllowSearch((prev) => !prev)} 
          className={`relative h-7 w-14 rounded-full transition flex-shrink-0 cursor-pointer ${allowSearch ? 'bg-primary' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${allowSearch ? 'left-7.5' : 'left-0.5'}`} />
        </button>
      </div>
      <div className={`rounded-xl p-4 text-xs font-semibold ${allowSearch ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
        Trạng thái hiện tại: {allowSearch ? 'HỒ SƠ CÔNG KHAI - Nhà tuyển dụng có thể xem hồ sơ của bạn' : 'HỒ SƠ ẨN - Chỉ hiển thị khi bạn nộp đơn ứng tuyển'}
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={submitting} className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition cursor-pointer disabled:opacity-50">
          {submitting ? 'Đang lưu...' : 'Lưu quyền riêng tư'}
        </button>
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
      onChange={(event) => onChange?.(event.target.value)} 
      className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary transition-all ${readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white'}`} 
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
