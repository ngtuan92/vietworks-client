import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../contexts/NotificationContext';
import { PageHeader, SectionCard, FilterGrid, InputField, SelectField, SimpleTable, ActionButton, StatusBadge } from '../shared/AdminPrimitives';
import { Plus, Edit, Image as ImageIcon, SearchX, Inbox, LayoutGrid, List, Eye, Users, Calendar, X } from 'lucide-react';

const CVTemplateList = () => {
  const navigate = useNavigate();
  const { error } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode & preview image states
  const [viewMode, setViewMode] = useState('grid');
  const [previewImage, setPreviewImage] = useState(null);
  
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

      <SectionCard 
        title="Danh sách Mẫu CV" 
        description={`Tổng số ${totalItems} mẫu trong hệ thống`}
        right={
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              type="button"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        }
      >
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

        {loading ? (
          <div className="py-12 text-center text-sm font-bold text-slate-400 border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            Đang tải dữ liệu...
          </div>
        ) : templates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {templates.map((tpl) => (
                <div 
                  key={tpl._id} 
                  className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                >
                  {/* Thumbnail Block */}
                  <div className="relative aspect-[210/297] w-full bg-slate-50 border-b border-slate-100 overflow-hidden select-none">
                    {tpl.thumbnailUrl ? (
                      <img
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={tpl.thumbnailUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                        <span className="text-xs font-semibold mt-2 text-slate-400">Không có ảnh xem trước</span>
                      </div>
                    )}

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setPreviewImage(tpl.thumbnailUrl)}
                        disabled={!tpl.thumbnailUrl}
                        className="p-3 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                        title="Xem ảnh lớn"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(tpl)}
                        className="p-3 bg-primary text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700 cursor-pointer"
                        title="Chỉnh sửa mẫu CV"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Premium Tag Overlay */}
                    {tpl.isPremium && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md border border-amber-400/20">
                          Premium
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Block */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="font-black text-slate-900 text-sm hover:text-primary cursor-pointer transition-colors line-clamp-2 min-h-[40px] leading-snug"
                        onClick={() => handleEdit(tpl)}
                        title={tpl.name}
                      >
                        {tpl.name}
                      </h3>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Mã: {tpl.code}
                      </div>

                      <div className="mt-3 space-y-2 border-t border-slate-50 pt-3 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-slate-50 rounded-md text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                          </span>
                          <span>
                            Người dùng: <strong className="text-slate-800 text-xs font-black">{tpl.usersCount?.toLocaleString() || 0}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-slate-50 rounded-md text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                          </span>
                          <span>
                            Ngày tạo: <span className="font-semibold text-slate-600">{new Date(tpl.createdAt).toLocaleDateString('vi-VN')}</span>
                          </span>
                        </div>
                        <div className="inline-block mt-1 text-[10px] font-black text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/60 uppercase tracking-wider max-w-full truncate">
                          {tpl.careerGroupId?.name || 'Mẫu chung'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Status Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(tpl._id)}
                          type="button"
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            tpl.status === 'ACTIVE' ? 'bg-primary' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              tpl.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          tpl.status === 'ACTIVE' ? 'text-primary' : 'text-slate-400'
                        }`}>
                          {tpl.status === 'ACTIVE' ? 'Bật' : 'Tắt'}
                        </span>
                      </div>

                      <ActionButton tone="soft" onClick={() => handleEdit(tpl)} className="!py-1 px-3">
                        <span className="flex items-center gap-1"><Edit className="w-3 h-3" /> Sửa</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SimpleTable headers={['Xem trước & Tên', 'Ngành nghề', 'Ngày tạo', 'Người dùng', 'Trạng thái', 'Thao tác']}>
              {templates.map((tpl) => (
                <tr key={tpl._id} className="border-t border-slate-100 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div 
                      className="w-16 rounded-xl border border-slate-200/60 bg-slate-50 flex items-center justify-center shadow-sm relative overflow-hidden group cursor-pointer aspect-[210/297] shrink-0"
                      onClick={() => setPreviewImage(tpl.thumbnailUrl)}
                    >
                      {tpl.thumbnailUrl ? (
                        <>
                          <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </>
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
              ))}
            </SimpleTable>
          )
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <Inbox className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 font-black text-slate-500 text-lg">Không tìm thấy mẫu CV nào</p>
          </div>
        )}

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

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/60 transition-colors shadow cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[210/297] w-full bg-slate-100 overflow-y-auto max-h-[85vh] rounded-xl custom-scrollbar">
              <img 
                src={previewImage} 
                alt="CV Template Preview Full" 
                className="w-full h-auto object-contain" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVTemplateList;
