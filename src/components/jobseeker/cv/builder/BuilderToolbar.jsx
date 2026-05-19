import React from 'react';

const colors = ['#0056b3', '#1e293b', '#0d9488', '#e11d48', '#7c3aed'];
const fonts = ['Inter', 'Roboto', 'Outfit', 'Playfair Display', 'Fira Code'];

export const BuilderToolbar = ({ style, onStyleChange, onExport, isSaving, navigateBack }) => {
  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-auto md:h-screen shadow-md z-10 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8 cursor-pointer hover:text-blue-600 transition-colors" onClick={navigateBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="font-bold">Quay lại</span>
      </div>

      <h2 className="text-xl font-black text-gray-900 mb-6">Tùy chỉnh CV</h2>

      <div className="space-y-6 flex-1">
        {/* Colors */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Màu chủ đạo</label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onStyleChange('themeColorId', color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${style.themeColorId === color ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>

        {/* Fonts */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Font chữ</label>
          <div className="flex flex-col gap-2">
            {fonts.map(font => (
              <button
                key={font}
                onClick={() => onStyleChange('fontId', font)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${style.fontId === font ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'}`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>Trạng thái:</span>
          <span className={isSaving ? 'text-orange-500' : 'text-green-500'}>
            {isSaving ? 'Đang lưu...' : 'Đã lưu tự động'}
          </span>
        </div>
        <button
          onClick={onExport}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          Tải PDF
        </button>
      </div>
    </div>
  );
};
