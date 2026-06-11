import { useState } from 'react';
import { ActionButton, InputField, PageHeader, SectionCard, SelectField, Tabs } from '../shared/AdminPrimitives';

const tabs = ['Thông tin cá nhân', 'Đổi mật khẩu'];

const AdminAccountSettings = () => {
  const [active, setActive] = useState(tabs[0]);
  const [profile, setProfile] = useState({ name: 'Admin Support', email: 'admin@vietworks.vn', phone: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  return (
    <div className="space-y-7 pb-10 animate-rise-in max-w-5xl mx-auto">
      <PageHeader 
        title="Cài đặt Tài khoản Quản trị" 
        description="Quản lý thông tin hồ sơ và bảo mật tài khoản cá nhân." 
      />
      <SectionCard className="p-4">
        <Tabs tabs={tabs} active={active} onChange={setActive} />
      </SectionCard>

      {active === 'Thông tin cá nhân' ? (
        <SectionCard title="Thông tin hồ sơ">
          <div className="grid gap-6 md:grid-cols-2">
            <InputField label="Họ và tên" required value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
            <InputField label="Email liên hệ" required value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
            <InputField label="Số điện thoại" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
            <SelectField label="Vai trò hệ thống" value="ADMIN" onChange={() => {}} options={['ADMIN']} placeholder="QUẢN TRỊ VIÊN" />
          </div>
          <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
            <ActionButton tone="primary">Lưu thay đổi</ActionButton>
          </div>
        </SectionCard>
      ) : null}

      {active === 'Đổi mật khẩu' ? (
        <SectionCard title="Cập nhật mật khẩu">
          <div className="grid gap-6 md:grid-cols-2">
            <InputField label="Mật khẩu hiện tại" required type="password" value={pwd.current} onChange={(v) => setPwd((p) => ({ ...p, current: v }))} />
            <div className="hidden md:block" />
            <InputField label="Mật khẩu mới" required type="password" value={pwd.next} onChange={(v) => setPwd((p) => ({ ...p, next: v }))} />
            <InputField label="Xác nhận mật khẩu mới" required type="password" value={pwd.confirm} onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))} />
          </div>
          <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
            <ActionButton tone="primary" disabled={!pwd.current || !pwd.next || pwd.next !== pwd.confirm}>
              Cập nhật mật khẩu
            </ActionButton>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
};

export default AdminAccountSettings;
