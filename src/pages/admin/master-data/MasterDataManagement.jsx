import { useState, useEffect, useCallback, useMemo } from 'react';
import jobApi from '../../../services/jobService'; 
import {
  PageHeader,
  SectionCard,
  SimpleTable,
  FilterGrid,
  InputField,
  SelectField,
  ModalShell,
  ActionButton,
  StatusBadge
} from '../shared/AdminPrimitives';
import { useNotification } from '../../../contexts/NotificationContext';

const MasterDataManagement = () => {
  const { confirm } = useNotification();
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
  const [statusFilter, setStatusFilter] = useState('');

  // --- 4. Form & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetType, setTargetType] = useState(''); 
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', slug: '', code: '', description: '', order: 0,
    careerGroupId: '', careerId: '', levelOrder: 1, minYear: 0, maxYear: '', aliases: ''
  });

  const loadGlobalData = useCallback(async () => {
    try {
      setLoading(true);
      const resGroups = await jobApi.getCareerGroups();
      if (resGroups?.success) setCareerGroups(resGroups.data);

      const resExp = await jobApi.getExperienceLevels();
      if (resExp?.success) setExperienceLevels(resExp.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
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
    } catch (err) { 
      console.error(err); 
    }
  }, [selectedCareerGroupId]);

  // SỬA ĐỔI: Loại bỏ queueMicrotask để React theo dõi luồng State chuẩn xác hơn
  useEffect(() => {
    loadGlobalData();
  }, [loadGlobalData]);

  useEffect(() => {
    loadDependentData(selectedCareerGroupId);
  }, [loadDependentData, selectedCareerGroupId]);

  useEffect(() => {
    const loadPositions = async () => {
      if (!selectedCareerId) { setPositions([]); return; }
      const res = await jobApi.getCareerPositions(selectedCareerId);
      if (res?.success) setPositions(res.data);
    };
    loadPositions();
  }, [selectedCareerId]);

  // --- 5. LOGIC FILTER TRÊN CLIENT (SỬA LỖI BUG BỘ LỌC) ---
  const filterItem = useCallback((item) => {
    // 1. Lọc theo trạng thái (status)
    if (statusFilter) {
      // Riêng tab SKILL nếu API trả về không có trường status, mặc định coi như ACTIVE
      const currentStatus = item.status || 'ACTIVE';
      if (currentStatus !== statusFilter) return false;
    }
    // 2. Lọc theo từ khóa tìm kiếm (name hoặc code)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      const matchName = item.name?.toLowerCase().includes(keyword);
      const matchCode = item.code?.toLowerCase().includes(keyword);
      // Hỗ trợ tìm kiếm theo cả alias trong tag kỹ năng
      const matchAlias = item.aliases?.some(alias => alias.toLowerCase().includes(keyword));
      
      if (!matchName && !matchCode && !matchAlias) return false;
    }
    return true;
  }, [searchKeyword, statusFilter]);

  // Gói các mảng đã được lọc vào useMemo để tối ưu hóa re-render
  const filteredCareerGroups = useMemo(() => careerGroups.filter(filterItem), [careerGroups, filterItem]);
  const filteredCareers = useMemo(() => careers.filter(filterItem), [careers, filterItem]);
  const filteredPositions = useMemo(() => positions.filter(filterItem), [positions, filterItem]);
  const filteredSkills = useMemo(() => skills.filter(filterItem), [skills, filterItem]);
  const filteredJobLevels = useMemo(() => jobLevels.filter(filterItem), [jobLevels, filterItem]);
  const filteredExperienceLevels = useMemo(() => experienceLevels.filter(filterItem), [experienceLevels, filterItem]);

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
    confirm(`Xác nhận ẩn danh mục "${name}"?`, async () => {
      let res;
      if (type === 'GROUP') res = await jobApi.deleteCareerGroup(id);
      if (type === 'CAREER') res = await jobApi.deleteCareer(id);
      if (type === 'POSITION') res = await jobApi.deleteCareerPosition(id);
      if (type === 'LEVEL') res = await jobApi.deleteJobLevel(id);
      if (type === 'SKILL') res = await jobApi.deleteSkill(id);
      if (type === 'EXP') res = await jobApi.deleteExperienceLevel(id);
      if (res?.success) { loadGlobalData(); loadDependentData(); }
    });
  };

  const renderStatusBadge = (status) => {
    return <StatusBadge value={status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} map={{ ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200' }} />;
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="5" className="px-6 py-12 text-center text-sm font-bold text-slate-400">Đang đồng bộ dữ liệu gốc từ Core Ledger...</td></tr>;

    switch (tab) {
      case 'Danh mục':
        return (
          <>
            <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Nhóm ngành nghề chính ({filteredCareerGroups.length})</td></tr>
            {filteredCareerGroups.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-xs italic text-slate-400">Không tìm thấy nhóm ngành nào khớp bộ lọc</td></tr>
            ) : filteredCareerGroups.map(g => (
              <tr key={g._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{g.code || g._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{g.name}</td>
                <td className="px-6 py-4"><span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Cấp 1 (Nhóm)</span></td>
                <td className="px-6 py-4">{renderStatusBadge(g.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ActionButton tone="soft" onClick={() => openEditModal('GROUP', g)}>Sửa</ActionButton>
                    <ActionButton tone="danger" onClick={() => handleToggleHide('GROUP', g._id, g.name)}>Ẩn</ActionButton>
                  </div>
                </td>
              </tr>
            ))}

            {selectedCareerGroupId && (
              <>
                <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Ngành nghề thuộc nhóm ({filteredCareers.length})</td></tr>
                {filteredCareers.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-sm font-bold text-slate-400">Không tìm thấy ngành nghề nào khớp bộ lọc</td></tr>
                ) : filteredCareers.map(c => (
                  <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">↳ {c._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 pl-10 font-medium">↳ {c.name}</td>
                    <td className="px-6 py-4"><span className="inline-flex rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Cấp 2 (Nghề)</span></td>
                    <td className="px-6 py-4">{renderStatusBadge(c.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ActionButton tone="soft" onClick={() => openEditModal('CAREER', c)}>Sửa</ActionButton>
                        <ActionButton tone="danger" onClick={() => handleToggleHide('CAREER', c._id, c.name)}>Ẩn</ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {selectedCareerId && (
              <>
                <tr className="bg-slate-50/70 border-y border-slate-100"><td colSpan="5" className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Vị trí chuyên môn ({filteredPositions.length})</td></tr>
                {filteredPositions.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-sm font-bold text-slate-400">Không tìm thấy vị trí nào khớp bộ lọc</td></tr>
                ) : filteredPositions.map(p => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">↳ ↳ {p._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 pl-16">↳ ↳ {p.name}</td>
                    <td className="px-6 py-4"><span className="inline-flex rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Cấp 3 (Vị trí)</span></td>
                    <td className="px-6 py-4">{renderStatusBadge(p.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ActionButton tone="soft" onClick={() => openEditModal('POSITION', p)}>Sửa</ActionButton>
                        <ActionButton tone="danger" onClick={() => handleToggleHide('POSITION', p._id, p.name)}>Ẩn</ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </>
        );

      case 'Kỹ năng / Tags':
        if (filteredSkills.length === 0) return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu kỹ năng thỏa mãn bộ lọc</td></tr>;
        return filteredSkills.map(s => (
          <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{s._id.slice(-6).toUpperCase()}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{s.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{s.aliases?.join(', ') || '--'}</td>
            <td className="px-6 py-4">{renderStatusBadge('ACTIVE')}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('SKILL', s)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('SKILL', s._id, s.name)}>Ẩn</ActionButton>
              </div>
            </td>
          </tr>
        ));

      case 'Cấp bậc':
        if (filteredJobLevels.length === 0) return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu cấp bậc thỏa mãn bộ lọc</td></tr>;
        return filteredJobLevels.map(l => (
          <tr key={l._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.code}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{l.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">Mức ưu tiên: <span className="font-bold text-slate-900">{l.levelOrder}</span></td>
            <td className="px-6 py-4">{renderStatusBadge(l.status)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('LEVEL', l)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('LEVEL', l._id, l.name)}>Ẩn</ActionButton>
              </div>
            </td>
          </tr>
        ));

      case 'Kinh nghiệm':
        if (filteredExperienceLevels.length === 0) return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu mức kinh nghiệm thỏa mãn bộ lọc</td></tr>;
        return filteredExperienceLevels.map(e => (
          <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{e.code}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{e.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">Từ {e.minYear} năm - {e.maxYear ? `${e.maxYear} năm` : 'Vô hạn'}</td>
            <td className="px-6 py-4">{renderStatusBadge(e.status)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('EXP', e)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('EXP', e._id, e.name)}>Ẩn</ActionButton>
              </div>
            </td>
          </tr>
        ));

      default:
        return <tr><td colSpan="5" className="px-6 py-12 text-center text-sm font-bold text-slate-400">Hệ thống miền dữ liệu này đang chờ staging...</td></tr>;
    }
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Quản lý Master Data"
        description="Cấu trúc phân tầng cây danh mục dùng chung toàn sàn. Ưu tiên ẩn phân hệ thay vì xóa cứng."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {tab === 'Danh mục' && (
              <>
                <ActionButton tone="primary" onClick={() => openCreateModal('GROUP')}>+ Thêm nhóm (C1)</ActionButton>
                {selectedCareerGroupId && <ActionButton tone="primary" onClick={() => openCreateModal('CAREER')}>+ Thêm nghề (C2)</ActionButton>}
                {selectedCareerId && <ActionButton tone="primary" onClick={() => openCreateModal('POSITION')}>+ Thêm vị trí (C3)</ActionButton>}
              </>
            )}
            {tab === 'Kỹ năng / Tags' && <ActionButton tone="primary" onClick={() => openCreateModal('SKILL')}>+ Thêm Kỹ Năng</ActionButton>}
            {tab === 'Cấp bậc' && <ActionButton tone="primary" onClick={() => openCreateModal('LEVEL')}>+ Thêm Cấp Bậc</ActionButton>}
            {tab === 'Kinh nghiệm' && <ActionButton tone="primary" onClick={() => openCreateModal('EXP')}>+ Thêm Mức Exp</ActionButton>}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearchKeyword(''); setStatusFilter(''); }} // Cập nhật: Reset filter trạng thái khi chuyển Tab
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${tab === t ? 'bg-primary text-white border border-primary' : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <SectionCard title="Bộ lọc & Tìm kiếm">
        <FilterGrid>
          <InputField label="Tìm kiếm từ khóa" value={searchKeyword} onChange={setSearchKeyword} placeholder="Nhập tên hoặc mã danh mục..." />
          
          {['Danh mục', 'Cấp bậc', 'Kỹ năng / Tags'].includes(tab) && (
            <SelectField
              label="Nhóm ngành nghề (C1)"
              value={selectedCareerGroupId}
              onChange={(val) => { setSelectedCareerGroupId(val); setSelectedCareerId(''); }}
              options={careerGroups.map(g => [g._id, g.name])}
              placeholder="-- Tất cả nhóm ngành --"
            />
          )}

          {tab === 'Danh mục' && selectedCareerGroupId && (
            <SelectField
              label="Nghề con (C2)"
              value={selectedCareerId}
              onChange={setSelectedCareerId}
              options={careers.map(c => [c._id, c.name])}
              placeholder="-- Tất cả nghề --"
            />
          )}

          <SelectField
            label="Trạng thái hệ thống"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[['ACTIVE', 'Đang hoạt động'], ['INACTIVE', 'Đã ẩn']]}
            placeholder="Tất cả trạng thái"
          />
        </FilterGrid>
      </SectionCard>

      <SectionCard className="p-0 overflow-hidden">
        <SimpleTable headers={['Mã ID', 'Tên hạng mục', 'Phân loại cấu trúc', 'Trạng thái', 'Thao tác']}>
          {renderTableContent()}
        </SimpleTable>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hệ thống đồng bộ Core Ledger Intelligence</span>
        </div>
      </SectionCard>

      {isModalOpen && (
        <ModalShell
          title={`${editMode ? 'Chỉnh sửa' : 'Cấu trúc'} - ${targetType}`}
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <ActionButton onClick={() => setIsModalOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="primary" onClick={handleFormSubmit}>Xác nhận</ActionButton>
            </>
          }
        >
          <div className="space-y-4">
            <InputField label="Tên danh mục gốc *" required value={formData.name} onChange={val => setFormData({...formData, name: val})} />

            {['GROUP', 'CAREER', 'POSITION', 'SKILL'].includes(targetType) && (
              <InputField label="Slug định danh hệ thống (URL) *" required value={formData.slug} onChange={val => setFormData({...formData, slug: val})} />
            )}

            {['GROUP', 'LEVEL', 'EXP'].includes(targetType) && !editMode && (
              <InputField label="Mã Code hệ thống (Bất biến) *" required value={formData.code} onChange={val => setFormData({...formData, code: val})} />
            )}

            {['CAREER', 'POSITION', 'LEVEL', 'SKILL'].includes(targetType) && !editMode && (
              <SelectField
                label="Thuộc Nhóm ngành nghề cha (C1) *"
                required
                value={formData.careerGroupId}
                onChange={val => setFormData({...formData, careerGroupId: val})}
                options={careerGroups.map(g => [g._id, g.name])}
                placeholder="-- Chọn danh mục gốc --"
              />
            )}

            {targetType === 'POSITION' && !editMode && (
              <SelectField
                label="Thuộc Phân hệ nghề con (C2) *"
                required
                value={formData.careerId}
                onChange={val => setFormData({...formData, careerId: val})}
                options={careers.map(c => [c._id, c.name])}
                placeholder="-- Chọn ngành nghề --"
              />
            )}

            {targetType === 'LEVEL' && (
              <InputField type="number" label="Thứ tự ưu tiên cấp bậc (levelOrder) *" required value={formData.levelOrder} onChange={val => setFormData({...formData, levelOrder: Number(val)})} />
            )}

            {targetType === 'SKILL' && (
              <InputField label="Từ khóa alias (Phân tách bằng dấu phẩy)" placeholder="Ví dụ: reactjs, react" value={formData.aliases} onChange={val => setFormData({...formData, aliases: val})} />
            )}

            {targetType === 'EXP' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField type="number" label="Min Year *" required value={formData.minYear} onChange={val => setFormData({...formData, minYear: Number(val)})} />
                <InputField type="number" label="Max Year" value={formData.maxYear} onChange={val => setFormData({...formData, maxYear: val})} />
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default MasterDataManagement;