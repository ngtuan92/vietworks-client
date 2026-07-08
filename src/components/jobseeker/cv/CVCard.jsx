import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, CheckCircle, Download, Plus } from 'lucide-react';

export const CVCard = ({ id, title, date, isMain, image, isPublic, onDelete, onDownload, onRename, onSetMain, onTogglePublic }) => {
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameStart = (e) => {
    e.stopPropagation();
    setRenameValue(title);
    setIsRenaming(true);
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== title) {
      await onRename?.(id, trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') setIsRenaming(false);
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div
        className="relative aspect-[210/297] w-full bg-surface-container overflow-hidden cursor-pointer"
        onClick={() => navigate(`/cv-builder/${id}`)}
      >
        <img
          alt="CV Preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
        />
        <div className="absolute top-stack-md right-stack-md">
          <span className={`${isMain ? 'bg-primary text-white' : 'bg-[#e0e0e0] text-[#616161]'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
            {isMain ? 'Đang dùng' : 'Bản nháp'}
          </span>
        </div>
      </div>

      <div className="p-stack-md flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-base gap-2">
            {/* Title / Rename Input */}
            {isRenaming ? (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                onClick={e => e.stopPropagation()}
                className="flex-1 font-headline-md text-on-surface border-b-2 border-primary bg-transparent outline-none py-0.5 pr-2"
                placeholder="Nhập tên CV..."
                maxLength={80}
              />
            ) : (
              <h3
                className="font-headline-md text-headline-md text-on-surface hover:text-primary cursor-pointer transition-colors flex-1 min-w-0 truncate"
                onClick={() => navigate(`/cv-builder/${id}`)}
                title={title}
              >
                {title}
              </h3>
            )}

            <div className="flex gap-stack-sm shrink-0">
              <button
                onClick={handleRenameStart}
                className="p-stack-sm text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                title="Đổi tên CV"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete && onDelete(id, title)}
                className="p-stack-sm text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors"
                title="Xóa CV"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-on-surface-variant font-body-sm mb-stack-md">Cập nhật: {date}</p>
        </div>

        <div>
          {!isMain && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetMain?.(id); }}
              className="w-full mb-stack-sm bg-surface-container border border-outline-variant text-on-surface hover:bg-primary hover:text-white font-bold py-1.5 rounded-lg transition-all text-body-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              Dùng làm CV chính
            </button>
          )}

          {/* Toggle hiển thị trong Talent Pool */}
          <div className="flex items-center justify-between mt-2 mb-stack-sm p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-600 font-medium">Cho phép NTD tìm kiếm</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePublic?.(id, isPublic); }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isPublic ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title={isPublic ? 'Đang hiển thị với NTD' : 'Ẩn khỏi NTD tìm kiếm'}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex gap-stack-sm">
            <button
              onClick={() => navigate(`/cv-builder/${id}?preview=true`)}
              className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary-fixed transition-colors text-body-sm cursor-pointer"
            >
              Xem trước
            </button>
            <button
              onClick={() => navigate(`/cv-builder/${id}`)}
              className="flex-1 border border-slate-200 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors text-body-sm cursor-pointer"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => onDownload && onDownload(id)}
              className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              title="Tải PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CVPlaceholderCard = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/cv-templates/gallery')}
      className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-outline-variant rounded-xl bg-surface hover:bg-surface-container hover:border-primary transition-all group cursor-pointer"
    >
      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-stack-md group-hover:bg-primary-fixed transition-colors">
        <Plus className="text-primary w-8 h-8" />
      </div>
      <p className="font-bold text-on-surface">Tạo CV Mới</p>
      <p className="text-body-sm text-on-surface-variant">Chọn từ 20+ mẫu thiết kế</p>
    </button>
  );
};
