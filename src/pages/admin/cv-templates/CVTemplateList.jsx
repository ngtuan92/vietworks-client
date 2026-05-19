import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data based on the design
const initialTemplates = [
  {
    id: 'TPL-001',
    name: 'Quản lý Hiện đại',
    industry: 'Quản trị kinh doanh',
    createdAt: '12 Th10, 2023',
    usersCount: 12450,
    isActive: true,
    layout: 'Một Cột Trái',
    color: '#0056b3',
    font: 'Inter',
  },
  {
    id: 'TPL-002',
    name: 'Sáng tạo Tối giản',
    industry: 'Thiết kế',
    createdAt: '05 Th11, 2023',
    usersCount: 8210,
    isActive: true,
    layout: 'Tiêu đề chia trái',
    color: '#e056fd',
    font: 'Outfit',
  },
  {
    id: 'TPL-003',
    name: 'Khởi nghiệp Công nghệ',
    industry: 'Công nghệ thông tin',
    createdAt: '18 Th01, 2024',
    usersCount: 3055,
    isActive: false,
    layout: 'Hai Cột Bằng Nhau',
    color: '#10ac84',
    font: 'Roboto',
  },
  {
    id: 'TPL-004',
    name: 'Chuyên gia Tài chính',
    industry: 'Tài chính / Ngân hàng',
    createdAt: '20 Th02, 2024',
    usersCount: 5410,
    isActive: true,
    layout: 'Một Cột Trái',
    color: '#222f3e',
    font: 'Inter',
  },
  {
    id: 'TPL-005',
    name: 'Developer Cực Chất',
    industry: 'Công nghệ thông tin',
    createdAt: '01 Th03, 2024',
    usersCount: 9430,
    isActive: true,
    layout: 'Hai Cột Bằng Nhau',
    color: '#0984e3',
    font: 'Fira Code',
  },
  {
    id: 'TPL-006',
    name: 'Nhân sự Chuẩn mực',
    industry: 'Quản trị kinh doanh',
    createdAt: '15 Th03, 2024',
    usersCount: 1220,
    isActive: false,
    layout: 'Tiêu đề chia trái',
    color: '#d63031',
    font: 'Playfair Display',
  }
];

const CVTemplateList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(initialTemplates);
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle active status
  const toggleStatus = (id) => {
    setTemplates(templates.map(tpl => 
      tpl.id === id ? { ...tpl, isActive: !tpl.isActive } : tpl
    ));
  };

  // Delete handler
  const handleDelete = (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mẫu CV ${id} không?`)) {
      setTemplates(templates.filter(tpl => tpl.id !== id));
    }
  };

  // Filter & Sort Logic
  const filteredTemplates = templates.filter(tpl => {
    const matchesStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'active' ? tpl.isActive : !tpl.isActive;
    
    const matchesIndustry = 
      industryFilter === 'all' ? true : tpl.industry === industryFilter;

    const matchesSearch = 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tpl.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesIndustry && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt.replace(' Th', ' ')) - new Date(a.createdAt.replace(' Th', ' '));
    }
    if (sortBy === 'users') {
      return b.usersCount - a.usersCount;
    }
    return 0;
  });

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
              placeholder="Tìm theo tên hoặc ID..."
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
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>

          {/* Industry Select */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
          >
            <option value="all">Ngành nghề: Tất cả</option>
            <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
            <option value="Thiết kế">Thiết kế</option>
            <option value="Công nghệ thông tin">Công nghệ thông tin</option>
            <option value="Tài chính / Ngân hàng">Tài chính / Ngân hàng</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 cursor-pointer"
          >
            <option value="newest">Sắp xếp: Mới nhất</option>
            <option value="users">Sắp xếp: Số người dùng</option>
          </select>
        </div>

        <div className="text-sm font-semibold text-gray-500 whitespace-nowrap self-end md:self-auto">
          Hiển thị {filteredTemplates.length} mẫu
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-gray-50 transition-colors">
                    {/* Preview & Name */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      {/* CV Icon / Preview Box */}
                      <div className="w-12 h-16 bg-gray-100 border border-gray-300 rounded-lg flex flex-col justify-between p-1.5 shadow-sm relative overflow-hidden group">
                        {/* Miniature layout visualization */}
                        <div className="w-full flex-1 flex gap-1">
                          <div className="w-1/3 bg-gray-300 rounded-sm"></div>
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="h-1 bg-gray-300 w-full rounded-sm"></div>
                            <div className="h-1 bg-gray-200 w-3/4 rounded-sm"></div>
                            <div className="h-1 bg-gray-200 w-5/6 rounded-sm"></div>
                          </div>
                        </div>
                        {/* Tiny color badge */}
                        <div className="h-1 w-full rounded-sm" style={{ backgroundColor: tpl.color }}></div>
                      </div>

                      <div>
                        <div className="font-bold text-gray-900 text-base hover:text-[#0056b3] cursor-pointer" onClick={() => navigate(`/admin/cv-templates/edit/${tpl.id}`, { state: tpl })}>
                          {tpl.name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {tpl.id}</div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="px-6 py-4 text-gray-600 font-medium">{tpl.industry}</td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-gray-500">{tpl.createdAt}</td>

                    {/* Users count */}
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {tpl.usersCount.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(tpl.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                          tpl.isActive
                            ? 'bg-[#ebf5ff] text-[#0056b3] hover:bg-[#d6ebff]'
                            : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tpl.isActive ? 'bg-[#0056b3]' : 'bg-[#6b7280]'}`}></span>
                        {tpl.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/cv-templates/edit/${tpl.id}`, { state: tpl })}
                          title="Sửa mẫu CV"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#ebf5ff] hover:text-[#0056b3] transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(tpl.id)}
                          title={tpl.isActive ? "Tắt hoạt động" : "Bật hoạt động"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            tpl.isActive 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {tpl.isActive ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id)}
                          title="Xóa mẫu CV"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
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
            Hiển thị 1 đến {filteredTemplates.length} trong {templates.length} kết quả
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-all disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-[#0056b3] text-white shadow-sm">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 transition-all">
              2
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 transition-all">
              3
            </button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-all">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVTemplateList;
