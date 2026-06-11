import { useEffect, useState } from 'react';
import employerAccountService from '../../../services/employerAccountService.js';
import authService from '../../../services/authService.js';

const tabs = [
  { key: 'profile', label: 'Thông tin cá nhân' },
  { key: 'security', label: 'Bảo mật' },
  { key: 'notifications', label: 'Thông báo' },
];

const genderOptions = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
];

const notificationRows = [
  { label: 'Có ứng viên mới ứng tuyển', emailKey: 'newApplicationEmail', systemKey: 'newApplicationSystem' },
  { label: 'Admin duyệt/từ chối Job', emailKey: 'jobReviewEmail', systemKey: 'jobReviewSystem' },
  { label: 'Admin duyệt/từ chối công ty', emailKey: 'companyReviewEmail', systemKey: 'companyReviewSystem' },
  { label: 'Tin nhắn mới từ ứng viên', emailKey: 'messageEmail', systemKey: 'messageSystem' },
  { label: 'Giao dịch ví', emailKey: 'billingEmail', systemKey: 'billingSystem' },
  { label: 'Gói dịch vụ sắp hết hạn', emailKey: 'packageEmail', systemKey: 'packageSystem' },
];

const AccountSettings = () => {
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [profile, setProfile] = useState({
    representativeName: '',
    gender: '',
    phone: '',
    email: '',
  });

  const [security, setSecurity] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notify, setNotify] = useState({
    newApplicationEmail: true,
    newApplicationSystem: true,
    jobReviewEmail: true,
    jobReviewSystem: true,
    companyReviewEmail: true,
    companyReviewSystem: true,
    messageEmail: false,
    messageSystem: true,
    billingEmail: true,
    billingSystem: true,
    packageEmail: true,
    packageSystem: true,
  });

  useEffect(() => {
    const fetchAccountSettings = async () => {
      try {
        setLoading(true);

        const [representativeRes, accountRes] = await Promise.all([
          employerAccountService.getMyRepresentativeProfile(),
          employerAccountService.getMyEmployerLoginInfo(),
        ]);

        setProfile({
          representativeName: representativeRes.data?.representativeName || '',
          gender: representativeRes.data?.gender || '',
          phone: representativeRes.data?.phone || '',
          email: accountRes.data?.email || '',
        });

        setSecurity((prev) => ({
          ...prev,
          email: accountRes.data?.email || '',
        }));
      } catch (error) {
        setMessage(error.response?.data?.message || 'Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountSettings();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await employerAccountService.updateMyRepresentativeProfile({
        representativeName: profile.representativeName,
        gender: profile.gender,
        phone: profile.phone,
      });

      setMessage(res.message || 'Cập nhật thông tin người đại diện thành công');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmNewPassword: security.confirmPassword,
      });

      setSecurity((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setMessage(res.message || 'Đổi mật khẩu thành công');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt tài khoản</h1>
        <p className="text-slate-600 mt-1">
          Quản lý thông tin người đại diện, bảo mật và cài đặt thông báo.
        </p>
      </div>

      {message ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-2 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key);
              setMessage('');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              tab === item.key ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Họ tên" value={profile.representativeName} onChange={(value) => setProfile((prev) => ({ ...prev, representativeName: value }))} />
          <Select label="Giới tính" value={profile.gender} onChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))} options={genderOptions} />
          <Field label="Số điện thoại" value={profile.phone} onChange={(value) => setProfile((prev) => ({ ...prev, phone: value }))} />
          <Field label="Email" value={profile.email} readOnly />

          <div className="md:col-span-2 flex justify-end">
            <button onClick={handleUpdateProfile} disabled={loading} className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60">
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </section>
      ) : null}

      {tab === 'security' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" value={security.email} readOnly />
          <Field label="Mật khẩu hiện tại" type="password" value={security.currentPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, currentPassword: value }))} />
          <Field label="Mật khẩu mới" type="password" value={security.newPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, newPassword: value }))} />
          <Field label="Nhập lại mật khẩu mới" type="password" value={security.confirmPassword} onChange={(value) => setSecurity((prev) => ({ ...prev, confirmPassword: value }))} />

          <div className="md:col-span-2 flex justify-end">
            <button onClick={handleUpdatePassword} disabled={loading} className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60">
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </section>
      ) : null}

      {tab === 'notifications' ? (
        <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Loại thông báo</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Trong hệ thống</th>
                </tr>
              </thead>
              <tbody>
                {notificationRows.map((row) => (
                  <NotifyRow key={row.emailKey} {...row} state={notify} setState={setNotify} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Lưu cài đặt thông báo
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', readOnly = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
      className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ${
        readOnly ? 'bg-slate-50 text-slate-500' : 'focus:border-primary'
      }`}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary bg-white"
    >
      <option value="">Chọn giới tính</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const NotifyRow = ({ label, emailKey, systemKey, state, setState }) => (
  <tr className="border-t border-slate-100">
    <td className="px-4 py-3 font-medium text-slate-800">{label}</td>
    <td className="px-4 py-3">
      <Toggle checked={state[emailKey]} onChange={(value) => setState((prev) => ({ ...prev, [emailKey]: value }))} />
    </td>
    <td className="px-4 py-3">
      <Toggle checked={state[systemKey]} onChange={(value) => setState((prev) => ({ ...prev, [systemKey]: value }))} />
    </td>
  </tr>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default AccountSettings;
