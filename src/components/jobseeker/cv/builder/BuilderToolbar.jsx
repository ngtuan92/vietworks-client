import React from 'react';

const colors = [
  '#0056b3', // Blue
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

export const BuilderToolbar = ({ style, onStyleChange, onExport, isSaving, navigateBack }) => {
  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-auto md:h-screen shadow-md z-10 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-blue-600 transition-colors" onClick={navigateBack}>
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span className="font-bold text-sm">Quay lại</span>
      </div>

      <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
        <span className="material-symbols-outlined text-blue-600">palette</span>
        Thiết Kế CV
      </h2>

      <div className="space-y-6 flex-1">
        {/* Colors */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2.5">Màu chủ đạo</label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onStyleChange('themeColorId', color)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${style.themeColorId === color ? 'border-gray-900 shadow-md ring-2 ring-blue-500/20' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>

        {/* Font Selection Dropdown */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Font chữ</label>
          <select
            value={style.fontId || 'Inter'}
            onChange={(e) => onStyleChange('fontId', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size Dropdown */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Cỡ chữ</label>
          <select
            value={style.fontSize || 'medium'}
            onChange={(e) => onStyleChange('fontSize', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="small">Nhỏ (Compact)</option>
            <option value="medium">Vừa (Standard)</option>
            <option value="large">Lớn (Readable)</option>
          </select>
        </div>

        {/* Density Dropdown */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Mật độ giãn dòng</label>
          <select
            value={style.density || 'normal'}
            onChange={(e) => onStyleChange('density', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="compact">Chặt chẽ (Compact)</option>
            <option value="normal">Tiêu chuẩn (Normal)</option>
            <option value="comfortable">Rộng rãi (Comfortable)</option>
          </select>
        </div>

        {/* Title Style Dropdown */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Kiểu tiêu đề mục</label>
          <select
            value={style.titleStyle || 'underline'}
            onChange={(e) => onStyleChange('titleStyle', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="underline">Gạch chân (Underline)</option>
            <option value="accent-bg">Nền màu chủ đề (Accent Banner)</option>
            <option value="left-border">Viền dọc bên trái (Left Border)</option>
            <option value="minimal">Tối giản chữ trần (Minimal)</option>
          </select>
        </div>

        {/* Avatar Shape Dropdown */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Hình dạng ảnh đại diện</label>
          <select
            value={style.avatarShape || 'circle'}
            onChange={(e) => onStyleChange('avatarShape', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="circle">Ảnh tròn (Circle)</option>
            <option value="square">Hình vuông bo nhẹ (Rounded Square)</option>
            <option value="hidden">Ẩn ảnh đại diện (Hidden)</option>
          </select>
        </div>
      </div>

      <div className="mt-8 space-y-3 border-t pt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>Trạng thái:</span>
          <span className={isSaving ? 'text-orange-500' : 'text-green-500 font-bold'}>
            {isSaving ? 'Đang lưu...' : 'Đã lưu tự động'}
          </span>
        </div>
        <button
          onClick={onExport}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          Tải PDF
        </button>
      </div>
    </div>
  );
};
