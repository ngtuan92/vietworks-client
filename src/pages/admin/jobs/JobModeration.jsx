import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, StatusBadge } from '../shared/AdminPrimitives';

const statusMap = {
  PENDING: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  BANNED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-slate-100 text-slate-700',
};

const jobs = [
  { id: 1, title: 'Senior Backend Developer', company: 'ABC Corp', category: 'IT / Backend', salary: '30-45 million', location: 'Ho Chi Minh City', status: 'PENDING', type: 'URGENT', deadline: '2026-06-10', submittedAt: '2026-05-18' },
  { id: 2, title: 'Product Designer', company: 'FinX', category: 'Design / UIUX', salary: '20-30 million', location: 'Ha Noi', status: 'PUBLISHED', type: 'Standard', deadline: '2026-06-01', submittedAt: '2026-05-15' },
];

const JobModeration = () => {
  const [filters, setFilters] = useState({ keyword: '', company: '', status: '', location: '', type: '' });

  return (
    <div className="space-y-6">
      <PageHeader title="Job Moderation" description="Approve, reject or ban job postings across the whole platform." />
      <SectionCard title="Filters">
        <FilterGrid>
          <InputField label="Keyword" value={filters.keyword} onChange={(v) => setFilters((p) => ({ ...p, keyword: v }))} placeholder="Job title" />
          <InputField label="Company" value={filters.company} onChange={(v) => setFilters((p) => ({ ...p, company: v }))} placeholder="Company name" />
          <SelectField label="Status" value={filters.status} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} options={['DRAFT', 'PENDING', 'PUBLISHED', 'EXPIRED', 'CLOSED', 'BANNED']} />
          <InputField label="Location" value={filters.location} onChange={(v) => setFilters((p) => ({ ...p, location: v }))} placeholder="City" />
          <SelectField label="Type" value={filters.type} onChange={(v) => setFilters((p) => ({ ...p, type: v }))} options={['Standard', 'Featured', 'URGENT']} />
        </FilterGrid>
      </SectionCard>

      <SimpleTable headers={['Job', 'Company', 'Category', 'Salary', 'Location', 'Status', 'Type', 'Deadline', 'Submitted', 'Actions']}>
        {jobs.map((job) => (
          <tr key={job.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-semibold text-slate-900">{job.title}</td>
            <td className="px-4 py-3">{job.company}</td>
            <td className="px-4 py-3">{job.category}</td>
            <td className="px-4 py-3">{job.salary}</td>
            <td className="px-4 py-3">{job.location}</td>
            <td className="px-4 py-3"><StatusBadge value={job.status} map={statusMap} /></td>
            <td className="px-4 py-3">{job.type}</td>
            <td className="px-4 py-3">{job.deadline}</td>
            <td className="px-4 py-3">{job.submittedAt}</td>
            <td className="px-4 py-3"><div className="flex gap-2"><Link to={`/admin/jobs/${job.id}`} className="rounded-xl border border-slate-200 px-3 py-2">View</Link><Link to={`/admin/jobs/${job.id}/review`} className="rounded-xl bg-[#0056b3] px-3 py-2 text-white">Review</Link></div></td>
          </tr>
        ))}
      </SimpleTable>
    </div>
  );
};

export default JobModeration;
