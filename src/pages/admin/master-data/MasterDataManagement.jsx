// components/admin/MasterDataManagement.jsx
import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { Edit2, Eye, EyeOff } from 'lucide-react';
import careerGroupService from '../../../services/careerGroupService';
import careerService from '../../../services/careerService';
import careerPositionService from '../../../services/careerPositionService';
import jobLevelService from '../../../services/jobLevelService';
import skillService from '../../../services/skillService';
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
  
  // --- 1. Quản lý Tabs ---
  const [tab, setTab] = useState('Danh mục');
  const tabs = ['Danh mục', 'Nghề nghiệp', 'Vị trí', 'Cấp bậc', 'Kỹ năng'];
  const [loading, setLoading] = useState(false);

  // --- 2. Master Data States ---
  const [careerGroups, setCareerGroups] = useState([]);
  const [careers, setCareers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  // --- 3. Filters States ---
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = tất cả, 'ACTIVE', 'INACTIVE'
  const [selectedCareerGroupId, setSelectedCareerGroupId] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- 4. Form & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [targetType, setTargetType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    code: '',
    description: '',
    order: 0,
    levelOrder: 1,
    status: 'ACTIVE',
    careerGroupId: '',
    careerId: '',
    aliases: '',
    careerGroupIds: []
  });

  // --- 5. Load Data ---
  const loadCareerGroups = useCallback(async () => {
    try {
      // Lấy tất cả (cả ACTIVE và INACTIVE) để hiển thị trong dropdown
      const response = await careerGroupService.getCareerGroups({ 
        page: 1, 
        limit: 100,
        status: '' // Bỏ filter status để lấy tất cả
      });
      if (response?.success) {
        setCareerGroups(response.data || []);
      }
    } catch (err) {
      console.error('Error loading career groups:', err);
    }
  }, []);

  const loadCareers = useCallback(async () => {
    try {
      const params = {
        page: 1,
        limit: 100,
        ...(selectedCareerGroupId && { careerGroupId: selectedCareerGroupId }),
      };
      
      // Nếu statusFilter có giá trị thì truyền lên, không thì bỏ qua để lấy tất cả
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await careerService.getCareers(params);
      if (response?.success) {
        setCareers(response.data || []);
      }
    } catch (err) {
      console.error('Error loading careers:', err);
    }
  }, [selectedCareerGroupId, statusFilter]);

  const loadJobLevels = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(searchKeyword && { search: searchKeyword })
      };
      
      // Nếu statusFilter có giá trị thì truyền lên
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await jobLevelService.getJobLevels(params);
      
      if (response?.success) {
        setJobLevels(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading job levels:', err);
      alert(err?.message || 'Lỗi khi tải danh sách cấp bậc');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchKeyword]);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(selectedCareerGroupId && { careerGroupId: selectedCareerGroupId }),
        ...(selectedCareerId && { careerId: selectedCareerId }),
        ...(searchKeyword && { search: searchKeyword })
      };
      
      // Nếu statusFilter có giá trị thì truyền lên
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await careerPositionService.getCareerPositions(params);
      
      if (response?.success) {
        setPositions(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading positions:', err);
      alert(err?.message || 'Lỗi khi tải danh sách vị trí');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCareerGroupId, selectedCareerId, statusFilter, searchKeyword]);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(selectedCareerGroupId && { careerGroupId: selectedCareerGroupId }),
        ...(searchKeyword && { search: searchKeyword })
      };
      
      // Nếu statusFilter có giá trị thì truyền lên
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await skillService.getSkills(params);
      
      if (response?.success) {
        setSkills(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error loading skills:', err);
      alert(err?.message || 'Lỗi khi tải danh sách kỹ năng');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCareerGroupId, statusFilter, searchKeyword]);

  useEffect(() => {
    loadCareerGroups();
  }, []);

  useEffect(() => {
    if (tab === 'Nghề nghiệp' || tab === 'Vị trí') {
      loadCareers();
    }
  }, [tab, selectedCareerGroupId, statusFilter, loadCareers]);

  useEffect(() => {
    if (tab === 'Vị trí') {
      loadPositions();
    }
  }, [tab, loadPositions]);

  useEffect(() => {
    if (tab === 'Cấp bậc') {
      loadJobLevels();
    }
  }, [tab, loadJobLevels]);

  useEffect(() => {
    if (tab === 'Kỹ năng') {
      loadSkills();
    }
  }, [tab, loadSkills]);

  // --- 6. Filter Logic (Client-side filtering) ---
  const filterItem = useCallback((item) => {
    // Client-side filter chỉ áp dụng cho searchKeyword
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase().trim();
      const matchName = item.name?.toLowerCase().includes(keyword);
      const matchCode = item.code?.toLowerCase().includes(keyword);
      const matchAlias = item.aliases?.some(alias => alias.toLowerCase().includes(keyword));
      if (!matchName && !matchCode && !matchAlias) return false;
    }
    return true;
  }, [searchKeyword]);

  const filteredCareerGroups = useMemo(() => careerGroups.filter(filterItem), [careerGroups, filterItem]);
  const filteredCareers = useMemo(() => careers.filter(filterItem), [careers, filterItem]);
  const filteredPositions = useMemo(() => positions.filter(filterItem), [positions, filterItem]);
  const filteredJobLevels = useMemo(() => jobLevels.filter(filterItem), [jobLevels, filterItem]);
  const filteredSkills = useMemo(() => skills.filter(filterItem), [skills, filterItem]);

  // --- 7. Utility Functions ---
  const generateSlug = (str) => {
    if (!str) return '';
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

  // --- 8. CRUD Operations ---
  const openCreateModal = (type) => {
    setEditMode(false);
    setSelectedId(null);
    setTargetType(type);
    setFormData({
      name: '',
      slug: '',
      code: '',
      description: '',
      order: 0,
      levelOrder: 1,
      status: 'ACTIVE',
      careerGroupId: selectedCareerGroupId || '',
      careerId: selectedCareerId || '',
      aliases: '',
      careerGroupIds: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setEditMode(true);
    setSelectedId(item._id);
    setTargetType(type);
    setFormData({
      name: item.name || '',
      slug: item.slug || '',
      code: item.code || '',
      description: item.description || '',
      order: item.order || 0,
      levelOrder: item.levelOrder || 1,
      status: item.status || 'ACTIVE',
      careerGroupId: item.careerGroupId?._id || item.careerGroupId || '',
      careerId: item.careerId?._id || item.careerId || '',
      aliases: item.aliases ? item.aliases.join(', ') : '',
      careerGroupIds: item.careerGroupIds?.map(g => g._id || g) || []
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên');
      return;
    }

    try {
      let response;
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name)
      };

      if (targetType === 'SKILL') {
        payload.aliases = formData.aliases 
          ? formData.aliases.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        payload.careerGroupIds = formData.careerGroupIds || [];
        delete payload.careerGroupId;
        delete payload.careerId;
        delete payload.order;
        delete payload.levelOrder;
        delete payload.code;
        delete payload.description;
      }

      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      if (editMode) {
        switch (targetType) {
          case 'SKILL':
            response = await skillService.updateSkill(selectedId, payload);
            break;
          case 'POSITION':
            response = await careerPositionService.updateCareerPosition(selectedId, payload);
            break;
          case 'CAREER':
            response = await careerService.updateCareer(selectedId, payload);
            break;
          case 'GROUP':
            response = await careerGroupService.updateCareerGroup(selectedId, payload);
            break;
          case 'LEVEL':
            response = await jobLevelService.updateJobLevel(selectedId, payload);
            break;
          default:
            break;
        }
      } else {
        switch (targetType) {
          case 'SKILL':
            response = await skillService.createSkill(payload);
            break;
          case 'POSITION':
            response = await careerPositionService.createCareerPosition(payload);
            break;
          case 'CAREER':
            response = await careerService.createCareer(payload);
            break;
          case 'GROUP':
            response = await careerGroupService.createCareerGroup(payload);
            break;
          case 'LEVEL':
            response = await jobLevelService.createJobLevel(payload);
            break;
          default:
            break;
        }
      }

      if (response?.success) {
        setIsModalOpen(false);
        if (targetType === 'SKILL') {
          await loadSkills();
        } else if (targetType === 'POSITION') {
          await loadPositions();
        } else if (targetType === 'CAREER') {
          await loadCareers();
        } else if (targetType === 'LEVEL') {
          await loadJobLevels();
        } else {
          await loadCareerGroups();
        }
        alert(editMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(err?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleToggleHide = async (type, id, name, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'ẩn' : 'kích hoạt lại';
    if (!window.confirm(`Bạn có chắc muốn ${action} "${name}"?`)) return;
    
    try {
      let response;
      
      switch (type) {
        case 'SKILL':
          if (currentStatus === 'ACTIVE') {
            response = await skillService.softDeleteSkill(id);
          } else {
            response = await skillService.restoreSkill(id);
          }
          break;
        case 'POSITION':
          if (currentStatus === 'ACTIVE') {
            response = await careerPositionService.softDeleteCareerPosition(id);
          } else {
            response = await careerPositionService.restoreCareerPosition(id);
          }
          break;
        case 'CAREER':
          if (currentStatus === 'ACTIVE') {
            response = await careerService.softDeleteCareer(id);
          } else {
            response = await careerService.restoreCareer(id);
          }
          break;
        case 'GROUP':
          if (currentStatus === 'ACTIVE') {
            response = await careerGroupService.softDeleteCareerGroup(id);
          } else {
            response = await careerGroupService.restoreCareerGroup(id);
          }
          break;
        case 'LEVEL':
          if (currentStatus === 'ACTIVE') {
            response = await jobLevelService.softDeleteJobLevel(id);
          } else {
            response = await jobLevelService.restoreJobLevel(id);
          }
          break;
        default:
          break;
      }
      
      if (response?.success) {
        if (type === 'SKILL') {
          await loadSkills();
        } else if (type === 'POSITION') {
          await loadPositions();
        } else if (type === 'CAREER') {
          await loadCareers();
        } else if (type === 'LEVEL') {
          await loadJobLevels();
        } else {
          await loadCareerGroups();
        }
        alert(`${action} thành công!`);
      }
    } catch (err) {
      console.error('Toggle hide error:', err);
      alert(err?.message || 'Lỗi hệ thống');
    }
  };


  // --- 9. Render Functions ---
  const renderStatusBadge = (status) => {
    return <StatusBadge 
      value={status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'} 
      map={{ 
        ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', 
        INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200' 
      }} 
    />;
  };

  const renderTableContent = () => {
    if (loading) {
      return <tr><td colSpan="7" className="px-6 py-12 text-center text-sm font-bold text-slate-400">Đang tải dữ liệu...</td></tr>;
    }

    // Career Groups
    if (tab === 'Danh mục') {
      if (filteredCareerGroups.length === 0) {
        return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy nhóm nghề nào</td></tr>;
      }

      return filteredCareerGroups.map((g) => (
        <tr key={g._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{g.code || g._id.slice(-6).toUpperCase()}</td>
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{g.name}</td>
          <td className="px-6 py-4 text-sm text-slate-600">{g.description || '--'}</td>
          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(g.status)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 flex-nowrap">
              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal('GROUP', g)} title="Sửa">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`p-1.5 rounded transition-colors ${g.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => handleToggleHide('GROUP', g._id, g.name, g.status)}
                title={g.status === 'ACTIVE' ? 'Ẩn' : 'Kích hoạt'}
              >
                {g.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </td>
        </tr>
      ));
    }

    // Careers
    if (tab === 'Nghề nghiệp') {
      if (filteredCareers.length === 0) {
        return <tr><td colSpan="6" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy nghề nào</td></tr>;
      }

      return filteredCareers.map((c) => (
        <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{c.code || c._id.slice(-6).toUpperCase()}</td>
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{c.name}</td>
          <td className="px-6 py-4 text-sm text-slate-600">
            {c.careerGroupId?.name || '--'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(c.status)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 flex-nowrap">
              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal('CAREER', c)} title="Sửa">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`p-1.5 rounded transition-colors ${c.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => handleToggleHide('CAREER', c._id, c.name, c.status)}
                title={c.status === 'ACTIVE' ? 'Ẩn' : 'Kích hoạt'}
              >
                {c.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </td>
        </tr>
      ));
    }

    // Positions
    if (tab === 'Vị trí') {
      if (filteredPositions.length === 0) {
        return <tr><td colSpan="7" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy vị trí nào</td></tr>;
      }

      return filteredPositions.map((p) => (
        <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.code || p._id.slice(-6).toUpperCase()}</td>
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.name}</td>
          <td className="px-6 py-4 text-sm text-slate-600">
            {p.careerGroupId?.name || '--'}
          </td>
          <td className="px-6 py-4 text-sm text-slate-600">
            {p.careerId?.name || '--'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(p.status)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 flex-nowrap">
              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal('POSITION', p)} title="Sửa">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`p-1.5 rounded transition-colors ${p.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => handleToggleHide('POSITION', p._id, p.name, p.status)}
                title={p.status === 'ACTIVE' ? 'Ẩn' : 'Kích hoạt'}
              >
                {p.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </td>
        </tr>
      ));
    }

    // Job Levels
    if (tab === 'Cấp bậc') {
      if (filteredJobLevels.length === 0) {
        return <tr><td colSpan="5" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy cấp bậc nào</td></tr>;
      }

      return filteredJobLevels.map((l) => (
        <tr key={l._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{l.code || l._id.slice(-6).toUpperCase()}</td>
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{l.name}</td>
          <td className="px-6 py-4 text-sm text-slate-600">{l.levelOrder || 0}</td>
          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(l.status)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 flex-nowrap">
              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal('LEVEL', l)} title="Sửa">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`p-1.5 rounded transition-colors ${l.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => handleToggleHide('LEVEL', l._id, l.name, l.status)}
                title={l.status === 'ACTIVE' ? 'Ẩn' : 'Kích hoạt'}
              >
                {l.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </td>
        </tr>
      ));
    }

    // Skills
    if (tab === 'Kỹ năng') {
      if (filteredSkills.length === 0) {
        return <tr><td colSpan="6" className="px-6 py-8 text-center text-sm italic text-slate-400">Không tìm thấy kỹ năng nào</td></tr>;
      }

      return filteredSkills.map((s) => (
        <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{s._id.slice(-6).toUpperCase()}</td>
          <td className="px-6 py-4 text-sm font-bold text-slate-900">{s.name}</td>
          <td className="px-6 py-4 text-sm text-slate-600">
            {s.aliases?.join(', ') || '--'}
          </td>
          <td className="px-6 py-4 text-sm text-slate-600">
            {s.careerGroupIds?.map(g => g.name).join(', ') || '--'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(s.status)}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2 flex-nowrap">
              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => openEditModal('SKILL', s)} title="Sửa">
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`p-1.5 rounded transition-colors ${s.status === 'ACTIVE' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                onClick={() => handleToggleHide('SKILL', s._id, s.name, s.status)}
                title={s.status === 'ACTIVE' ? 'Ẩn' : 'Kích hoạt'}
              >
                {s.status === 'ACTIVE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </td>
        </tr>
      ));
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1 || (tab !== 'Vị trí' && tab !== 'Cấp bậc' && tab !== 'Kỹ năng')) return null;

    return (
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-slate-600">
          Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} 
          {tab === 'Vị trí' ? ' vị trí' : tab === 'Cấp bậc' ? ' cấp bậc' : ' kỹ năng'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Trước
          </button>
          <span className="px-3 py-1 text-sm">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-slate-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    const isSkill = targetType === 'SKILL';
    const isPosition = targetType === 'POSITION';
    const isCareer = targetType === 'CAREER';
    const isLevel = targetType === 'LEVEL';
    
    return (
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <InputField
            label="Tên *"
            value={formData.name || ''}
            onChange={(v) => setFormData({ 
              ...formData, 
              name: v, 
              slug: generateSlug(v) 
            })}
            placeholder={
              isSkill ? "Ví dụ: JavaScript" :
              isPosition ? "Ví dụ: Frontend Developer" : 
              isCareer ? "Ví dụ: Lập trình viên" : 
              isLevel ? "Ví dụ: Senior" : 
              "Ví dụ: Công nghệ thông tin"
            }
            required
          />
        </div>

        {!isSkill && (
          <div>
            <InputField
              label="Mã code *"
              value={formData.code || ''}
              onChange={(v) => setFormData({ ...formData, code: v.toUpperCase() })}
              placeholder={
                isPosition ? "Ví dụ: FE_DEV" : 
                isCareer ? "Ví dụ: DEV" : 
                isLevel ? "Ví dụ: SENIOR" : 
                "Ví dụ: IT"
              }
              required
              disabled={editMode}
            />
            {editMode && (
              <p className="text-xs text-amber-600 mt-1">Mã code không thể thay đổi sau khi tạo</p>
            )}
          </div>
        )}

        {isLevel && (
          <div>
            <InputField
              label="Thứ tự cấp bậc *"
              type="number"
              value={formData.levelOrder || 1}
              onChange={(v) => setFormData({ ...formData, levelOrder: parseInt(v) || 1 })}
              placeholder="1"
              required
              min="1"
            />
            <p className="text-xs text-slate-500 mt-1">Số nhỏ hơn sẽ hiển thị trước</p>
          </div>
        )}

        {isSkill && (
          <>
            <div>
              <InputField
                label="Từ khóa alias (phân cách bằng dấu phẩy)"
                value={formData.aliases || ''}
                onChange={(v) => setFormData({ ...formData, aliases: v })}
                placeholder="Ví dụ: js, javascript, nodejs"
              />
              <p className="text-xs text-slate-500 mt-1">Các tên gọi khác của kỹ năng này</p>
            </div>

            <div>
              <SelectField
                label="Nhóm nghề liên quan"
                value={formData.careerGroupIds || []}
                onChange={(v) => setFormData({ ...formData, careerGroupIds: v })}
                options={careerGroups
                  .filter(g => g.status === 'ACTIVE') // Chỉ hiển thị nhóm đang hoạt động
                  .map(g => [g._id, `${g.code} - ${g.name}`])}
                placeholder="-- Chọn nhóm nghề --"
                multiple
              />
              <p className="text-xs text-slate-500 mt-1">Chọn nhiều nhóm nghề nếu kỹ năng này áp dụng cho nhiều lĩnh vực</p>
            </div>
          </>
        )}

        {isPosition && (
          <>
            <div>
              <SelectField
                label="Nhóm nghề *"
                value={formData.careerGroupId || ''}
                onChange={(v) => {
                  setFormData({ ...formData, careerGroupId: v, careerId: '' });
                  const loadCareersByGroup = async () => {
                    try {
                      const response = await careerService.getCareers({ 
                        careerGroupId: v, 
                        status: 'ACTIVE',
                        page: 1, 
                        limit: 100 
                      });
                      if (response?.success) {
                        setCareers(response.data || []);
                      }
                    } catch (err) {
                      console.error('Error loading careers:', err);
                    }
                  };
                  if (v) loadCareersByGroup();
                }}
                options={careerGroups
                  .filter(g => g.status === 'ACTIVE')
                  .map(g => [g._id, `${g.code} - ${g.name}`])}
                placeholder="-- Chọn nhóm nghề --"
                required
                disabled={editMode}
              />
            </div>

            <div>
              <SelectField
                label="Nghề *"
                value={formData.careerId || ''}
                onChange={(v) => setFormData({ ...formData, careerId: v })}
                options={careers
                  .filter(c => c.status === 'ACTIVE')
                  .map(c => [c._id, `${c.code} - ${c.name}`])}
                placeholder="-- Chọn nghề --"
                required
                disabled={editMode}
              />
            </div>
          </>
        )}

        {isCareer && (
          <div>
            <SelectField
              label="Nhóm nghề *"
              value={formData.careerGroupId || ''}
              onChange={(v) => setFormData({ ...formData, careerGroupId: v })}
              options={careerGroups
                .filter(g => g.status === 'ACTIVE')
                .map(g => [g._id, `${g.code} - ${g.name}`])}
              placeholder="-- Chọn nhóm nghề --"
              required
              disabled={editMode}
            />
            {editMode && (
              <p className="text-xs text-amber-600 mt-1">Nhóm nghề không thể thay đổi sau khi tạo</p>
            )}
          </div>
        )}

        {!isSkill && !isLevel && (
          <div>
            <InputField
              label="Mô tả"
              value={formData.description || ''}
              onChange={(v) => setFormData({ ...formData, description: v })}
              placeholder="Mô tả ngắn"
            />
          </div>
        )}

        {!isSkill && !isLevel && (
          <div>
            <InputField
              label="Thứ tự hiển thị"
              type="number"
              value={formData.order || 0}
              onChange={(v) => setFormData({ ...formData, order: parseInt(v) || 0 })}
              placeholder="0"
            />
          </div>
        )}

        {editMode && (
          <div>
            <SelectField
              label="Trạng thái"
              value={formData.status || 'ACTIVE'}
              onChange={(v) => setFormData({ ...formData, status: v })}
              options={[
                ['ACTIVE', 'Đang hoạt động'],
                ['INACTIVE', 'Đã ẩn']
              ]}
            />
          </div>
        )}
      </form>
    );
  };

  const getHeaders = () => {
    if (tab === 'Danh mục') {
      return ['Mã ID', 'Tên nhóm nghề', 'Mô tả', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Nghề nghiệp') {
      return ['Mã ID', 'Tên nghề', 'Nhóm nghề', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Vị trí') {
      return ['Mã ID', 'Tên vị trí', 'Nhóm nghề', 'Nghề', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Cấp bậc') {
      return ['Mã ID', 'Tên cấp bậc', 'Thứ tự', 'Trạng thái', 'Thao tác'];
    }
    if (tab === 'Kỹ năng') {
      return ['ID', 'Tên kỹ năng', 'Alias', 'Nhóm nghề', 'Trạng thái', 'Thao tác'];
    }
    return [];
  };

  return (
    <div className="space-y-7 pb-10 animate-rise-in">
      <PageHeader
        title="Quản lý Master Data"
        description="Quản lý danh mục nhóm nghề, nghề nghiệp, vị trí, cấp bậc và kỹ năng trên hệ thống."
        actions={
          <div className="flex gap-2 flex-wrap">
            {tab === 'Danh mục' && (
              <ActionButton tone="primary" onClick={() => openCreateModal('GROUP')}>
                + Thêm Nhóm Nghề
              </ActionButton>
            )}
            {tab === 'Nghề nghiệp' && (
              <ActionButton tone="primary" onClick={() => openCreateModal('CAREER')}>
                + Thêm Nghề
              </ActionButton>
            )}
            {tab === 'Vị trí' && (
              <ActionButton tone="primary" onClick={() => openCreateModal('POSITION')}>
                + Thêm Vị Trí
              </ActionButton>
            )}
            {tab === 'Cấp bậc' && (
              <ActionButton tone="primary" onClick={() => openCreateModal('LEVEL')}>
                + Thêm Cấp Bậc
              </ActionButton>
            )}
            {tab === 'Kỹ năng' && (
              <ActionButton tone="primary" onClick={() => openCreateModal('SKILL')}>
                + Thêm Kỹ Năng
              </ActionButton>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { 
              setTab(t); 
              setSearchKeyword(''); 
              setStatusFilter(''); // Reset status filter khi đổi tab
              setSelectedCareerGroupId('');
              setSelectedCareerId('');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              tab === t ? 'bg-primary text-white border border-primary' : 
              'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <SectionCard title="Bộ lọc & Tìm kiếm">
        <FilterGrid>
          <InputField 
            label="Tìm kiếm từ khóa" 
            value={searchKeyword} 
            onChange={(val) => {
              setSearchKeyword(val);
              setPage(1);
            }} 
            placeholder="Nhập tên hoặc mã..." 
          />

          {tab === 'Vị trí' && (
            <>
              <SelectField
                label="Nhóm nghề"
                value={selectedCareerGroupId}
                onChange={(val) => {
                  setSelectedCareerGroupId(val);
                  setSelectedCareerId('');
                  setPage(1);
                }}
                options={[
                  ['', 'Tất cả nhóm nghề'],
                  ...careerGroups
                    .filter(g => g.status === 'ACTIVE')
                    .map(g => [g._id, g.name])
                ]}
              />

              <SelectField
                label="Nghề"
                value={selectedCareerId}
                onChange={(val) => {
                  setSelectedCareerId(val);
                  setPage(1);
                }}
                options={[
                  ['', 'Tất cả nghề'],
                  ...careers
                    .filter(c => c.status === 'ACTIVE')
                    .map(c => [c._id, c.name])
                ]}
                disabled={!selectedCareerGroupId}
              />
            </>
          )}

          {tab === 'Nghề nghiệp' && (
            <SelectField
              label="Nhóm nghề"
              value={selectedCareerGroupId}
              onChange={(val) => {
                setSelectedCareerGroupId(val);
                setPage(1);
              }}
              options={[
                ['', 'Tất cả nhóm nghề'],
                ...careerGroups
                  .filter(g => g.status === 'ACTIVE')
                  .map(g => [g._id, g.name])
              ]}
            />
          )}

          {tab === 'Kỹ năng' && (
            <SelectField
              label="Nhóm nghề"
              value={selectedCareerGroupId}
              onChange={(val) => {
                setSelectedCareerGroupId(val);
                setPage(1);
              }}
              options={[
                ['', 'Tất cả nhóm nghề'],
                ...careerGroups
                  .filter(g => g.status === 'ACTIVE')
                  .map(g => [g._id, g.name])
              ]}
            />
          )}

          <SelectField
            label="Trạng thái"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              ['', 'Tất cả trạng thái'],
              ['ACTIVE', 'Đang hoạt động'], 
              ['INACTIVE', 'Đã ẩn']
            ]}
          />
        </FilterGrid>
      </SectionCard>

      {/* Table */}
      <SectionCard className="p-0 overflow-hidden">
        <SimpleTable headers={getHeaders()}>
          {renderTableContent()}
        </SimpleTable>
        {renderPagination()}
      </SectionCard>

      {/* Modal */}
      {isModalOpen && (
        <ModalShell
          title={`${editMode ? 'Chỉnh sửa' : 'Tạo mới'} ${
            targetType === 'SKILL' ? 'Kỹ Năng' :
            targetType === 'POSITION' ? 'Vị Trí' : 
            targetType === 'CAREER' ? 'Nghề' : 
            targetType === 'LEVEL' ? 'Cấp Bậc' : 
            'Nhóm Nghề'
          }`}
          onClose={() => setIsModalOpen(false)}
          footer={
            <>
              <ActionButton onClick={() => setIsModalOpen(false)}>Hủy</ActionButton>
              <ActionButton tone="primary" onClick={handleFormSubmit}>
                {editMode ? 'Cập nhật' : 'Tạo mới'}
              </ActionButton>
            </>
          }
        >
          {renderModalContent()}
        </ModalShell>
      )}
    </div>
  );
};

export default MasterDataManagement;