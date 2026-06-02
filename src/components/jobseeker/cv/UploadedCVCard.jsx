import { useState, useRef } from 'react';

export const UploadedCVCard = ({ id, title, date, fileName, fileSize, fileUrl, fileType, onDelete, onDownload, onRename }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const type = fileType || ext;
    if (type === 'application/pdf' || ext === 'pdf') return { icon: 'picture_as_pdf', color: 'text-red-500' };
    if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc', 'docx'].includes(type) || ['doc', 'docx'].includes(ext)) return { icon: 'description', color: 'text-blue-500' };
    return { icon: 'insert_drive_file', color: 'text-gray-500' };
  };

  const { icon, color } = getFileIcon(fileType, fileName);

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

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (fileUrl) {
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Tải xuống thất bại, mở trong tab mới:', error);
        window.open(fileUrl, '_blank');
      }
    } else {
      onDownload?.(id);
    }
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden cursor-pointer flex flex-col items-center justify-center p-4"
        onClick={handleDownload}
      >
        <div className="w-16 h-20 bg-white rounded shadow-md flex items-center justify-center mb-3">
          <span className={`material-symbols-outlined ${color} text-3xl`}>{icon}</span>
        </div>
        <p className="text-xs text-slate-500 truncate w-full text-center">{fileName || 'document'}</p>
        <p className="text-xs text-slate-400 mt-1">{fileSize ? formatFileSize(fileSize) : 'N/A'}</p>
      </div>

      <div className="p-stack-md">
        <div className="flex justify-between items-start mb-base gap-2">
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
              onClick={handleDownload}
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

        <p className="text-on-surface-variant font-body-sm mb-stack-md">Tải lên: {date}</p>

        <div className="flex gap-stack-sm">
          <button
            onClick={handleDownload}
            className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary-fixed transition-colors text-body-sm"
          >
            Tải về
          </button>
        </div>
      </div>
    </div>
  );
};

export const UploadedCVPlaceholderCard = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-outline-variant rounded-xl bg-surface hover:bg-surface-container hover:border-primary transition-all group"
    >
      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-stack-md group-hover:bg-primary-fixed transition-colors">
        <span className="material-symbols-outlined text-primary group-hover:text-white text-headline-lg">upload</span>
      </div>
      <p className="font-bold text-on-surface">Tải CV lên</p>
      <p className="text-body-sm text-on-surface-variant">Định dạng: PDF, DOC, DOCX</p>
    </button>
  );
};