import React, { useState, useEffect } from 'react';
import cvService from '../../../../services/cvService';
import { FileBox, ArrowLeft, Palette, LayoutDashboard, BookOpen, X, Pipette, ChevronDown, FileText, Check } from 'lucide-react';

const colors = [
  '#003f87', // VietWorks Blue (Primary)
  '#1e3a8a', // Elegant Navy
  '#1e293b', // Charcoal
  '#15803d', // Forest Green
  '#b45309', // Warm Terracotta
  '#991b1b', // Burgundy
  '#0d9488', // Teal
  '#7c3aed'  // Purple
];

const fonts = [
  'Inter',
  'Roboto',
  'Outfit',
  'Montserrat',
  'Poppins',
  'Open Sans',
  'Lora',
  'Lato',
  'Playfair Display',
  'Fira Code'
];

const sectionNames = {
  'PROFILE': 'Giới thiệu bản thân',
  'CONTACT': 'Thông tin liên hệ',
  'EDUCATION': 'Học vấn',
  'EXPERIENCE': 'Kinh nghiệm làm việc',
  'OBJECTIVE': 'Mục tiêu nghề nghiệp',
  'PROJECTS': 'Dự án thực tế',
  'SKILLS': 'Kỹ năng chuyên môn',
  'LANGUAGES': 'Ngoại ngữ',
  'CERTIFICATES': 'Chứng chỉ',
  'CERTIFICATIONS': 'Chứng chỉ & Giải thưởng',
  'ACTIVITIES': 'Hoạt động ngoại khóa',
  'HOBBIES': 'Sở thích & Hoạt động',
  'REFERENCES': 'Người tham chiếu',
  'AWARDS': 'Giải thưởng',
};

export const BuilderToolbar = ({ 
  style, 
  onStyleChange, 
  onExport, 
  isSaving, 
  navigateBack,
  sections = [],
  setSections,
  saveCvConfig,
  currentTemplateId,
  onTemplateChange
}) => {
  const [activeTab, setActiveTab] = useState('design'); // 'design', 'sections', 'templates'
  const [isOpen, setIsOpen] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const profileSection = sections.find(s => s.sectionCode === 'PROFILE');
  const hasAvatar = profileSection?.items[0]?.avatar;

  // Fetch templates when 'templates' tab is opened
  useEffect(() => {
    if (activeTab === 'templates' && templates.length === 0) {
      const fetchTemplates = async () => {
        try {
          setLoadingTemplates(true);
          const res = await cvService.getActiveTemplates();
          if (res.success) {
            setTemplates(res.data);
          }
        } catch (err) {
          console.error('Error fetching templates:', err);
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [activeTab, templates.length]);

  const handleToggleSection = (sectionCode) => {
    if (!sections || !setSections || !saveCvConfig) return;
    const updated = sections.map(sec =>
      sec.sectionCode === sectionCode ? { ...sec, isVisible: sec.isVisible === false ? true : false } : sec
    );
    setSections(updated);
    saveCvConfig(updated, style);
  };

  const handleTabClick = (tabId) => {
    if (activeTab === tabId && isOpen) {
      setIsOpen(false);
    } else {
      setActiveTab(tabId);
      setIsOpen(true);
    }
  };

  return (
    <div className="flex z-20 md:sticky md:top-24 h-fit max-h-[calc(100vh-120px)] shrink-0 select-none">
      {/* 1. Left Vertical Icon Tab Bar */}
      <div className="w-20 bg-slate-900 text-slate-400 flex flex-col justify-between items-center py-6 border-r border-slate-800 rounded-l-2xl shadow-sm z-30 shrink-0">
        <div className="flex flex-col items-center w-full gap-4">
          {/* Design Tab */}
          <button
            onClick={() => handleTabClick('design')}
            className={`w-16 py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'design' && isOpen
                ? 'bg-slate-800 text-white border border-slate-700/50 font-bold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/60 text-slate-400 font-semibold'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'design' && isOpen ? 'text-blue-400' : 'text-slate-400'}`}>palette</span>
            <span className="text-[9px] text-center leading-none mt-1">Thiết kế</span>
          </button>

          {/* Sections Tab */}
          <button
            onClick={() => handleTabClick('sections')}
            className={`w-16 py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sections' && isOpen
                ? 'bg-slate-800 text-white border border-slate-700/50 font-bold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/60 text-slate-400 font-semibold'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'sections' && isOpen ? 'text-blue-400' : 'text-slate-400'}`}>dashboard_customize</span>
            <span className="text-[9px] text-center leading-none mt-1">Bố cục</span>
          </button>

          {/* Templates Tab */}
          <button
            onClick={() => handleTabClick('templates')}
            className={`w-16 py-3 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'templates' && isOpen
                ? 'bg-slate-800 text-white border border-slate-700/50 font-bold shadow-sm'
                : 'hover:text-slate-200 hover:bg-slate-800/60 text-slate-400 font-semibold'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'templates' && isOpen ? 'text-blue-400' : 'text-slate-400'}`}>auto_stories</span>
            <span className="text-[9px] text-center leading-none mt-1">Mẫu CV</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center w-full gap-4 border-t border-slate-800 pt-4">
          {/* Quick PDF Export */}
          <button
            onClick={onExport}
            disabled={isSaving}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:bg-slate-800/50 disabled:text-slate-600"
            title="Tải PDF nhanh"
          >
            <FileBox className="w-5 h-5"  />
          </button>

          {/* Back Button */}
          <button
            onClick={navigateBack}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5"  />
          </button>
        </div>
      </div>

      {/* 2. Floating Option Drawer Panel */}
      <div 
        className={`bg-white border-y border-r border-slate-200/80 rounded-r-2xl shadow-sm flex flex-col h-[calc(100vh-120px)] transition-all duration-300 ${
          isOpen ? 'w-72 opacity-100 p-5 border-l-0' : 'w-0 opacity-0 p-0 border-l-0 overflow-hidden'
        }`}
      >
        {/* Header with Title & Close Icon */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 shrink-0">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
            {activeTab === 'design' && (
              <>
                <Palette className="text-slate-500 w-5 h-5"  />
                Thiết kế & Font
              </>
            )}
            {activeTab === 'sections' && (
              <>
                <LayoutDashboard className="text-slate-500 w-5 h-5"  />
                Ẩn / Hiện mục
              </>
            )}
            {activeTab === 'templates' && (
              <>
                <BookOpen className="text-slate-500 w-5 h-5"  />
                Thư viện mẫu CV
              </>
            )}
          </h3>

          <button 
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5"  />
          </button>
        </div>

        {/* Dynamic content scrollable area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-5 pr-1">
          {/* Tab 1: Design */}
          {activeTab === 'design' && (
            <div className="space-y-5">
              {/* Colors */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Màu chủ đạo</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => onStyleChange('themeColorId', color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                        style.themeColorId === color 
                          ? 'border-white shadow-md ring-2 ring-primary' 
                          : 'border-transparent hover:ring-2 hover:ring-slate-300'
                      }`}
                    />
                  ))}
                  
                  {/* Custom color picker */}
                  <div className="relative w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:scale-110 transition-transform shadow-sm">
                    <Pipette className="text-slate-500 w-5 h-5 pointer-events-none"  />
                    <input 
                      type="color" 
                      value={style.themeColorId} 
                      onChange={(e) => onStyleChange('themeColorId', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Font chữ</label>
                <div className="relative">
                  <select
                    value={style.fontId || 'Inter'}
                    onChange={(e) => onStyleChange('fontId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 pr-10 outline-none cursor-pointer focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold appearance-none"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5"  />
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Cỡ chữ</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'small', label: 'Nhỏ' },
                    { id: 'medium', label: 'Vừa' },
                    { id: 'large', label: 'Lớn' }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => onStyleChange('fontSize', sz.id)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        (style.fontSize || 'medium') === sz.id
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line spacing */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Mật độ giãn dòng</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'compact', label: 'Chật' },
                    { id: 'normal', label: 'Vừa' },
                    { id: 'comfortable', label: 'Rộng' }
                  ].map(den => (
                    <button
                      key={den.id}
                      type="button"
                      onClick={() => onStyleChange('density', den.id)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        (style.density || 'normal') === den.id
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {den.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Style */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Kiểu tiêu đề mục</label>
                <div className="relative">
                  <select
                    value={style.titleStyle || 'underline'}
                    onChange={(e) => onStyleChange('titleStyle', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 pr-10 outline-none cursor-pointer focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold appearance-none"
                  >
                    <option value="underline">Gạch chân (Underline)</option>
                    <option value="accent-bg">Nền màu chủ đề (Accent Banner)</option>
                    <option value="left-border">Viền dọc bên trái (Left Border)</option>
                    <option value="minimal">Tối giản chữ trần (Minimal)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5"  />
                </div>
              </div>

              {/* Avatar shape */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Hình dạng ảnh đại diện</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'circle', label: 'Tròn' },
                    { id: 'square', label: 'Vuông' },
                    { id: 'hidden', label: 'Ẩn' }
                  ].map(sh => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => onStyleChange('avatarShape', sh.id)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        (style.avatarShape || 'circle') === sh.id
                          ? 'bg-white text-primary shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

          {/* Tab 2: Show/Hide Sections */}
          {activeTab === 'sections' && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 mb-3 italic">Bật / Tắt trạng thái hiển thị của các phần nội dung trong CV</p>
              {sections.map((sec) => (
                <div 
                  key={sec.sectionCode} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex flex-col pr-2 overflow-hidden">
                    <span className="text-xs font-bold text-slate-700 leading-tight truncate">
                      {sectionNames[sec.sectionCode] || sec.title}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {sec.sectionCode}
                    </span>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input 
                      type="checkbox" 
                      checked={sec.isVisible !== false}
                      onChange={() => handleToggleSection(sec.sectionCode)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Template Changer */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-2 pb-2">
              {loadingTemplates ? (
                <div className="col-span-2 py-10 text-center text-slate-400 text-xs">Đang tải danh sách mẫu...</div>
              ) : templates.length > 0 ? (
                templates.map((tpl) => (
                  <div 
                    key={tpl._id} 
                    onClick={() => onTemplateChange(tpl)}
                    className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col relative ${
                      currentTemplateId === tpl._id 
                        ? 'border-blue-600 ring-2 ring-blue-500/20' 
                        : 'border-slate-200/80 hover:border-slate-400'
                    }`}
                  >
                    <div className="relative h-24 bg-slate-50 flex items-center justify-center p-1.5 overflow-hidden">
                      {tpl.previewImageUrl ? (
                        <img 
                          src={tpl.previewImageUrl} 
                          alt={tpl.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <FileText className="text-slate-300 w-5 h-5"  />
                      )}
                      
                      {currentTemplateId === tpl._id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-5 h-5 font-black"  />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">{tpl.name}</span>
                      {tpl.isPremium && (
                        <span className="px-1 py-0.2 bg-[#fff8e1] text-[#f57f17] text-[7px] font-extrabold rounded">PRO</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center text-slate-400 text-xs">Không tìm thấy mẫu nào</div>
              )}
            </div>
          )}
        </div>

        {/* Footer save status inside the drawer */}
        <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-2 bg-white shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
              Lưu:
            </span>
            <span className={isSaving ? 'text-amber-600' : 'text-emerald-600 font-bold'}>
              {isSaving ? 'Đang lưu...' : 'Đã tự động lưu'}
            </span>
          </div>

          <button
            onClick={onExport}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-[#002f6b] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs"
          >
            <FileBox className="w-5 h-5"  />
            Tải bản PDF
          </button>
        </div>
      </div>
    </div>
  );
};
