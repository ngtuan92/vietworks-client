import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import adminCompanyVerificationService from '../../../services/adminCompanyVerificationService';
import { FilterGrid, InputField, PageHeader, SectionCard, SelectField, SimpleTable, StatusBadge } from '../shared/AdminPrimitives';

const statusMap = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/60',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  REJECTED: 'bg-red-50 text-red-700 border-red-200/60',
  UNVERIFIED: 'bg-slate-50 text-slate-700 border-slate-200',
};

const CompanyVerification = () => {
  // 1. Thay đổi status mặc định thành rỗng '' để lúc đầu load TẤT CẢ công ty
  const [filters, setFilters] = useState({ keyword: '', status: '', field: '', size: '' });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await adminCompanyVerificationService.getPendingCompanies();

        if (res.success) {
          setCompanies(res.data || []);
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'Không thể tải danh sách công ty.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return companies.filter((company) => {
      const matchKeyword =
        !keyword ||
        company.name?.toLowerCase().includes(keyword) ||
        company.taxCode?.toLowerCase().includes(keyword) ||
        company.email?.toLowerCase().includes(keyword);

      const matchStatus = !filters.status || company.verificationStatus === filters.status;
      const matchField = !filters.field || company.industries?.some(i => i.name === filters.field);
      const matchSize = !filters.size || company.size?.name === filters.size;

      return matchKeyword && matchStatus && matchField && matchSize;
    });
  }, [companies, filters]);

  const fieldOptions = [...new Set(companies.flatMap(c => c.industries?.map(i => i.name)).filter(Boolean))];
  const sizeOptions = [...new Set(companies.map((c) => c.size?.name).filter(Boolean))];

  return (
    <div className="space-y-7 animate-rise-in">
      <PageHeader title="Quản lý công ty" description="Danh sách toàn bộ hệ thống công ty và trạng thái kiểm duyệt pháp lý." />

      {message ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#001a40]">
          {message}
        </div>
      ) : null}

      <SectionCard title="Bộ lọc">
        <FilterGrid>
          <InputField label="Từ khóa" value={filters.keyword} onChange={(v) => setFilters((p) => ({ ...p, keyword: v }))} placeholder="Tên công ty, mã số thuế, email" />
          
          {/* 2. Cập nhật options đầy đủ các trạng thái để admin lựa chọn */}
          <SelectField 
            label="Trạng thái xác minh" 
            value={filters.status} 
            onChange={(v) => setFilters((p) => ({ ...p, status: v }))} 
            options={[
              ['', 'Tất cả trạng thái'],
              ['PENDING', 'Đang chờ duyệt'],
              ['VERIFIED', 'Đã xác minh'],
              ['REJECTED', 'Đã từ chối'],
              ['UNVERIFIED', 'Chưa xác minh']
            ]} 
          />
          
          <SelectField label="Lĩnh vực" value={filters.field} onChange={(v) => setFilters((p) => ({ ...p, field: v }))} options={fieldOptions} />
          <SelectField label="Quy mô công ty" value={filters.size} onChange={(v) => setFilters((p) => ({ ...p, size: v }))} options={sizeOptions} />
        </FilterGrid>
      </SectionCard>

      <SimpleTable headers={['Công ty', 'Mã số thuế', 'Email', 'Lĩnh vực', 'Quy mô', 'Trạng thái', 'Ngày cập nhật', 'Thao tác']}>
        {loading ? (
          <tr>
            <td className="px-4 py-4 text-slate-500" colSpan={8}>Đang tải dữ liệu...</td>
          </tr>
        ) : null}

        {!loading && filteredCompanies.length === 0 ? (
          <tr>
            <td className="px-4 py-4 text-slate-500" colSpan={8}>Không tìm thấy công ty nào phù hợp.</td>
          </tr>
        ) : null}

        {!loading && filteredCompanies.map((company) => (
          <tr key={company.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-semibold text-slate-900">{company.name}</td>
            <td className="px-4 py-3">{company.taxCode}</td>
            <td className="px-4 py-3">{company.email}</td>
            <td className="px-4 py-3">{company.industries?.map(i => i.name).join(', ') || '-'}</td>
            <td className="px-4 py-3">{company.size || '-'}</td>
            <td className="px-4 py-3"><StatusBadge value={company.verificationStatus} map={statusMap} /></td>
            <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{company.updatedAt ? new Date(company.updatedAt).toLocaleDateString('vi-VN') : '-'}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Link to={`/admin/companies/${company.id}`} className="rounded-xl border border-slate-200 bg-white shadow-sm px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition active:scale-95">
                  Chi tiết
                </Link>
                
                {/* 3. Logic điều kiện ẩn/hiện nút Duyệt: Chỉ hiện khi trạng thái là PENDING */}
                {company.verificationStatus === 'PENDING' && (
                  <Link to={`/admin/companies/${company.id}`} className="rounded-xl bg-primary shadow-sm px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95">
                    Duyệt
                  </Link>
                )}
              </div>
            </td>
          </tr>
        ))}
      </SimpleTable>
    </div>
  );
};

export default CompanyVerification;