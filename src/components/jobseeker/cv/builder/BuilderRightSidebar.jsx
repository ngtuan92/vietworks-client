import React, { useState, useEffect } from 'react';
import { Palette, BookOpen, FileBox, Check, FileText, Download, ChevronDown, ArrowLeft } from 'lucide-react';
import cvService from '../../../../services/cvService';

const colors = ['#0056b3', '#1e3a8a', '#1e293b', '#15803d', '#b45309', '#991b1b', '#0d9488', '#7c3aed'];
const fonts = ['Inter', 'Roboto', 'Outfit', 'Montserrat', 'Poppins', 'Open Sans', 'Lora', 'Lato', 'Playfair Display', 'Fira Code'];

export const BuilderRightSidebar = ({ 
  style, onStyleChange, onExport, isSaving, navigateBack, currentTemplateId, onTemplateChange
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (activeTab === 'templates' && templates.length === 0) {
      const fetchTemplates = async () => {
        try {
          setLoadingTemplates(true);
          const res = await cvService.getActiveTemplates();
          if (res.success) setTemplates(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [activeTab, templates.length]);

  return (
    <div className="w-[320px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-100px)] sticky top-24 shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 shrink-0">
        <button onClick={() => setActiveTab('design')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'design' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
          <Palette className="w-4 h-4" /> Thiết kế
        </button>
        <button onClick={() => setActiveTab('templates')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'templates' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
          <BookOpen className="w-4 h-4" /> Mẫu CV
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/30">
        {activeTab === 'design' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Màu chủ đạo</label>
              <div className="flex flex-wrap gap-2.5">
                {colors.map(color => (
                  <button key={color} onClick={() => onStyleChange('themeColorId', color)} style={{ backgroundColor: color }} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${style.themeColorId === color ? 'border-white shadow-md ring-2 ring-primary' : 'border-transparent hover:ring-2 hover:ring-slate-300'}`} />
                ))}
                <div className="relative w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center cursor-pointer overflow-hidden hover:scale-110 transition-transform shadow-sm">
                  <Palette className="w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="color" value={style.themeColorId} onChange={(e) => onStyleChange('themeColorId', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Font chữ</label>
              <div className="relative">
                <select value={style.fontId || 'Inter'} onChange={(e) => onStyleChange('fontId', e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl p-3 pr-10 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold appearance-none">
                  {fonts.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cỡ chữ</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[{ id: 'small', label: 'Nhỏ' }, { id: 'medium', label: 'Vừa' }, { id: 'large', label: 'Lớn' }].map(sz => (
                  <button key={sz.id} onClick={() => onStyleChange('fontSize', sz.id)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${(style.fontSize || 'medium') === sz.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{sz.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mật độ dòng</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[{ id: 'compact', label: 'Chật' }, { id: 'normal', label: 'Vừa' }, { id: 'comfortable', label: 'Rộng' }].map(den => (
                  <button key={den.id} onClick={() => onStyleChange('density', den.id)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${(style.density || 'normal') === den.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{den.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kiểu tiêu đề</label>
              <div className="relative">
                <select value={style.titleStyle || 'underline'} onChange={(e) => onStyleChange('titleStyle', e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl p-3 pr-10 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold appearance-none">
                  <option value="underline">Gạch chân (Underline)</option>
                  <option value="accent-bg">Nền màu chủ đề (Accent Banner)</option>
                  <option value="left-border">Viền dọc bên trái (Left Border)</option>
                  <option value="minimal">Tối giản chữ trần (Minimal)</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Khung ảnh đại diện</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[{ id: 'circle', label: 'Tròn' }, { id: 'square', label: 'Vuông' }, { id: 'hidden', label: 'Ẩn' }].map(sh => (
                  <button key={sh.id} onClick={() => onStyleChange('avatarShape', sh.id)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${(style.avatarShape || 'circle') === sh.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{sh.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-2 gap-3">
            {loadingTemplates ? (
              <div className="col-span-2 py-10 text-center text-slate-400 text-sm">Đang tải danh sách mẫu...</div>
            ) : templates.map((tpl) => (
              <div key={tpl._id} onClick={() => onTemplateChange(tpl)} className={`group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col relative ${currentTemplateId === tpl._id ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-400'}`}>
                <div className="relative h-28 bg-slate-50 flex items-center justify-center p-2 overflow-hidden">
                  {tpl.previewImageUrl ? <img src={tpl.previewImageUrl} alt={tpl.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" /> : <FileText className="w-8 h-8 text-slate-300" />}
                  {currentTemplateId === tpl._id && <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md"><Check className="w-3 h-3 font-black" /></div>}
                </div>
                <div className="p-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 truncate max-w-[90px]">{tpl.name}</span>
                  {tpl.isPremium && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-extrabold rounded">PRO</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-5 flex flex-col gap-3 shrink-0 bg-slate-50">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            Lưu:
          </span>
          <span className={isSaving ? 'text-amber-600' : 'text-emerald-600 font-bold'}>{isSaving ? 'Đang lưu...' : 'Đã tự động lưu'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={navigateBack} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Thoát
          </button>
          <button onClick={onExport} disabled={isSaving} className="flex-[2] bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );
};
