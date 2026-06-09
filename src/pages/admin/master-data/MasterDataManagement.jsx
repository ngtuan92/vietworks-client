import { useState, useEffect, useCallback } from 'react';
import jobApi from '../../../services/jobService'; 

const MasterDataManagement = () => {
  // --- 1. Quản lý Tabs hệ thống ---
  const [tab, setTab] = useState('Danh mục'); 
  const tabs = ['Địa điểm', 'Danh mục', 'Cấp bậc', 'Kinh nghiệm', 'Kỹ năng / Tags', 'Lĩnh vực công ty', 'Quy mô công ty'];
  const [loading, setLoading] = useState(false);

  // --- 2. Master Data States từ API ---
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  // --- 3. Filters States ---
  const [selectedCareerGroupId, setSelectedCareerGroupId] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // --- 4. Form & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetType, setTargetType] = useState(''); 
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', slug: '', code: '', description: '', order: 0,
    careerGroupId: '', careerId: '', levelOrder: 1, minYear: 0, maxYear: '', aliases: ''
  });

  // ==================== FETCH DATA FUNCTIONS ====================
  const loadGlobalData = useCallback(async () => {
    try {
      setLoading(true);
      const resGroups = await jobApi.getCareerGroups();
      if (resGroups?.success) setCareerGroups(resGroups.data);

      const resExp = await jobApi.getExperienceLevels();
      if (resExp?.success) setExperienceLevels(resExp.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  const loadDependentData = useCallback(async (careerGroupId = selectedCareerGroupId) => {
    if (!careerGroupId) {
      setCareers([]); setPositions([]); setSkills([]); setJobLevels([]); return;
    }
    try {
      const resCareers = await jobApi.getCareersByGroup(careerGroupId);
      if (resCareers?.success) setCareers(resCareers.data);

      const resSkills = await jobApi.getSkillsByCareerGroup(careerGroupId);
      if (resSkills?.success) setSkills(resSkills.data);

      const resLevels = await jobApi.getJobLevels(careerGroupId);
      if (resLevels?.success) setJobLevels(resLevels.data);
    } catch (err) { console.error(err); }
  }, [selectedCareerGroupId]);

  useEffect(() => {
    queueMicrotask(() => { loadGlobalData(); });
  }, [loadGlobalData]);

  useEffect(() => {
    queueMicrotask(() => { loadDependentData(selectedCareerGroupId); });
  }, [loadDependentData, selectedCareerGroupId]);

  useEffect(() => {
    const loadPositions = async () => {
      if (!selectedCareerId) { setPositions([]); return; }
      const res = await jobApi.getCareerPositions(selectedCareerId);
      if (res?.success) setPositions(res.data);
    };
    loadPositions();
  }, [selectedCareerId]);

  // ==================== ACTIONS (CRUD) ====================
  const openCreateModal = (type) => {
    setEditMode(false); setTargetType(type); setSelectedId(null);
    setFormData({
      name: '', slug: '', code: '', description: '', order: 0,
      careerGroupId: selectedCareerGroupId || '', careerId: selectedCareerId || '', 
      levelOrder: 1, minYear: 0, maxYear: '', aliases: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setEditMode(true); setTargetType(type); setSelectedId(item._id);
    setFormData({
      ...item,
      aliases: item.aliases ? item.aliases.join(', ') : '',
      maxYear: item.maxYear || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const dataPayload = { ...formData };
      if (targetType === 'SKILL') {
        dataPayload.careerGroupIds = [formData.careerGroupId];
        dataPayload.aliases = formData.aliases ? formData.aliases.split(',').map(s => s.trim()) : [];
      }

      if (editMode) {
        if (targetType === 'GROUP') response = await jobApi.updateCareerGroup(selectedId, dataPayload);
        if (targetType === 'CAREER') response = await jobApi.updateCareer(selectedId, dataPayload);
        if (targetType === 'POSITION') response = await jobApi.updateCareerPosition(selectedId, dataPayload);
        if (targetType === 'LEVEL') response = await jobApi.updateJobLevel(selectedId, dataPayload);
        if (targetType === 'SKILL') response = await jobApi.updateSkill(selectedId, dataPayload);
        if (targetType === 'EXP') response = await jobApi.updateExperienceLevel(selectedId, dataPayload);
      } else {
        if (targetType === 'GROUP') response = await jobApi.createCareerGroup(dataPayload);
        if (targetType === 'CAREER') response = await jobApi.createCareer(dataPayload);
        if (targetType === 'POSITION') response = await jobApi.createCareerPosition(dataPayload);
        if (targetType === 'LEVEL') response = await jobApi.createJobLevel(dataPayload);
        if (targetType === 'SKILL') response = await jobApi.createSkill(dataPayload);
        if (targetType === 'EXP') response = await jobApi.createExperienceLevel(dataPayload);
      }

      if (response?.success) {
        setIsModalOpen(false); loadGlobalData(); loadDependentData();
      }
    } catch (error) { console.error(error); }
  };

  const handleToggleHide = async (type, id, name) => {
    if (window.confirm(`Xác nhận ẩn danh mục "${name}"?`)) {
      let res;
      if (type === 'GROUP') res = await jobApi.deleteCareerGroup(id);
      if (type === 'CAREER') res = await jobApi.deleteCareer(id);
      if (type === 'POSITION') res = await jobApi.deleteCareerPosition(id);
      if (type === 'LEVEL') res = await jobApi.deleteJobLevel(id);
      if (type === 'SKILL') res = await jobApi.deleteSkill(id);
      if (type === 'EXP') res = await jobApi.deleteExperienceLevel(id);
      if (res?.success) { loadGlobalData(); loadDependentData(); }
    }
  };

  // ==================== RENDER ROW HELPER ====================
  const renderStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Hoạt động</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Đã ẩn</span>;
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">Đang đồng bộ dữ liệu gốc từ Core Ledger...</td></tr>;

    switch (tab) {
      case 'Danh mục':
        return (
          <>
            {/* CẤP 1 */}
            <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Nhóm ngành nghề chính ({careerGroups.length})</td></tr>
            {careerGroups.map(g => (
              <tr key={g._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{g.code || g._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{g.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">Cấp 1 (Nhóm)</span></td>
                <td className="px-6 py-4 text-sm">{renderStatusBadge(g.status)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button onClick={() => openEditModal('GROUP', g)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
                  <button onClick={() => handleToggleHide('GROUP', g._id, g.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
                </td>
              </tr>
            ))}

            {/* CẤP 2 */}
            {selectedCareerGroupId && (
              <>
                <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-800">Ngành nghề thuộc nhóm ({careers.length})</td></tr>
                {careers.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-400">Chưa có dữ liệu cấp 2</td></tr>
                ) : careers.map(c => (
                  <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">↳ {c._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 pl-10 font-medium">↳ {c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-100">Cấp 2 (Nghề)</span></td>
                    <td className="px-6 py-4 text-sm">{renderStatusBadge(c.status)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button onClick={() => openEditModal('CAREER', c)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
                      <button onClick={() => handleToggleHide('CAREER', c._id, c.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* CẤP 3 */}
            {selectedCareerId && (
              <>
                <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-800">Vị trí chuyên môn ({positions.length})</td></tr>
                {positions.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-400">Chưa có dữ liệu cấp 3</td></tr>
                ) : positions.map(p => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">↳ ↳ {p._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 pl-16">↳ ↳ {p.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-100">Cấp 3 (Vị trí)</span></td>
                    <td className="px-6 py-4 text-sm">{renderStatusBadge(p.status)}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button onClick={() => openEditModal('POSITION', p)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
                      <button onClick={() => handleToggleHide('POSITION', p._id, p.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </>
        );

      case 'Kỹ năng / Tags':
        return skills.map(s => (
          <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-900">{s._id.slice(-6).toUpperCase()}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{s.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{s.aliases?.join(', ') || '--'}</td>
            <td className="px-6 py-4 text-sm">{renderStatusBadge('ACTIVE')}</td>
            <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
              <button onClick={() => openEditModal('SKILL', s)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
              <button onClick={() => handleToggleHide('SKILL', s._id, s.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
            </td>
          </tr>
        ));

      case 'Cấp bậc':
        return jobLevels.map(l => (
          <tr key={l._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-900">{l.code}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{l.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">Mức ưu tiên: {l.levelOrder}</td>
            <td className="px-6 py-4 text-sm">{renderStatusBadge(l.status)}</td>
            <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
              <button onClick={() => openEditModal('LEVEL', l)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
              <button onClick={() => handleToggleHide('LEVEL', l._id, l.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
            </td>
          </tr>
        ));

      case 'Kinh nghiệm':
        return experienceLevels.map(e => (
          <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-900">{e.code}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{e.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">Từ {e.minYear} năm - {e.maxYear ? `${e.maxYear} năm` : 'Vô hạn'}</td>
            <td className="px-6 py-4 text-sm">{renderStatusBadge(e.status)}</td>
            <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
              <button onClick={() => openEditModal('EXP', e)} className="text-[#1e3a8a] hover:text-blue-800">Sửa</button>
              <button onClick={() => handleToggleHide('EXP', e._id, e.name)} className="text-slate-400 hover:text-red-600">Ẩn</button>
            </td>
          </tr>
        ));

      default:
        return <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">Hệ thống miền dữ liệu này đang chờ staging...</td></tr>;
    }
  };

  return (
    <div className="font-['Inter'] w-full p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Quản lý Nghề nghiệp (Master Data)</h1>
          <p className="text-xs text-slate-500 mt-1">Cấu trúc phân tầng cây danh mục dùng chung toàn sàn. Ưu tiên ẩn phân hệ thay vì xóa cứng.</p>
        </div>
        
        {/* NÚT TÁC VỤ ĐỘNG THEO TAB */}
        <div className="flex flex-wrap gap-2">
          {tab === 'Danh mục' && (
            <>
              <button onClick={() => openCreateModal('GROUP')} className="bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm nhóm (C1)</button>
              {selectedCareerGroupId && <button onClick={() => openCreateModal('CAREER')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm nghề (C2)</button>}
              {selectedCareerId && <button onClick={() => openCreateModal('POSITION')} className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm vị trí (C3)</button>}
            </>
          )}
          {tab === 'Kỹ năng / Tags' && <button onClick={() => openCreateModal('SKILL')} className="bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm Kỹ Năng</button>}
          {tab === 'Cấp bậc' && <button onClick={() => openCreateModal('LEVEL')} className="bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm Cấp Bậc</button>}
          {tab === 'Kinh nghiệm' && <button onClick={() => openCreateModal('EXP')} className="bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs px-3.5 py-2 rounded-md font-semibold transition-all shadow-sm">+ Thêm Mức Exp</button>}
        </div>
      </div>

      {/* CHUYỂN TABS DÒNG SẢN PHẨM */}
      <div className="bg-white border border-slate-200/70 p-1 rounded-lg flex space-x-1 shadow-sm max-w-max overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => { setTab(t); setSearchKeyword(''); }} className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === t ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-lg border border-slate-200/70 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tìm kiếm từ khóa</label>
          <input type="text" placeholder="Nhập tên danh mục..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a] bg-white transition-all" />
        </div>

        {['Danh mục', 'Cấp bậc', 'Kỹ năng / Tags'].includes(tab) && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lọc theo Nhóm ngành nghề (C1)</label>
            <select className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-700 focus:outline-none" value={selectedCareerGroupId} onChange={(e) => { setSelectedCareerGroupId(e.target.value); setSelectedCareerId(''); }}>
              <option value="">-- Tất cả nhóm ngành --</option>
              {careerGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
        )}

        {tab === 'Danh mục' && selectedCareerGroupId && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Lọc theo Nghề con (C2)</label>
            <select className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-700 focus:outline-none" value={selectedCareerId} onChange={(e) => setSelectedCareerId(e.target.value)}>
              <option value="">-- Tất cả nghề --</option>
              {careers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Trạng thái hệ thống</label>
          <select className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-700 focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE AREA */}
      <div className="bg-white rounded-lg border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Mã ID</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Tên hạng mục</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Phân loại cấu trúc</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renderTableContent()}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION PANEL */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị dữ liệu thời gian thực từ Core Ledger Intelligence</span>
          <div className="flex space-x-1">
            <button className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Trước</button>
            <button className="px-2.5 py-1 border rounded bg-[#1e3a8a] text-white">1</button>
            <button className="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Sau</button>
          </div>
        </div>
      </div>

      {/* ==================== MODAL THÊM / SỬA ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{editMode ? 'Chỉnh sửa' : 'Cấu trúc'} - {targetType}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên danh mục gốc *</label>
                <input required type="text" className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              {['GROUP', 'CAREER', 'POSITION', 'SKILL'].includes(targetType) && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Slug định danh hệ thống (URL) *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a]" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
              )}

              {['GROUP', 'LEVEL', 'EXP'].includes(targetType) && !editMode && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mã Code hệ thống (Bất biến) *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a]" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
              )}

              {['CAREER', 'POSITION', 'LEVEL', 'SKILL'].includes(targetType) && !editMode && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Thuộc Nhóm ngành nghề cha (C1) *</label>
                  <select required className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white" value={formData.careerGroupId} onChange={e => setFormData({...formData, careerGroupId: e.target.value})}>
                    <option value="">-- Chọn danh mục gốc --</option>
                    {careerGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
              )}

              {targetType === 'POSITION' && !editMode && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Thuộc Phân hệ nghề con (C2) *</label>
                  <select required className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white" value={formData.careerId} onChange={e => setFormData({...formData, careerId: e.target.value})}>
                    <option value="">-- Chọn ngành nghề --</option>
                    {careers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {targetType === 'LEVEL' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Thứ tự ưu tiên cấp bậc (levelOrder) *</label>
                  <input required type="number" className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a]" value={formData.levelOrder} onChange={e => setFormData({...formData, levelOrder: Number(e.target.value)})} />
                </div>
              )}

              {targetType === 'SKILL' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Từ khóa alias (Phân tách bằng dấu phẩy)</label>
                  <input type="text" placeholder="Ví dụ: reactjs, react" className="w-full border border-slate-200 rounded-md p-2 text-xs focus:outline-none focus:border-[#1e3a8a]" value={formData.aliases} onChange={e => setFormData({...formData, aliases: e.target.value})} />
                </div>
              )}

              {targetType === 'EXP' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Min Year *</label>
                    <input required type="number" className="w-full border border-slate-200 rounded-md p-2 text-xs" value={formData.minYear} onChange={e => setFormData({...formData, minYear: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Max Year</label>
                    <input type="number" className="w-full border border-slate-200 rounded-md p-2 text-xs" value={formData.maxYear} onChange={e => setFormData({...formData, maxYear: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-1.5 bg-[#1e3a8a] text-white hover:bg-blue-900 rounded-md text-xs font-semibold shadow-sm">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataManagement;
