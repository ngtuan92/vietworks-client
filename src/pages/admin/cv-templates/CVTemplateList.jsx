import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../contexts/NotificationContext';
import { PageHeader, SectionCard, FilterGrid, InputField, SelectField, SimpleTable, ActionButton, StatusBadge } from '../shared/AdminPrimitives';
import { Plus, Edit, Image as ImageIcon, SearchX, Inbox } from 'lucide-react';

const CVTemplateList = () => {
  const navigate = useNavigate();
  const { error } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTemplates({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
        careerGroupId: industryFilter
      });
      if (data.success) {
        setTemplates(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch templates', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerGroups = async () => {
    try {
      const data = await adminService.getCareerGroups();
      if (data.success) {
        setCareerGroups(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch career groups', err);
    }
  };

  useEffect(() => {
    fetchCareerGroups();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [page, statusFilter, industryFilter, searchQuery]);

  const toggleStatus = async (id) => {
    try {
      const res = await adminService.toggleTemplateStatus(id);
      if (res.success) {
        setTemplates(templates.map(tpl => 
          tpl._id === id ? { ...tpl, status: res.data.status } : tpl
        ));
      }
    } catch (err) {
      error('Thay đổi trạng thái thất bại!');
    }
  };

  const handleEdit = (tpl) => {
    navigate(`/admin/cv-templates/edit/${tpl._id}`, { state: tpl });
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in max-w-7xl mx-auto">
      <PageHeader
        title="Quản lý Mẫu CV"
        description="Quản lý và cấu hình các mẫu CV khả dụng cho người dùng hệ thống VietWorks."
        actions={
          <ActionButton tone="primary" onClick={() => navigate('/admin/cv-templates/create')}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Tạo mẫu CV</span>
          </ActionButton>
        }
      />

      <SectionCard title="Danh sách Mẫu CV" description={`Tổng số ${totalItems} mẫu trong hệ thống`}>
        <div className="mb-6">
          <FilterGrid>
            <InputField 
              label="Tìm kiếm" 
              placeholder="Tên, mã mẫu CV..." 
              value={searchQuery} 
              onChange={setSearchQuery} 
            />
            <SelectField 
              label="Trạng thái" 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={[['ACTIVE', 'Đang hoạt động'], ['INACTIVE', 'Ngừng hoạt động']]} 
              placeholder="Tất cả trạng thái" 
            />
            <SelectField 
              label="Ngành nghề" 
              value={industryFilter} 
              onChange={setIndustryFilter} 
              options={careerGroups.map(g => [g._id, g.name])} 
              placeholder="Tất cả ngành nghề" 
            />
          </FilterGrid>
        </div>

        <SimpleTable headers={['Xem trước & Tên', 'Ngành nghề', 'Ngày tạo', 'Người dùng', 'Trạng thái', 'Thao tác']}>
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : templates.length > 0 ? (
            templates.map((tpl) => (
              <tr key={tpl._id} className="border-t border-slate-100 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                  <div 
                    className="w-12 h-16 rounded-xl border border-slate-200/60 bg-slate-50 flex items-center justify-center shadow-sm relative overflow-hidden group cursor-pointer"
                    onClick={() => handleEdit(tpl)}
                  >
                    {tpl.thumbnailUrl ? (
                      <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(tpl)}>
                      {tpl.name}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Mã: {tpl.code}</div>
                    {tpl.isPremium && <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-black rounded-md uppercase tracking-wider shadow-sm">Premium</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  {tpl.careerGroupId?.name || 'Mẫu chung'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 font-black text-slate-900 text-lg">
                  {tpl.usersCount?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStatus(tpl._id)}
                      type="button"
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tpl.status === 'ACTIVE' ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          tpl.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      tpl.status === 'ACTIVE' ? 'text-primary' : 'text-slate-400'
                    }`}>
                      {tpl.status === 'ACTIVE' ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ActionButton tone="soft" onClick={() => handleEdit(tpl)}>
                    <span className="flex items-center gap-1.5"><Edit className="w-4 h-4" /> Sửa</span>
                  </ActionButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center">
                <Inbox className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 font-black text-slate-500 text-lg">Không tìm thấy mẫu CV nào</p>
              </td>
            </tr>
          )}
        </SimpleTable>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Trang {page} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <ActionButton 
              tone="default"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </ActionButton>
            <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-900 shadow-sm">{page}</span>
            <ActionButton 
              tone="default"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              Sau
            </ActionButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default CVTemplateList;
