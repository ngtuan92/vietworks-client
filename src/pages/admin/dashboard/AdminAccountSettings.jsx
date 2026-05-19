import { useState } from 'react';
import { ActionButton, InputField, PageHeader, SectionCard, SelectField, Tabs } from '../shared/AdminPrimitives';

const tabs = ['Admin Profile', 'Change Password'];

const AdminAccountSettings = () => {
  const [active, setActive] = useState(tabs[0]);
  const [profile, setProfile] = useState({ name: 'Admin Support', email: 'admin@vietworks.vn', phone: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Account Settings" description="Manage admin profile and update password." />
      <SectionCard><Tabs tabs={tabs} active={active} onChange={setActive} /></SectionCard>

      {active === 'Admin Profile' ? (
        <SectionCard title="Profile information">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Full name" required value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
            <InputField label="Email" required value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
            <InputField label="Phone" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
            <SelectField label="Role" value="ADMIN" onChange={() => {}} options={['ADMIN']} placeholder="ADMIN" />
          </div>
          <div className="mt-5 flex justify-end"><ActionButton tone="primary">Save changes</ActionButton></div>
        </SectionCard>
      ) : null}

      {active === 'Change Password' ? (
        <SectionCard title="Change password">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Current password" required type="password" value={pwd.current} onChange={(v) => setPwd((p) => ({ ...p, current: v }))} />
            <div className="hidden md:block" />
            <InputField label="New password" required type="password" value={pwd.next} onChange={(v) => setPwd((p) => ({ ...p, next: v }))} />
            <InputField label="Confirm new password" required type="password" value={pwd.confirm} onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))} />
          </div>
          <div className="mt-5 flex justify-end"><ActionButton tone="primary" disabled={!pwd.current || !pwd.next || pwd.next !== pwd.confirm}>Update password</ActionButton></div>
        </SectionCard>
      ) : null}
    </div>
  );
};

export default AdminAccountSettings;
