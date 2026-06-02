import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/authService';

const notificationOptions = [
  'Nhà tuyển dụng đã xem CV',
  'Lời mời phỏng vấn / kết quả ứng tuyển',
  'Việc làm phù hợp theo nhu cầu',
  'Tính năng mới và mẫu CV mới',
  'Thanh toán và gói dịch vụ',
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
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState(() => notificationOptions.reduce((acc, item) => ({ ...acc, [item]: true }), {}));

  const initials = (profile.fullName || profile.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-[#003f87] to-[#0b63c7] p-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl font-black">
                {initials}
              </div>
              <div>
                <p className="text-sm text-white/75">Trang cá nhân ứng viên</p>
                <h1 className="text-2xl md:text-3xl font-black">{profile.fullName || 'Cập nhật tên của bạn'}</h1>
                <p className="text-white/80 mt-1">{profile.email || 'email@example.com'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/manage-cv" className="px-4 py-2 rounded-xl bg-white text-[#003f87] font-bold">Quản lý CV</Link>
              <Link to="/job-preferences" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 font-bold">Nhu cầu việc làm</Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-2xl bg-white border border-slate-200 p-3 h-fit">
            <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </aside>

          <div className="rounded-2xl bg-white border border-slate-200 p-6">
            {activeTab === 'overview' && <Overview profile={profile} setProfile={setProfile} />}
            {activeTab === 'security' && <Security security={security} setSecurity={setSecurity} />}
            {activeTab === 'notifications' && <Notifications notifications={notifications} setNotifications={setNotifications} />}
            {activeTab === 'quickLinks' && <QuickLinks />}
          </div>
        </section>
      </main>
    </div>
  );
};

const ProfileNav = ({ activeTab, setActiveTab }) => {
  const items = [
    { key: 'overview', icon: 'person', label: 'Thông tin cá nhân' },
    { key: 'security', icon: 'lock', label: 'Bảo mật & mật khẩu' },
    { key: 'notifications', icon: 'notifications', label: 'Cài đặt thông báo' },
    { key: 'quickLinks', icon: 'dashboard_customize', label: 'Lối tắt hồ sơ' },
  ];

  return items.map((item) => (
    <button
      key={item.key}
      onClick={() => setActiveTab(item.key)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${activeTab === item.key ? 'bg-[#003f87] text-white' : 'text-slate-700 hover:bg-slate-50'}`}
    >
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      <span className="font-semibold text-sm">{item.label}</span>
    </button>
  ));
};

const Overview = ({ profile, setProfile }) => (
  <div className="space-y-5">
    <SectionTitle title="Thông tin cá nhân" description="Dùng để hiển thị trên hồ sơ và khi ứng tuyển." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Họ tên" value={profile.fullName} onChange={(value) => setProfile((prev) => ({ ...prev, fullName: value }))} />
      <Field label="Email" value={profile.email} readOnly />
      <Field label="Số điện thoại" value={profile.phone} onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))} />
      <Field label="Trạng thái tài khoản" value="Hoạt động" readOnly />
    </div>
    <div className="flex justify-end">
      <button className="px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold">Lưu thông tin</button>
    </div>
  </div>
);

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
      <SectionTitle title="Bảo mật & đổi mật khẩu" description="Đổi mật khẩu khi bạn còn đăng nhập. Nếu quên mật khẩu, dùng luồng Quên mật khẩu ngoài trang đăng nhập." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Mật khẩu hiện tại" type="password" value={security.currentPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, currentPassword: value }))} />
        <Field label="Mật khẩu mới" type="password" value={security.newPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, newPassword: value }))} />
        <Field label="Nhập lại mật khẩu mới" type="password" value={security.confirmPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, confirmPassword: value }))} />
      </div>
      {message ? <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">{message}</div> : null}
      <div className="flex justify-end">
        <button onClick={handleChangePassword} disabled={submitting} className="px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
};

const Notifications = ({ notifications, setNotifications }) => (
  <div className="space-y-5">
    <SectionTitle title="Cài đặt thông báo" description="Bật/tắt email và thông báo hệ thống theo nghiệp vụ Jobseeker." />
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
      {notificationOptions.map((item) => (
        <label key={item} className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50">
          <span className="font-semibold text-slate-700">{item}</span>
          <input type="checkbox" checked={notifications[item]} onChange={(event) => setNotifications((prev) => ({ ...prev, [item]: event.target.checked }))} className="h-5 w-5" />
        </label>
      ))}
    </div>
    <div className="flex justify-end">
      <button className="px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold">Lưu cài đặt</button>
    </div>
  </div>
);

const QuickLinks = () => {
  const links = [
    { to: '/manage-cv', icon: 'description', title: 'CV của tôi', desc: 'Tạo, upload, chỉnh sửa và tải CV' },
    { to: '/applied-jobs', icon: 'assignment_turned_in', title: 'Việc đã ứng tuyển', desc: 'Theo dõi trạng thái hồ sơ' },
    { to: '/saved-jobs', icon: 'favorite', title: 'Việc đã lưu', desc: 'Xem lại các job đã thả tim' },
    { to: '/matched-jobs', icon: 'recommend', title: 'Việc làm phù hợp', desc: 'Gợi ý theo nhu cầu việc làm' },
    { to: '/privacy-settings', icon: 'visibility_off', title: 'Quyền riêng tư', desc: 'Cho phép NTD tìm thấy hồ sơ' },
    { to: '/premium', icon: 'workspace_premium', title: 'Gói Premium', desc: 'Boost CV và dịch vụ hỗ trợ' },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Lối tắt hồ sơ" description="Những chức năng xuất hiện khi ứng viên bấm vào tên tài khoản." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="rounded-2xl border border-slate-200 p-4 hover:border-[#003f87] hover:bg-blue-50 transition">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#003f87]">{link.icon}</span>
              <div>
                <p className="font-bold text-slate-900">{link.title}</p>
                <p className="text-sm text-slate-500 mt-1">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const PrivacySettings = () => {
  const [allowSearch, setAllowSearch] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <main className="mx-auto max-w-4xl rounded-3xl bg-white border border-slate-200 p-6 md:p-8 space-y-6">
        <SectionTitle title="Quyền riêng tư hồ sơ" description="Kiểm soát việc Nhà tuyển dụng có thể chủ động tìm thấy hồ sơ của bạn trong Talent Pool hay không." />
        <div className="rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-black text-slate-900">Cho phép nhà tuyển dụng tìm thấy hồ sơ của tôi</h2>
            <p className="text-sm text-slate-500 mt-1">Tắt tùy chọn này sẽ ẩn hồ sơ khỏi Talent Pool, nhưng bạn vẫn ứng tuyển bình thường.</p>
          </div>
          <button onClick={() => setAllowSearch((prev) => !prev)} className={`relative h-8 w-16 rounded-full transition ${allowSearch ? 'bg-[#003f87]' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${allowSearch ? 'left-9' : 'left-1'}`} />
          </button>
        </div>
        <div className={`rounded-2xl p-4 text-sm ${allowSearch ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
          Trạng thái hiện tại: <b>{allowSearch ? 'PUBLIC - Nhà tuyển dụng có thể tìm thấy hồ sơ' : 'PRIVATE - Hồ sơ đang được ẩn khỏi Talent Pool'}</b>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-3 rounded-xl bg-[#003f87] text-white font-bold">Lưu quyền riêng tư</button>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', readOnly = false }) => (
  <label className="block">
    <span className="block text-sm font-bold text-slate-700 mb-2">{label}</span>
    <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#003f87] ${readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white'}`} />
  </label>
);

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-xl font-black text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500 mt-1">{description}</p>
  </div>
);

export { PrivacySettings };
export default Profile;



