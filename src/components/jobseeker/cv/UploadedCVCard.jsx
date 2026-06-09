import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cvService from '../../../services/cvService';
import { Edit, Trash2, Eye, Download, X, Loader2, AlertCircle, FileText, Upload, FileBox, File } from 'lucide-react';
export const UploadedCVCard = ({ id, title, date, fileName, fileSize, fileUrl, fileType, onDelete, onDownload, onRename }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const inputRef = useRef(null);

  const isPdf = fileType === 'application/pdf' || fileName?.split('.').pop()?.toLowerCase() === 'pdf';

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const type = fileType || ext;
    if (type === 'application/pdf' || ext === 'pdf') return { icon: <FileBox className="w-8 h-8 text-red-500" />, color: 'text-red-500' };
    if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc', 'docx'].includes(type) || ['doc', 'docx'].includes(ext)) return { icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'text-blue-500' };
    return { icon: <File className="w-8 h-8 text-gray-500" />, color: 'text-gray-500' };
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
    e?.stopPropagation();
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

  const handleOpenPreview = async (e) => {
    e.stopPropagation();
    setShowPreview(true);
    if (!isPdf || previewBlobUrl) return;

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const blob = await cvService.getUploadedCvView(id);
      setPreviewBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      setPreviewError('Không thể tải file để xem trước.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden cursor-pointer flex flex-col items-center justify-center p-4"
        onClick={handleDownload}
      >
        <div className="w-16 h-20 bg-white rounded shadow-md flex items-center justify-center mb-3">
          {icon}
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

        <p className="text-on-surface-variant font-body-sm mb-stack-md">Tải lên: {date}</p>

        <div className="flex gap-stack-sm">
          <button
            onClick={handleOpenPreview}
            className="flex-1 border border-outline text-on-surface font-bold py-2 rounded-lg hover:bg-surface-container-low transition-colors text-body-sm flex items-center justify-center gap-1"
          >
            <Eye className="w-5 h-5" />
            Xem trước
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary-fixed transition-colors text-body-sm flex items-center justify-center gap-1"
          >
            <Download className="w-5 h-5" />
            Tải về
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleClosePreview}>
          <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-headline-md text-on-surface">{title}</h3>
                <p className="text-body-sm text-on-surface-variant">{fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-3 py-2 border border-primary text-primary rounded-lg hover:bg-primary-fixed transition-colors text-body-sm"
                >
                  <Download className="w-5 h-5" />
                  Tải về
                </button>
                <button
                  onClick={handleClosePreview}
                  className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden" style={{ minHeight: '75vh' }}>
              {isPdf ? (
                previewLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <Loader2 className="animate-spin w-10 h-10 text-primary mb-3" />
                    <p className="text-on-surface-variant">Đang tải file...</p>
                  </div>
                ) : previewError ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                    <AlertCircle className="w-10 h-10 text-error mb-3" />
                    <p className="text-on-surface-variant mb-4">{previewError}</p>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Tải về để xem
                    </button>
                  </div>
                ) : previewBlobUrl ? (
                  <iframe
                    src={previewBlobUrl}
                    className="w-full h-full"
                    style={{ minHeight: '75vh' }}
                    title={title}
                  />
                ) : null
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-8">
                  <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-on-surface-variant" />
                  </div>
                  <h4 className="font-headline-md text-on-surface mb-2">Không hỗ trợ xem trước</h4>
                  <p className="text-on-surface-variant text-body-sm mb-6">
                    Trình duyệt không thể hiển thị trực tiếp file <span className="font-semibold">.{fileName?.split('.').pop()}</span>. Hãy tải về để xem.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Tải về để xem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
        <Upload className="text-primary group-hover:text-white w-8 h-8" />
      </div>
      <p className="font-bold text-on-surface">Tải CV lên</p>
      <p className="text-body-sm text-on-surface-variant">Định dạng: PDF (tối đa 10MB)</p>
    </button>
  );
};
