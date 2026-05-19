import { useState } from 'react';
import { ActionButton, PageHeader, SectionCard, SimpleTable, Tabs } from '../shared/AdminPrimitives';

const tabs = ['Job Content', 'Company', 'Applicants', 'Service Package', 'Review History', 'Violation Reports'];

const JobDetailAdmin = () => {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Job Detail" description="View full job data and run moderation actions." actions={<><ActionButton tone="primary">Approve</ActionButton><ActionButton tone="soft">Reject</ActionButton><ActionButton tone="danger">Ban</ActionButton></>} />
      <SectionCard><Tabs tabs={tabs} active={active} onChange={setActive} /></SectionCard>

      {active === 'Job Content' ? (
        <SectionCard title="Job information">
          <div className="space-y-3 text-sm text-slate-700">
            <div><b>Title:</b> Senior Backend Developer</div>
            <div><b>Salary:</b> 30-45 million</div>
            <div><b>Location:</b> Ho Chi Minh City</div>
            <div><b>Experience:</b> 3 years</div>
            <div><b>Deadline:</b> 2026-06-10</div>
          </div>
        </SectionCard>
      ) : null}

      {active === 'Review History' ? (
        <SimpleTable headers={['Time', 'Old status', 'New status', 'Admin', 'Reason']}>
          <tr className="border-t border-slate-100"><td className="px-4 py-3">2026-05-18 10:30</td><td className="px-4 py-3">PENDING</td><td className="px-4 py-3">PUBLISHED</td><td className="px-4 py-3">admin01</td><td className="px-4 py-3">Passed checks</td></tr>
        </SimpleTable>
      ) : null}

      {active !== 'Job Content' && active !== 'Review History' ? <SectionCard title={active}><div className="text-slate-600">UI section ready for backend integration.</div></SectionCard> : null}
    </div>
  );
};

export default JobDetailAdmin;
