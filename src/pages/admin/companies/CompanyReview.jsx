import { useState } from 'react';
import { ActionButton, ModalShell, PageHeader, SectionCard, SelectField, TextAreaField } from '../shared/AdminPrimitives';

const CompanyReview = () => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader
        title="Company Verification Review"
        description="Compare company info with business license before marking VERIFIED."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Company information">
          <Info label="Company name" value="ABC Technology" />
          <Info label="Tax code" value="0312345678" />
          <Info label="Website" value="https://abc.vn" />
          <Info label="Company email" value="hr@abc.com" />
          <Info label="Phone" value="0912345678" />
          <Info label="Address" value="District 1, Ho Chi Minh City" />
        </SectionCard>

        <SectionCard title="Legal document" right={<ActionButton>Download</ActionButton>}>
          <div className="h-96 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">
            Preview area for PDF/Image business license
          </div>
          <div className="mt-4 text-sm text-slate-600">Uploaded at: 2026-05-17 14:25</div>
        </SectionCard>
      </div>

      <SectionCard title="Moderation actions">
        <div className="flex flex-wrap gap-3">
          <ActionButton tone="primary">Approve (VERIFIED)</ActionButton>
          <ActionButton tone="soft">Request more documents</ActionButton>
          <ActionButton tone="danger" onClick={() => setRejectOpen(true)}>
            Reject
          </ActionButton>
        </div>
      </SectionCard>

      {rejectOpen ? (
        <ModalShell
          title="Reject company verification"
          onClose={() => setRejectOpen(false)}
          footer={
            <>
              <ActionButton onClick={() => setRejectOpen(false)}>Cancel</ActionButton>
              <ActionButton tone="danger" disabled={!reason}>
                Confirm reject
              </ActionButton>
            </>
          }
        >
          <SelectField
            label="Quick reason"
            options={['Blurry document image', 'Tax code mismatch', 'Invalid license', 'Missing required fields', 'Other']}
            placeholder="Select"
          />
          <TextAreaField label="Reject reason" required value={reason} onChange={setReason} />
        </ModalShell>
      ) : null}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="mb-3 rounded-xl border border-slate-200/60 bg-slate-50/50 shadow-sm p-3.5 hover:shadow-md transition-shadow">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
    <div className="text-sm font-black text-slate-900">{value}</div>
  </div>
);

export default CompanyReview;


