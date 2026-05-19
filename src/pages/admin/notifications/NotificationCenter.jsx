import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, TextAreaField } from '../shared/AdminPrimitives';

const NotificationCenter = () => (
  <div className="space-y-6">
    <PageHeader title="Notification Management" description="Send bulk or personal notifications via Web/Email/Push channels." />

    <SectionCard title="Sent notifications">
      <SimpleTable headers={['Title', 'Audience', 'Channel', 'Status', 'Sent at', 'Created by', 'Actions']}>
        <tr className="border-t border-slate-100"><td className="px-4 py-3">AI Review CV launched</td><td className="px-4 py-3">All JobSeekers</td><td className="px-4 py-3">Web + Email</td><td className="px-4 py-3">Sent</td><td className="px-4 py-3">2026-05-18 08:30</td><td className="px-4 py-3">admin01</td><td className="px-4 py-3">View / Resend</td></tr>
      </SimpleTable>
    </SectionCard>

    <SectionCard title="Create new notification">
      <FilterGrid>
        <InputField label="Title" placeholder="Enter title" />
        <SelectField label="Audience" options={['All users', 'All JobSeekers', 'All Employers', 'Specific user']} />
        <SelectField label="Schedule" options={['Send now', 'Schedule']} />
        <InputField label="Route link" placeholder="/jobs/123" />
      </FilterGrid>
      <div className="mt-4"><TextAreaField label="Content" required placeholder="Enter notification content" /></div>
      <div className="mt-4 flex gap-3"><button className="rounded-2xl bg-[#0056b3] px-4 py-2.5 font-semibold text-white">Send</button><button className="rounded-2xl border border-slate-200 px-4 py-2.5 font-semibold">Save draft</button></div>
    </SectionCard>
  </div>
);

export default NotificationCenter;
