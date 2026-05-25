import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { useNotification } from '../../../contexts/NotificationContext';

const CVTemplateList = () => {
  const navigate = useNavigate();
  const { error } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
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
    } catch (error) {
      console.error('Failed to fetch templates', error);
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
    } catch (error) {
      console.error('Failed to fetch career groups', error);
    }
  };

  useEffect(() => {
    fetchCareerGroups();
  }, []);

  useEffect(() => {
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [page, statusFilter, industryFilter, searchQuery]);

  // Toggle active status
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Mẫu CV</h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Quản lý và cấu hình các mẫu CV khả dụng cho người dùng hệ thống VietWorks.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/cv-templates/create')}
          className="flex items-center gap-2 bg-[#0056b3] hover:bg-[#004085] text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mẫu CV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5"
            />
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>

          {/* Industry Select */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
          >
            <option value="all">Ngành nghề: Tất cả</option>
            {careerGroups.map(group => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="text-sm font-semibold text-gray-500 whitespace-nowrap self-end md:self-auto">
          Tổng số {totalItems} mẫu
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Xem trước & Tên</th>
                <th className="px-6 py-4">Ngành nghề</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Người dùng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : templates.length > 0 ? (
                templates.map((tpl) => (
                  <tr key={tpl._id} className="hover:bg-gray-50 transition-colors">
                    {/* Preview & Name */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      {/* CV Preview Box */}
                      <div 
                        className="w-12 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden group cursor-pointer"
                        onClick={() => handleEdit(tpl)}
                      >
                        {tpl.thumbnailUrl ? (
                          <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-400">image</span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-gray-900 text-base hover:text-[#0056b3] cursor-pointer" onClick={() => handleEdit(tpl)}>
                          {tpl.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">Mã: {tpl.code}</div>
                        {tpl.isPremium && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">PREMIUM</span>}
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-6 py-4 text-gray-600 font-medium">{tpl.careerGroupId?.name || 'Chung'}</td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-gray-500">{new Date(tpl.createdAt).toLocaleDateString('vi-VN')}</td>

                    {/* Users count */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {tpl.usersCount?.toLocaleString() || 0}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleStatus(tpl._id)}
                          type="button"
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            tpl.status === 'ACTIVE' ? 'bg-[#0056b3]' : 'bg-gray-200'
                          }`}
                          title={tpl.status === 'ACTIVE' ? 'Đang hoạt động - Click để ngừng hoạt động' : 'Ngừng hoạt động - Click để hoạt động'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              tpl.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-bold w-10 text-left ${
                          tpl.status === 'ACTIVE' ? 'text-[#0056b3]' : 'text-gray-400'
                        }`}>
                          {tpl.status === 'ACTIVE' ? 'Bật' : 'Tắt'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(tpl)}
                          title="Sửa mẫu CV"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#ebf5ff] hover:text-[#0056b3] transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-[48px] block mb-2">inbox</span>
                    Không tìm thấy mẫu CV nào trùng khớp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="bg-[#f9fafb] border-t border-[#e5e7eb] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-semibold text-gray-500">
            Hiển thị trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="text-sm font-bold text-gray-700 px-2">{page}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVTemplateList;
