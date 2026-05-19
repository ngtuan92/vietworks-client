import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, StatusBadge } from '../shared/AdminPrimitives';

const companies = [
  { id: 1, name: 'ABC Technology', tax: '0312345678', rep: 'Nguyen Van Hai', email: 'hr@abc.com', field: 'IT', size: '51-200', status: 'PENDING', jobs: 8, submitted: '2026-05-17' },
  { id: 2, name: 'FinGo', tax: '0109876543', rep: 'Pham Lan', email: 'hr@fingo.vn', field: 'Finance', size: '11-50', status: 'VERIFIED', jobs: 14, submitted: '2026-05-12' },
];

const statusMap = {
  PENDING: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  UNVERIFIED: 'bg-slate-100 text-slate-700',
};

const CompanyVerification = () => {
  const [filters, setFilters] = useState({ keyword: '', status: '', field: '', size: '' });

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý công ty" description="Danh sách công ty và xử lý trạng thái xác minh (UNVERIFIED/PENDING/VERIFIED/REJECTED)." />

      <SectionCard title="Bộ lọc">
        <FilterGrid>
          <InputField label="Từ khóa" value={filters.keyword} onChange={(v) => setFilters((p) => ({ ...p, keyword: v }))} placeholder="Tên công ty, mã số thuế, email" />
          <SelectField label="Trạng thái xác minh" value={filters.status} onChange={(v) => setFilters((p) => ({ ...p, status: v }))} options={['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']} />
          <SelectField label="Lĩnh vực" value={filters.field} onChange={(v) => setFilters((p) => ({ ...p, field: v }))} options={['IT', 'Finance', 'Marketing']} />
          <SelectField label="Quy mô công ty" value={filters.size} onChange={(v) => setFilters((p) => ({ ...p, size: v }))} options={['1-10', '11-50', '51-200', '200+']} />
        </FilterGrid>
      </SectionCard>

      <SimpleTable headers={['Công ty', 'Mã số thuế', 'Người đại diện', 'Email', 'Lĩnh vực', 'Quy mô', 'Trạng thái', 'Số job', 'Ngày gửi', 'Thao tác']}>
        {companies.map((c) => (
          <tr key={c.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
            <td className="px-4 py-3">{c.tax}</td>
            <td className="px-4 py-3">{c.rep}</td>
            <td className="px-4 py-3">{c.email}</td>
            <td className="px-4 py-3">{c.field}</td>
            <td className="px-4 py-3">{c.size}</td>
            <td className="px-4 py-3"><StatusBadge value={c.status} map={statusMap} /></td>
            <td className="px-4 py-3">{c.jobs}</td>
            <td className="px-4 py-3">{c.submitted}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Link to={`/admin/companies/${c.id}`} className="rounded-xl border border-slate-200 px-3 py-2">Xem</Link>
                <Link to={`/admin/companies/${c.id}/review`} className="rounded-xl bg-[#0056b3] px-3 py-2 text-white">Duyệt</Link>
              </div>
            </td>
          </tr>
        ))}
      </SimpleTable>
    </div>
  );
};

export default CompanyVerification;
