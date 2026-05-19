import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import adminService from '../../../services/adminService';

const defaultLayouts = [
  {
    id: 'left-col',
    name: 'Một Cột Trái',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left thin sidebar */}
        <rect x="5" y="5" width="25" height="50" rx="2" fill="#e5e7eb" />
        <circle cx="17.5" cy="15" r="5" fill="#9ca3af" />
        <rect x="10" y="26" width="15" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="34" width="15" height="4" rx="1" fill="#9ca3af" />
        
        {/* Right main area */}
        <rect x="35" y="5" width="60" height="12" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <rect x="40" y="9" width="30" height="4" rx="1" fill="#0056b3" />
        
        <rect x="35" y="22" width="60" height="14" rx="2" fill="#f3f4f6" />
        <rect x="40" y="27" width="45" height="4" rx="1" fill="#9ca3af" />
        
        <rect x="35" y="41" width="60" height="14" rx="2" fill="#f3f4f6" />
        <rect x="40" y="46" width="45" height="4" rx="1" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'header-left',
    name: 'Tiêu đề chia trái',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top header divided: left brand, right details */}
        <rect x="5" y="5" width="35" height="18" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <circle cx="15" cy="14" r="5" fill="#0056b3" />
        <rect x="23" y="12" width="12" height="4" rx="1" fill="#0056b3" />
        
        <rect x="45" y="5" width="50" height="18" rx="2" fill="#e5e7eb" />
        <rect x="50" y="9" width="35" height="3" rx="1" fill="#9ca3af" />
        <rect x="50" y="14" width="25" height="3" rx="1" fill="#9ca3af" />

        {/* Content body split into two sections vertically */}
        <rect x="5" y="28" width="90" height="11" rx="2" fill="#f3f4f6" />
        <rect x="10" y="32" width="70" height="3" rx="1" fill="#9ca3af" />
        
        <rect x="5" y="44" width="90" height="11" rx="2" fill="#f3f4f6" />
        <rect x="10" y="48" width="70" height="3" rx="1" fill="#9ca3af" />
      </svg>
    )
  },
  {
    id: 'two-col-equal',
    name: 'Hai Cột Bằng Nhau',
    svg: (
      <svg className="w-full h-20 border border-gray-300 rounded-lg p-2" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Title area spanning full width */}
        <rect x="5" y="5" width="90" height="10" rx="2" fill="#0056b3" fillOpacity="0.1" />
        <rect x="15" y="8" width="30" height="4" rx="1" fill="#0056b3" />

        {/* Two columns equally divided */}
        <rect x="5" y="20" width="42" height="35" rx="2" fill="#e5e7eb" />
        <rect x="10" y="26" width="32" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="34" width="24" height="4" rx="1" fill="#9ca3af" />
        <rect x="10" y="42" width="28" height="4" rx="1" fill="#9ca3af" />
        
        <rect x="53" y="20" width="42" height="35" rx="2" fill="#f3f4f6" />
        <rect x="58" y="26" width="32" height="4" rx="1" fill="#9ca3af" />
        <rect x="58" y="34" width="24" height="4" rx="1" fill="#9ca3af" />
        <rect x="58" y="42" width="28" height="4" rx="1" fill="#9ca3af" />
      </svg>
    )
  }
];

const defaultColors = [
  { hex: '#0056b3', name: 'Blue' },
  { hex: '#1e293b', name: 'Charcoal' },
  { hex: '#0d9488', name: 'Teal' },
  { hex: '#e11d48', name: 'Red' },
  { hex: '#7c3aed', name: 'Purple' }
];

const initialSections = [
  { id: 'personal_info', name: 'Thông tin cá nhân (Bắt buộc)', required: true },
  { id: 'objective', name: 'Mục tiêu nghề nghiệp', required: false },
  { id: 'experience', name: 'Kinh nghiệm làm việc', required: false },
  { id: 'education', name: 'Học vấn', required: false },
  { id: 'skills', name: 'Kỹ năng chuyên môn', required: false },
  { id: 'projects', name: 'Dự án tham gia', required: false },
  { id: 'certificates', name: 'Chứng chỉ / Giải thưởng', required: false },
  { id: 'activities', name: 'Hoạt động ngoại khóa', required: false }
];

const fontMapping = {
  'Inter': 'Inter, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Outfit': 'Outfit, sans-serif',
  'Playfair Display': 'Playfair Display, serif',
  'Fira Code': 'monospace'
};

const CVTemplateForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const isEditMode = !!id;
  const editingTemplate = location.state;

  // Form states
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [careerGroups, setCareerGroups] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState('left-col');
  const [defaultFont, setDefaultFont] = useState('Inter');
  const [primaryColor, setPrimaryColor] = useState('#0056b3');
  const [checkedSections, setCheckedSections] = useState({
    personal_info: true,
    objective: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certificates: false,
    activities: false
  });
  
  // Image Upload state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load Career Groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await adminService.getCareerGroups();
        if (res.success) setCareerGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  // Fill in form if in Edit Mode
  useEffect(() => {
    if (isEditMode && editingTemplate) {
      setName(editingTemplate.name || '');
      setIndustry(editingTemplate.careerGroupId?._id || editingTemplate.careerGroupId || '');
      setIsActive(editingTemplate.status === 'ACTIVE' || editingTemplate.isActive);
      
      const matchedLayout = defaultLayouts.find(l => l.id === editingTemplate.templateCode);
      if (matchedLayout) setSelectedLayout(matchedLayout.id);
      
      setDefaultFont(editingTemplate.layoutConfig?.defaultFontId || editingTemplate.font || 'Inter');
      setPrimaryColor(editingTemplate.layoutConfig?.defaultColorId || editingTemplate.color || '#0056b3');
      
      if (editingTemplate.previewImageUrl) {
        setPreviewUrl(editingTemplate.previewImageUrl);
      }
    }
  }, [isEditMode, editingTemplate]);

  // Section Checkbox Toggle
  const handleSectionToggle = (sectionId) => {
    const section = initialSections.find(s => s.id === sectionId);
    if (section && section.required) return; // Keep required disabled from changing

    setCheckedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ tải lên file hình ảnh hợp lệ (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }
    setPreviewImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewUrl(null);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên mẫu CV.');
      return;
    }
    if (!industry) {
      alert('Vui lòng chọn ngành nghề.');
      return;
    }

    try {
      const payload = {
        name,
        careerGroupId: industry,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        templateCode: selectedLayout,
        layoutConfig: {
          columns: selectedLayout === 'two-col-equal' ? 2 : 1,
          defaultFontId: defaultFont, // Would map to ObjectId later
          defaultColorId: primaryColor, // Would map to ObjectId later
          defaultSectionCodes: Object.keys(checkedSections)
            .filter(k => checkedSections[k])
            .map(k => k.toUpperCase())
        }
      };

      let result;
      if (isEditMode) {
        result = await adminService.updateTemplate(id, payload);
      } else {
        result = await adminService.createTemplate(payload);
      }

      if (result.success) {
        if (previewImage) {
          await adminService.uploadTemplatePreview(result.data._id, previewImage);
        }
        alert(isEditMode ? 'Cập nhật mẫu CV thành công!' : 'Tạo mới mẫu CV thành công!');
        navigate('/admin/cv-templates');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi lưu mẫu CV.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top sticky action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-5">
        <div>
          <span className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 cursor-pointer hover:text-[#0056b3] transition-colors" onClick={() => navigate('/admin/cv-templates')}>
            Mẫu CV
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            {isEditMode ? 'Cập nhật Mẫu CV' : 'Tạo mới Mẫu CV'}
          </span>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mt-1">
            {isEditMode ? `Cập nhật Mẫu CV: ${editingTemplate?.id || ''}` : 'Tạo Mới Mẫu CV'}
          </h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Cấu hình chi tiết giao diện và nội dung mặc định cho mẫu CV mới trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/cv-templates')}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#0056b3] hover:bg-[#004085] text-white font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            Lưu Mẫu CV
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Middle Column (Form properties) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Thông tin cơ bản */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">info</span>
              Thông tin cơ bản
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên mẫu CV *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Modern Professional, Creative Minimal..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngành nghề phù hợp *</label>
                <select
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="">Chọn ngành nghề</option>
                  {careerGroups.map(group => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-sm font-bold text-gray-900">Trạng thái hoạt động</label>
                  <span className="text-xs text-gray-500 block mt-0.5">Hiển thị mẫu CV này cho ứng viên lựa chọn sử dụng.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? 'bg-[#0056b3]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Cấu hình thiết kế */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">palette</span>
              Cấu hình thiết kế
            </h2>

            {/* Layout selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Chọn Layout Cấu Trúc</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {defaultLayouts.map((lay) => (
                  <button
                    key={lay.id}
                    type="button"
                    onClick={() => setSelectedLayout(lay.id)}
                    className={`relative text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 bg-white ${
                      selectedLayout === lay.id
                        ? 'border-[#0056b3] bg-blue-50/10 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* SVG Layout */}
                    <div className="w-full text-gray-400 group-hover:text-gray-600 transition-colors">
                      {lay.svg}
                    </div>

                    {/* Radio Button Indicator & Name */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                        selectedLayout === lay.id ? 'border-[#0056b3] bg-[#0056b3]' : 'border-gray-300'
                      }`}>
                        {selectedLayout === lay.id && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{lay.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Font Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Font Chữ Mặc Định</label>
                <select
                  value={defaultFont}
                  onChange={(e) => setDefaultFont(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none cursor-pointer"
                >
                  <option value="Inter">Inter (Mặc định)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Fira Code">Fira Code</option>
                </select>
              </div>

              {/* Theme Colors circles selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Màu Chủ Đạo</label>
                <div className="flex flex-wrap items-center gap-3">
                  {defaultColors.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm relative transition-transform hover:scale-105 border ${
                        primaryColor === color.hex ? 'border-gray-900 ring-2 ring-blue-500/40 ring-offset-2' : 'border-transparent'
                      }`}
                      title={color.name}
                    >
                      {primaryColor === color.hex && (
                        <span className="material-symbols-outlined text-white text-[18px]">done</span>
                      )}
                    </button>
                  ))}
                  {/* Custom Color Selector trigger */}
                  <div className="relative">
                    <label
                      htmlFor="customColorPicker"
                      className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-500 flex items-center justify-center cursor-pointer transition-colors"
                      title="Chọn màu khác"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-[18px]">add</span>
                    </label>
                    <input
                      id="customColorPicker"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Danh sách Section Mặc định */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0056b3] text-[22px]">dns</span>
                Danh sách Section Mặc định
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Chọn các phần nội dung sẽ được bật sẵn khi người dùng tạo CV theo mẫu này.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {initialSections.map((sec) => (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => handleSectionToggle(sec.id)}
                  disabled={sec.required}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    sec.required
                      ? 'bg-gray-100/50 border-gray-200 cursor-not-allowed opacity-80'
                      : checkedSections[sec.id]
                      ? 'border-[#0056b3] bg-blue-50/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                    checkedSections[sec.id]
                      ? 'bg-[#0056b3] border-[#0056b3] text-white'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {checkedSections[sec.id] && (
                      <span className="material-symbols-outlined text-[14px] font-bold">done</span>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${sec.required ? 'text-gray-400' : 'text-gray-800'}`}>
                    {sec.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar - Stacked Upload & Live Preview Cards */}
        <div className="space-y-6">
          
          {/* Card 1: Upload Ảnh Preview Tĩnh */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">image</span>
              Ảnh Preview Thiết Kế (Tĩnh)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Hình ảnh thiết kế chính thức (PNG, JPG) sẽ hiển thị trong thư viện Mẫu CV để người dùng có thể xem trước.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[250px] ${
                isDragging
                  ? 'border-[#0056b3] bg-blue-50/20'
                  : previewUrl
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
              }`}
            >
              {previewUrl ? (
                // Selected file view
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 relative group">
                  <img
                    src={previewUrl}
                    alt="CV template preview"
                    className="max-h-[280px] rounded-lg shadow-sm border border-gray-300 object-contain max-w-full"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md flex items-center justify-center transition-colors"
                      title="Gỡ bỏ ảnh"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 truncate max-w-full px-4">
                    {previewImage ? previewImage.name : 'image_preview.png'}
                  </span>
                  <label
                    htmlFor="previewImageUploader"
                    className="text-xs font-bold text-[#0056b3] hover:underline cursor-pointer"
                  >
                    Thay đổi ảnh khác
                  </label>
                </div>
              ) : (
                // Empty state upload prompt
                <div className="flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                    <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Kéo thả ảnh hoặc click để chọn</span>
                  </div>
                  <span className="text-[10px] text-gray-400 leading-normal max-w-[200px] block pt-1">
                    Hỗ trợ JPG, PNG (Tối đa 5MB).
                  </span>
                </div>
              )}
              {/* Invisible File Input */}
              <input
                id="previewImageUploader"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={!!previewUrl}
              />
            </div>
          </div>

          {/* Card 2: Live Mockup Preview tương tác */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0056b3] text-[22px]">visibility</span>
              Live Mockup Preview (Mô phỏng)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mô phỏng cấu trúc cột, màu chủ đạo, font chữ và các phần nội dung đã chọn ở bên trái (thời gian thực).
            </p>

            {/* Mockup Frame */}
            <div 
              style={{ 
                fontFamily: fontMapping[defaultFont] || 'sans-serif',
              }}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md aspect-[1/1.4] w-full flex flex-col overflow-hidden transition-all duration-300 relative group"
            >
              {/* Left Column Layout Mockup */}
              {selectedLayout === 'left-col' && (
                <div className="flex-1 flex gap-3 h-full overflow-hidden">
                  {/* Left Sidebar */}
                  <div 
                    style={{ backgroundColor: primaryColor }}
                    className="w-1/3 rounded-lg p-2.5 text-white flex flex-col gap-4 transition-colors duration-300 overflow-hidden"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-white/30 rounded-full mx-auto flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-white/80">person</span>
                    </div>
                    {/* Sidebar details */}
                    <div className="space-y-2">
                      <div className="h-1 bg-white/40 w-full rounded-sm"></div>
                      <div className="h-1 bg-white/30 w-5/6 rounded-sm"></div>
                      <div className="h-1 bg-white/30 w-2/3 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* Right Main area */}
                  <div className="flex-1 flex flex-col gap-3 py-1 pr-1 overflow-y-auto scrollbar-none">
                    {/* Header Box */}
                    <div className="border-b pb-1.5" style={{ borderColor: `${primaryColor}20` }}>
                      <h3 className="text-[12px] font-bold text-gray-800 tracking-tight leading-none truncate">
                        {name || 'Họ và Tên'}
                      </h3>
                      <p className="text-[8px] font-bold mt-1 uppercase truncate" style={{ color: primaryColor }}>
                        {industry || 'Vị trí ứng tuyển'}
                      </p>
                    </div>

                    {/* Sections List mapped */}
                    <div className="space-y-3 flex-1">
                      {initialSections.map(sec => checkedSections[sec.id] && (
                        <div key={sec.id} className="space-y-1">
                          <h4 className="text-[9px] font-extrabold flex items-center gap-1 border-b pb-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                            {sec.name.replace(' (Bắt buộc)', '')}
                          </h4>
                          <div className="space-y-1 pl-1">
                            <div className="h-1 bg-gray-200 w-full rounded-sm"></div>
                            <div className="h-1 bg-gray-100 w-5/6 rounded-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Header Left Layout Mockup */}
              {selectedLayout === 'header-left' && (
                <div className="flex-1 flex flex-col gap-3 h-full py-1 overflow-hidden">
                  {/* Header block */}
                  <div className="flex items-center justify-between border-b pb-2 flex-shrink-0" style={{ borderColor: `${primaryColor}30` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      </div>
                      <div>
                        <h3 className="text-[11px] font-bold text-gray-800 leading-none truncate max-w-[100px]">{name || 'Họ và Tên'}</h3>
                        <p className="text-[7px] font-bold text-gray-400 mt-0.5 uppercase truncate max-w-[100px]">{industry || 'Ngành nghề'}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-1 bg-gray-300 w-12 rounded-sm ml-auto"></div>
                      <div className="h-1 bg-gray-200 w-9 rounded-sm ml-auto"></div>
                    </div>
                  </div>

                  {/* Main Wide Area */}
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-none pr-1">
                    {initialSections.map(sec => checkedSections[sec.id] && (
                      <div key={sec.id} className="space-y-1.5">
                        <h4 className="text-[8px] font-extrabold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                          {sec.name.replace(' (Bắt buộc)', '')}
                        </h4>
                        <div className="space-y-1 pl-2">
                          <div className="h-1 bg-gray-200 w-full rounded-sm"></div>
                          <div className="h-1 bg-gray-100 w-3/4 rounded-sm"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two Column Equal Mockup */}
              {selectedLayout === 'two-col-equal' && (
                <div className="flex-1 flex flex-col gap-3 h-full py-1 overflow-hidden">
                  {/* Full Width Top Header */}
                  <div className="p-2 rounded-lg text-white flex justify-between items-center flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                    <div>
                      <h3 className="text-[11px] font-bold tracking-tight truncate max-w-[120px]">{name || 'Họ và Tên'}</h3>
                      <span className="text-[7px] text-white/80 block mt-0.5 font-bold uppercase truncate max-w-[120px]">{industry || 'Vị trí'}</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                    </div>
                  </div>

                  {/* Split Columns */}
                  <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto scrollbar-none pr-1">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {initialSections.filter((_, i) => i % 2 === 0).map(sec => checkedSections[sec.id] && (
                        <div key={sec.id} className="space-y-1">
                          <h4 className="text-[8px] font-extrabold border-b pb-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                            {sec.name.replace(' (Bắt buộc)', '')}
                          </h4>
                          <div className="space-y-1 pl-1">
                            <div className="h-1 bg-gray-200 w-full rounded-sm"></div>
                            <div className="h-1 bg-gray-100 w-5/6 rounded-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {initialSections.filter((_, i) => i % 2 !== 0).map(sec => checkedSections[sec.id] && (
                        <div key={sec.id} className="space-y-1">
                          <h4 className="text-[8px] font-extrabold border-b pb-0.5" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                            {sec.name.replace(' (Bắt buộc)', '')}
                          </h4>
                          <div className="space-y-1 pl-1">
                            <div className="h-1 bg-gray-200 w-full rounded-sm"></div>
                            <div className="h-1 bg-gray-100 w-5/6 rounded-sm"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Watermark brand */}
              <div className="absolute bottom-1 right-2 text-[6px] font-extrabold text-gray-300 pointer-events-none">
                VIETWORKS TEMPLATE
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CVTemplateForm;
