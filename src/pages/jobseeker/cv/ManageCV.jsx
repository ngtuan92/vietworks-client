import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CVWelcome from '../../../components/jobseeker/cv/CVWelcome';
import CVFilter from '../../../components/jobseeker/cv/CVFilter';
import { CVCard, CVPlaceholderCard } from '../../../components/jobseeker/cv/CVCard';
import { UploadedCVCard, UploadedCVPlaceholderCard } from '../../../components/jobseeker/cv/UploadedCVCard';
import ProfileStrength from '../../../components/jobseeker/cv/ProfileStrength';
import CVExpertReview from '../../../components/jobseeker/cv/CVExpertReview';
import CareerResources from '../../../components/jobseeker/cv/CareerResources';
import cvService from '../../../services/cvService';
import { useNotification } from '../../../contexts/NotificationContext';
import { HelpCircle, MessageSquare, X, Loader2, UploadCloud, FileBox, FileText, File } from 'lucide-react';

const ManageCV = () => {
  const navigate = useNavigate();
  const { success, error, confirm } = useNotification();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploadedCvs, setUploadedCvs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { icon: <FileBox className="w-6 h-6 text-red-500" />, color: 'text-red-500', bgColor: 'bg-red-100' };
    if (['doc', 'docx'].includes(ext)) return { icon: <FileText className="w-6 h-6 text-blue-500" />, color: 'text-blue-500', bgColor: 'bg-blue-100' };
    return { icon: <File className="w-6 h-6 text-gray-500" />, color: 'text-gray-500', bgColor: 'bg-gray-100' };
  };

  const fetchCvs = async () => {
    try {
      const response = await cvService.getUserCvs();
      if (response.success) {
        setCvs(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch CVs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedCvs = async () => {
    try {
      const response = await cvService.getUserUploadedCvs();
      if (response.success) {
        setUploadedCvs(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch uploaded CVs:', err);
    }
  };

  useEffect(() => {
    fetchCvs();
    fetchUploadedCvs();
  }, []);

  const handleDeleteCv = (id, title) => {
    confirm(
      `Bạn có chắc chắn muốn xóa CV "${title}" không? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          const res = await cvService.deleteCv(id);
          if (res.success) {
            // Sau khi xóa, nếu CV bị xóa là CV chính, backend sẽ tự động set 1 CV khác làm chính,
            // vì thế ta fetch lại toàn bộ danh sách để đồng bộ UI thay vì chỉ filter client-side.
            await fetchCvs();
            success('Xóa CV thành công!');
          } else {
            error(res.message || 'Xóa CV thất bại!');
          }
        } catch (err) {
          console.error('Delete CV failed:', err);
          error('Đã xảy ra lỗi khi xóa CV!');
        }
      },
      null,
      'Xác nhận xóa'
    );
  };

  const handleDownloadPdf = (id) => {
    navigate(`/cv-builder/${id}?download=true`);
  };

  const handleRenameCv = async (id, newTitle) => {
    try {
      const res = await cvService.updateCv(id, { title: newTitle });
      if (res.success) {
        setCvs(prev => prev.map(cv => cv._id === id ? { ...cv, title: newTitle } : cv));
        success('Đổi tên CV thành công!');
      } else {
        error(res.message || 'Đổi tên thất bại!');
      }
    } catch (err) {
      console.error('Rename CV failed:', err);
      error('Đã xảy ra lỗi khi đổi tên CV!');
    }
  };

  const handleSetMain = async (id) => {
    try {
      const res = await cvService.updateCv(id, { isMain: true });
      if (res.success) {
        success('Đặt CV làm CV chính thành công!');
        await fetchCvs();
      } else {
        error(res.message || 'Đặt CV chính thất bại!');
      }
    } catch (err) {
      console.error('Set main CV failed:', err);
      error('Đã xảy ra lỗi khi đặt CV chính!');
    }
  };

  // Tính số lượng CV cho các filter
  const counts = {
    all: cvs.length,
    active: cvs.filter(cv => cv.isMain).length,
    draft: cvs.filter(cv => !cv.isMain).length
  };

  // Lọc CV theo filter hiện tại
  const filteredCvs = cvs.filter(cv => {
    if (filter === 'active') return cv.isMain;
    if (filter === 'draft') return !cv.isMain;
    return true;
  });

  const handleDeleteUploadedCv = (id, title) => {
    confirm(
      `Bạn có chắc chắn muốn xóa CV "${title}" không? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          const res = await cvService.deleteUploadedCv(id);
          if (res.success) {
            setUploadedCvs(prev => prev.filter(cv => cv._id !== id));
            success('Xóa CV thành công!');
          } else {
            error(res.message || 'Xóa CV thất bại!');
          }
        } catch (err) {
          console.error('Delete uploaded CV failed:', err);
          error('Đã xảy ra lỗi khi xóa CV!');
        }
      },
      null,
      'Xác nhận xóa'
    );
  };

  const handleDownloadUploadedCv = (id) => {
    const cv = uploadedCvs.find(c => c._id === id);
    if (cv?.fileUrl) {
      window.open(cv.fileUrl, '_blank');
    }
  };

  const handleRenameUploadedCv = async (id, newTitle) => {
    try {
      const res = await cvService.updateUploadedCv(id, { title: newTitle });
      if (res.success) {
        setUploadedCvs(prev => prev.map(cv => cv._id === id ? { ...cv, title: newTitle } : cv));
        success('Đổi tên CV thành công!');
      } else {
        error(res.message || 'Đổi tên thất bại!');
      }
    } catch (err) {
      console.error('Rename uploaded CV failed:', err);
      error('Đã xảy ra lỗi khi đổi tên CV!');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      error('Chỉ chấp nhận file PDF!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadFile(file);
    setShowUploadModal(true);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadFile.name.replace(/\.[^/.]+$/, ''));
      const res = await cvService.uploadCv(formData);
      if (res.success) {
        setUploadedCvs(prev => [res.data, ...prev]);
        success('Tải CV lên thành công!');
        setShowUploadModal(false);
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        error(res.message || 'Tải CV thất bại!');
      }
    } catch (err) {
      console.warn('Upload CV failed:', err);
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi tải CV!';
      error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md">

      <main className="max-w-container-max mx-auto px-gutter py-stack-lg">
        {/* Welcome Section */}
        <CVWelcome />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* CV List - Main Content */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {/* Filter and Stats */}
            <CVFilter currentFilter={filter} onFilterChange={setFilter} counts={counts} />

            {/* Online CV Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Mẫu CV của tôi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                {loading ? (
                  <div className="col-span-full py-10 text-center text-gray-500">Đang tải danh sách CV...</div>
                ) : (
                  <>
                    {filteredCvs.map(cv => (
                      <CVCard
                        key={cv._id}
                        id={cv._id}
                        title={cv.title}
                        date={new Date(cv.updatedAt).toLocaleDateString('vi-VN')}
                        isMain={cv.isMain}
                        image={cv.templateId?.thumbnailUrl || "https://via.placeholder.com/300x400?text=No+Preview"}
                        onDelete={handleDeleteCv}
                        onDownload={handleDownloadPdf}
                        onRename={handleRenameCv}
                        onSetMain={handleSetMain}
                      />
                    ))}
                    {filter !== 'active' && <CVPlaceholderCard />}
                  </>
                )}
              </div>
            </div>

            {/* Uploaded CV Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">CV đã tải lên</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                {uploadedCvs.map(cv => (
                  <UploadedCVCard
                    key={cv._id}
                    id={cv._id}
                    title={cv.title}
                    date={new Date(cv.createdAt).toLocaleDateString('vi-VN')}
                    fileName={cv.fileName}
                    fileSize={cv.fileSize}
                    fileUrl={cv.fileUrl}
                    fileType={cv.fileType}
                    onDelete={handleDeleteUploadedCv}
                    onDownload={handleDownloadUploadedCv}
                    onRename={handleRenameUploadedCv}
                  />
                ))}
                <UploadedCVPlaceholderCard onClick={() => fileInputRef.current?.click()} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-stack-lg">
            <ProfileStrength />
            <CVExpertReview />
            <CareerResources />
          </div>
        </div>
      </main>

      {/* Floating Action for Help */}
      <div className="fixed bottom-gutter right-gutter flex flex-col gap-stack-md items-end z-40">
        <button className="bg-surface-container-lowest shadow-lg border border-outline-variant p-stack-md rounded-full text-on-surface-variant hover:text-primary transition-all group relative">
          <HelpCircle className="w-5 h-5" />
          <span className="absolute right-full mr-stack-md whitespace-nowrap bg-on-surface text-on-secondary px-3 py-1 rounded text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Support</span>
        </button>
        <button className="bg-primary text-on-secondary shadow-lg p-stack-md rounded-full hover:scale-105 active:scale-95 transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Tải CV lên</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="hover:bg-white/20 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {uploadFile && (
                <div className="mb-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {(() => {
                      const { icon, color, bgColor } = getFileIcon(uploadFile?.name);
                      return (
                        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                          {icon}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{uploadFile.name}</p>
                      <p className="text-sm text-slate-500">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={uploading || !uploadFile}
                  className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      Tải lên
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCV;
