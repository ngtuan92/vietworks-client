import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import jobApi from '../../../services/jobService';
import companyMasterDataService from '../../../services/companyMasterDataService';
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
  const tabs = ['Danh mục', 'Cấp bậc', 'Kỹ năng / Tags', 'Lĩnh vực công ty'];
  const [loading, setLoading] = useState(false);

  // --- 2. Master Data States từ API ---
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [globalJobLevels, setGlobalJobLevels] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [companyIndustries, setCompanyIndustries] = useState([]);
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
    setLoading(true);
    try {
      const [resGroups, resLevels, resInd] = await Promise.all([
        jobApi.getCareerGroups(),
        jobApi.getJobLevels(),
        companyMasterDataService.getCompanyIndustries()
      ]);
      if (resGroups?.success) setCareerGroups(resGroups.data);
      if (resLevels?.success) {
        setJobLevels(resLevels.data);
        setGlobalJobLevels(resLevels.data);
      }
      if (resInd?.success) setCompanyIndustries(resInd.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDependentData = useCallback(async (careerGroupId = selectedCareerGroupId) => {
    try {
      if (careerGroupId) {
        const resCareers = await jobApi.getCareersByGroup(careerGroupId);
        if (resCareers?.success) setCareers(resCareers.data);

        const resSkills = await jobApi.getSkillsByCareerGroup(careerGroupId);
        if (resSkills?.success) setSkills(resSkills.data);
      } else {
        setCareers([]); 
        setPositions([]); 
        const resSkills = await jobApi.getAllSkills();
        if (resSkills?.success) setSkills(resSkills.data);
      }
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
  const filteredJobLevels = useMemo(() => {
    let filtered = jobLevels;
    if (selectedCareerGroupId) {
      const selectedGroup = careerGroups.find(g => g._id === selectedCareerGroupId);
      if (selectedGroup && selectedGroup.slug !== 'cong-nghe-thong-tin') {
        const itLevels = [
          'Thực tập sinh (IT)', 'Fresher', 'Junior', 'Senior',
          'Technical Leader', 'IT Manager / Project Manager',
          'Giám đốc công nghệ (CTO) / Director'
        ];
        filtered = filtered.filter(lvl => !itLevels.includes(lvl.name));
      }
    }
    return filtered.filter(filterItem);
  }, [jobLevels, filterItem, selectedCareerGroupId, careerGroups]);
  const filteredIndustries = useMemo(() => companyIndustries.filter(filterItem), [companyIndustries, filterItem]);

  const generateSlug = (str) => {
    return str.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

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
      let res;
      const dataPayload = { ...formData };
      if (targetType === 'SKILL') {
        dataPayload.careerGroupIds = [formData.careerGroupId];
        dataPayload.aliases = formData.aliases ? formData.aliases.split(',').map(s => s.trim()) : [];
      }

      // UPDATE
      if (editMode) {
        if (targetType === 'GROUP') res = await jobApi.updateCareerGroup(selectedId, dataPayload);
        if (targetType === 'CAREER') res = await jobApi.updateCareer(selectedId, dataPayload);
        if (targetType === 'POSITION') res = await jobApi.updateCareerPosition(selectedId, dataPayload);
        if (targetType === 'LEVEL') res = await jobApi.updateJobLevel(selectedId, dataPayload);
        if (targetType === 'SKILL') res = await jobApi.updateSkill(selectedId, dataPayload);
        if (targetType === 'INDUSTRY') res = await companyMasterDataService.updateCompanyIndustry(selectedId, dataPayload);
      } 
      // CREATE
      else {
        if (targetType === 'GROUP') res = await jobApi.createCareerGroup(dataPayload);
        if (targetType === 'CAREER') res = await jobApi.createCareer(dataPayload);
        if (targetType === 'POSITION') res = await jobApi.createCareerPosition(dataPayload);
        if (targetType === 'LEVEL') res = await jobApi.createJobLevel(dataPayload);
        if (targetType === 'SKILL') res = await jobApi.createSkill(dataPayload);
        if (targetType === 'INDUSTRY') res = await companyMasterDataService.createCompanyIndustry(dataPayload);
      }

      if (res?.success) {
        setIsModalOpen(false);
        loadGlobalData();
        loadDependentData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleToggleHide = async (type, id, name) => {
    if (!window.confirm(`Bạn có chắc muốn ẩn "${name}"?`)) return;
    try {
      let res;
      if (type === 'GROUP') res = await jobApi.deleteCareerGroup(id);
      if (type === 'CAREER') res = await jobApi.deleteCareer(id);
      if (type === 'POSITION') res = await jobApi.deleteCareerPosition(id);
      if (type === 'LEVEL') res = await jobApi.deleteJobLevel(id);
      if (type === 'SKILL') res = await jobApi.deleteSkill(id);
      if (type === 'INDUSTRY') res = await companyMasterDataService.deleteCompanyIndustry(id);
      if (res?.success) { loadGlobalData(); loadDependentData(); }
    } catch (err) {
      alert('Lỗi hệ thống');
    }
  };

  const renderStatusBadge = (status) => {
    return <StatusBadge value={status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} map={{ ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200' }} />;
  };

  const getHeaders = () => {
    if (tab === 'Cấp bậc') {
      return ['Mã ID', 'Tên hạng mục', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Kỹ năng / Tags') {
      return ['Mã ID', 'Tên Kỹ năng', 'Từ khóa (Aliases)', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Lĩnh vực công ty') {
      return ['Mã ID', 'Tên Lĩnh vực', 'Trạng thái', 'Thao tác'];
    }
    return ['Mã ID', 'Tên hạng mục', 'Phân cấp', 'Trạng thái', 'Thao tác'];
  };

  const renderTableContent = () => {
    if (loading) return <tr><td colSpan="5" className="px-6 py-12 text-center text-sm font-bold text-slate-400">Đang đồng bộ dữ liệu gốc từ Core Ledger...</td></tr>;

    switch (tab) {
      case 'Danh mục':
        if (filteredCareerGroups.length === 0) {
          return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy danh mục nào khớp bộ lọc</td></tr>;
        }

        return filteredCareerGroups.map(g => {
          const isGroupExpanded = selectedCareerGroupId === g._id;

          return (
            <Fragment key={g._id}>
              <tr
                className={`border-b border-slate-100 transition-colors cursor-pointer ${isGroupExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}
                onClick={() => {
                  setSelectedCareerGroupId(isGroupExpanded ? '' : g._id);
                  setSelectedCareerId('');
                }}
              >
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{g.code || g._id.slice(-6).toUpperCase()}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{g.name}</td>
                <td className="px-6 py-4"><span className="inline-flex rounded-md border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Cấp 1 (Nhóm)</span></td>
                <td className="px-6 py-4">{renderStatusBadge(g.status)}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <ActionButton tone="soft" onClick={() => openEditModal('GROUP', g)}>Sửa</ActionButton>
                    <ActionButton tone="danger" onClick={() => handleToggleHide('GROUP', g._id, g.name)}>Ẩn</ActionButton>
                  </div>
                </td>
              </tr>

              {isGroupExpanded && (
                filteredCareers.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-4 text-center text-sm font-medium text-slate-400 bg-slate-50/30">Chưa có dữ liệu Nghề nghiệp (Cấp 2) cho nhóm này</td></tr>
                ) : filteredCareers.map(c => {
                  const isCareerExpanded = selectedCareerId === c._id;

                  return (
                    <Fragment key={c._id}>
                      <tr
                        className={`border-b border-slate-100 transition-colors cursor-pointer ${isCareerExpanded ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50 bg-slate-50/20'}`}
                        onClick={() => setSelectedCareerId(isCareerExpanded ? '' : c._id)}
                      >
                        <td className="px-6 py-4 text-sm text-slate-400 pl-12"><span className="text-slate-300 mr-2">↳</span>{c._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm text-slate-800 pl-12 font-semibold"><span className="text-slate-300 mr-2">↳</span>{c.name}</td>
                        <td className="px-6 py-4"><span className="inline-flex rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Cấp 2 (Nghề)</span></td>
                        <td className="px-6 py-4">{renderStatusBadge(c.status)}</td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <ActionButton tone="soft" onClick={() => openEditModal('CAREER', c)}>Sửa</ActionButton>
                            <ActionButton tone="danger" onClick={() => handleToggleHide('CAREER', c._id, c.name)}>Ẩn</ActionButton>
                          </div>
                        </td>
                      </tr>

                      {isCareerExpanded && (
                        filteredPositions.length === 0 ? (
                          <tr><td colSpan="5" className="px-6 py-4 text-center text-sm font-medium text-slate-400 bg-emerald-50/10">Chưa có dữ liệu Vị trí chuyên môn (Cấp 3) cho nghề này</td></tr>
                        ) : filteredPositions.map(p => (
                          <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors bg-amber-50/10">
                            <td className="px-6 py-4 text-sm text-slate-400 pl-20"><span className="text-slate-300 mr-2">↳</span>{p._id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-4 text-sm text-slate-800 pl-20 font-medium"><span className="text-slate-300 mr-2">↳</span>{p.name}</td>
                            <td className="px-6 py-4"><span className="inline-flex rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Cấp 3 (Vị trí)</span></td>
                            <td className="px-6 py-4">{renderStatusBadge(p.status)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <ActionButton tone="soft" onClick={() => openEditModal('POSITION', p)}>Sửa</ActionButton>
                                <ActionButton tone="danger" onClick={() => handleToggleHide('POSITION', p._id, p.name)}>Ẩn</ActionButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </Fragment>
                  );
                })
              )}
            </Fragment>
          );
        });

      case 'Kỹ năng / Tags':
        if (filteredSkills.length === 0) return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu kỹ năng thỏa mãn bộ lọc</td></tr>;
        return filteredSkills.map(s => (
          <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{s._id.slice(-6).toUpperCase()}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{s.name}</td>
            <td className="px-6 py-4 text-sm text-slate-500">{s.aliases?.join(', ') || '--'}</td>
            <td className="px-6 py-4">{renderStatusBadge(s.status)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('SKILL', s)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('SKILL', s._id, s.name)}>Ẩn</ActionButton>
              </div>
            </td>
          </tr>
        ));

      case 'Cấp bậc':
        if (filteredJobLevels.length === 0) return <tr><td colSpan="4" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu cấp bậc thỏa mãn bộ lọc</td></tr>;
        return filteredJobLevels.map(l => (
          <tr key={l._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.code}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-800">{l.name}</td>
            <td className="px-6 py-4">{renderStatusBadge(l.status)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('LEVEL', l)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('LEVEL', l._id, l.name)}>Ẩn</ActionButton>
              </div>
            </td>
          </tr>
        ));


      case 'Lĩnh vực công ty':
        if (filteredIndustries.length === 0) return <tr><td colSpan="4" className="px-6 py-8 text-center text-sm italic text-slate-400">Không có dữ liệu thỏa mãn bộ lọc</td></tr>;
        return filteredIndustries.map(i => (
          <tr key={i._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm text-slate-500 font-mono">{i._id.substring(i._id.length - 6).toUpperCase()}</td>
            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{i.name}</td>
            <td className="px-6 py-4">{renderStatusBadge(i.status)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ActionButton tone="soft" onClick={() => openEditModal('INDUSTRY', i)}>Sửa</ActionButton>
                <ActionButton tone="danger" onClick={() => handleToggleHide('INDUSTRY', i._id, i.name)}>Ẩn</ActionButton>
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
            {tab === 'Danh mục' && <ActionButton tone="primary" onClick={() => openCreateModal('GROUP')}>+ Thêm Nhóm Ngành</ActionButton>}
            {tab === 'Cấp bậc' && <ActionButton tone="primary" onClick={() => openCreateModal('LEVEL')}>+ Thêm Cấp Bậc</ActionButton>}
            {tab === 'Kỹ năng / Tags' && <ActionButton tone="primary" onClick={() => openCreateModal('SKILL')}>+ Thêm Kỹ Năng</ActionButton>}
            {tab === 'Lĩnh vực công ty' && <ActionButton tone="primary" onClick={() => openCreateModal('INDUSTRY')}>+ Thêm Lĩnh Vực</ActionButton>}
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearchKeyword(''); setStatusFilter(''); }}
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
        <SimpleTable headers={getHeaders()}>
          {renderTableContent()}
        </SimpleTable>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hệ thống đồng bộ Core Ledger Intelligence</span>
        </div>
      </SectionCard>

      {isModalOpen && (
        <ModalShell
          title={`${editMode ? 'Chỉnh sửa' : 'Tạo mới'} - ${targetType}`}
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <ActionButton onClick={() => setIsModalOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="primary" onClick={handleFormSubmit}>Xác nhận</ActionButton>
            </>
          }
        >
          <div className="space-y-4">
            {editMode && (
              <div className="mb-4">
                <SelectField
                  label="Trạng thái"
                  value={formData.status || 'ACTIVE'}
                  onChange={(v) => setFormData({ ...formData, status: v })}
                  options={[['ACTIVE', 'Đang hoạt động'], ['INACTIVE', 'Đã ẩn']]}
                />
              </div>
            )}

            {['INDUSTRY', 'SKILL', 'CAREER', 'GROUP', 'POSITION', 'LEVEL'].includes(targetType) && (
              <div className="mb-4">
                <InputField label="Tên gọi" value={formData.name || ''} onChange={(v) => setFormData({ ...formData, name: v, slug: generateSlug(v) })} placeholder="Ví dụ: Công nghệ thông tin..." required />
              </div>
            )}

            {['GROUP', 'LEVEL'].includes(targetType) && !editMode && (
              <div className="mb-4">
                <InputField label="Mã Code hệ thống (Bất biến) *" required value={formData.code || ''} onChange={val => setFormData({ ...formData, code: val })} />
              </div>
            )}

            {['CAREER', 'POSITION', 'LEVEL', 'SKILL'].includes(targetType) && !editMode && (
              <div className="mb-4">
                <SelectField
                  label="Thuộc Nhóm ngành nghề cha (C1) *"
                  required
                  value={formData.careerGroupId || ''}
                  onChange={val => setFormData({ ...formData, careerGroupId: val })}
                  options={careerGroups.map(g => [g._id, g.name])}
                  placeholder="-- Chọn danh mục gốc --"
                />
              </div>
            )}

            {targetType === 'POSITION' && !editMode && (
              <div className="mb-4">
                <SelectField
                  label="Thuộc Phân hệ nghề con (C2) *"
                  required
                  value={formData.careerId || ''}
                  onChange={val => setFormData({ ...formData, careerId: val })}
                  options={careers.map(c => [c._id, c.name])}
                  placeholder="-- Chọn ngành nghề --"
                />
              </div>
            )}

            {targetType === 'SKILL' && (
              <div className="mb-4">
                <InputField label="Từ khóa alias (Phân tách bằng dấu phẩy)" value={formData.aliases || ''} onChange={(v) => setFormData({ ...formData, aliases: v })} placeholder="vd: js, javascript, nodejs" />
              </div>
            )}


          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default MasterDataManagement;