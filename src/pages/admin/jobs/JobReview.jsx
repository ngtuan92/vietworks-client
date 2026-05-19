import { useState } from 'react';
import { ActionButton, ModalShell, PageHeader, SectionCard, TextAreaField } from '../shared/AdminPrimitives';

const checks = [
  'Company is verified',
  'Job title is clear',
  'Salary looks reasonable',
  'Description is complete',
  'Requirements are acceptable',
  'Location is clear',
  'No scam / MLM signal',
  'No platform policy violation',
];

const JobReview = () => {
  const [checked, setChecked] = useState(() => Object.fromEntries(checks.map((item) => [item, false])));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [reason, setReason] = useState('');

  const toggle = (item) => setChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  return (
    <div className="space-y-6">
      <PageHeader title="Review Job Posting" description="Checklist-based moderation before publish or ban." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Candidate-side preview">
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-2xl font-bold text-slate-900">Senior Backend Developer</h3>
            <div className="text-sm text-slate-600">ABC Technology • Ho Chi Minh City • 30-45 million • Deadline: 2026-06-10</div>
            <div><h4 className="mb-2 font-semibold text-slate-900">Description</h4><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700"><li>Build API services for recruitment platform.</li><li>Optimize performance and security.</li></ul></div>
            <div><h4 className="mb-2 font-semibold text-slate-900">Requirements</h4><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700"><li>3+ years NodeJS or Java.</li><li>Good with microservices and Docker.</li></ul></div>
          </div>
        </SectionCard>

        <SectionCard title="Moderation checklist">
          <div className="space-y-3">
            {checks.map((item) => (
              <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={checked[item]} onChange={() => toggle(item)} className="mt-1" />
                {item}
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton tone="primary">Approve</ActionButton>
            <ActionButton tone="soft" onClick={() => setRejectOpen(true)}>Reject</ActionButton>
            <ActionButton tone="danger" onClick={() => setBanOpen(true)}>Ban Job</ActionButton>
          </div>
        </SectionCard>
      </div>

      {rejectOpen ? <ModalShell title="Reject Job" onClose={() => setRejectOpen(false)} footer={<><ActionButton onClick={() => setRejectOpen(false)}>Cancel</ActionButton><ActionButton tone="danger" disabled={!reason}>Confirm reject</ActionButton></>}><TextAreaField label="Reject reason" required value={reason} onChange={setReason} placeholder="Explain why the employer needs to edit and submit again." /></ModalShell> : null}
      {banOpen ? <ModalShell title="Ban Job" onClose={() => setBanOpen(false)} footer={<><ActionButton onClick={() => setBanOpen(false)}>Cancel</ActionButton><ActionButton tone="danger" disabled={!reason}>Confirm ban</ActionButton></>}><TextAreaField label="Ban reason" required value={reason} onChange={setReason} placeholder="Describe the violation for logs and notifications." /></ModalShell> : null}
    </div>
  );
};

export default JobReview;
