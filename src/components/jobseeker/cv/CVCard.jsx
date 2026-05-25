import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const CVCard = ({ id, title, date, isActive, image, onDelete, onDownload, onRename }) => {
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
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="relative h-48 bg-surface-container overflow-hidden cursor-pointer"
        onClick={() => navigate(`/cv-builder/${id}`)}
      >
        <img
          alt="CV Preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
        />
        <div className="absolute top-stack-md right-stack-md">
          <span className={`${isActive ? 'bg-primary text-white' : 'bg-outline-variant text-on-surface-variant'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
            {isActive ? 'Đang dùng' : 'Không hoạt động'}
          </span>
        </div>
      </div>

      <div className="p-stack-md">
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
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button
              onClick={() => onDelete && onDelete(id, title)}
              className="p-stack-sm text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors"
              title="Xóa CV"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <p className="text-on-surface-variant font-body-sm mb-stack-md">Cập nhật: {date}</p>

        <div className="flex gap-stack-sm">
          <button
            onClick={() => navigate(`/cv-builder/${id}`)}
            className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary-fixed transition-colors text-body-sm"
          >
            Xem trước
          </button>
          <button
            onClick={() => onDownload && onDownload(id)}
            className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Tải PDF"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
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
      className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-outline-variant rounded-xl bg-surface hover:bg-surface-container hover:border-primary transition-all group"
    >
      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-stack-md group-hover:bg-primary-fixed transition-colors">
        <span className="material-symbols-outlined text-primary text-headline-lg">add</span>
      </div>
      <p className="font-bold text-on-surface">Tạo Mẫu CV Mới</p>
      <p className="text-body-sm text-on-surface-variant">Chọn từ 20+ bố cục thiết kế</p>
    </button>
  );
};
