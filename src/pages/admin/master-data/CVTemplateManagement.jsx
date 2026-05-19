import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable } from '../shared/AdminPrimitives';

const CVTemplateManagement = () => (
  <div className="space-y-6">
    <PageHeader title="CV Template Management" description="Manage CV templates, supported fonts/colors and visibility state." />
    <SectionCard title="Filters">
      <FilterGrid>
        <InputField label="Keyword" placeholder="Template name" />
        <SelectField label="Category" options={['IT', 'Sales', 'Marketing']} />
        <SelectField label="Status" options={['Active', 'Hidden']} />
        <SelectField label="Template type" options={['Free', 'Premium']} />
      </FilterGrid>
    </SectionCard>

    <SimpleTable headers={['Preview', 'Template', 'Category', 'Type', 'Status', 'Usage', 'Created', 'Actions']}>
      <tr className="border-t border-slate-100"><td className="px-4 py-3">[Preview]</td><td className="px-4 py-3">Modern IT 01</td><td className="px-4 py-3">IT</td><td className="px-4 py-3">Free</td><td className="px-4 py-3">Active</td><td className="px-4 py-3">1,245</td><td className="px-4 py-3">2026-05-01</td><td className="px-4 py-3">View / Edit / Hide</td></tr>
    </SimpleTable>
  </div>
);

export default CVTemplateManagement;
