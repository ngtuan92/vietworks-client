import { PageHeader, SectionCard, SimpleTable } from '../shared/AdminPrimitives';

const JobModerationHistory = () => (
  <div className="space-y-6">
    <PageHeader title="Job Moderation History" description="Track approve/reject/ban actions across the platform." />
    <SectionCard>
      <SimpleTable headers={['Time', 'Job', 'Company', 'Old status', 'New status', 'Admin', 'Reason', 'Note']}>
        <tr className="border-t border-slate-100"><td className="px-4 py-3">2026-05-18 10:30</td><td className="px-4 py-3">Senior Backend Developer</td><td className="px-4 py-3">ABC Corp</td><td className="px-4 py-3">PENDING</td><td className="px-4 py-3">PUBLISHED</td><td className="px-4 py-3">admin01</td><td className="px-4 py-3">Passed checks</td><td className="px-4 py-3">-</td></tr>
        <tr className="border-t border-slate-100"><td className="px-4 py-3">2026-05-16 14:05</td><td className="px-4 py-3">Data Entry Online</td><td className="px-4 py-3">XYZ</td><td className="px-4 py-3">PUBLISHED</td><td className="px-4 py-3">BANNED</td><td className="px-4 py-3">admin02</td><td className="px-4 py-3">Possible scam/MLM</td><td className="px-4 py-3">Immediate ban</td></tr>
      </SimpleTable>
    </SectionCard>
  </div>
);

export default JobModerationHistory;
