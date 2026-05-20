import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CVWelcome from '../../../components/jobseeker/cv/CVWelcome';
import CVFilter from '../../../components/jobseeker/cv/CVFilter';
import { CVCard, CVPlaceholderCard } from '../../../components/jobseeker/cv/CVCard';
import ProfileStrength from '../../../components/jobseeker/cv/ProfileStrength';
import CVExpertReview from '../../../components/jobseeker/cv/CVExpertReview';
import CareerResources from '../../../components/jobseeker/cv/CareerResources';
import cvService from '../../../services/cvService';
import { useNotification } from '../../../contexts/NotificationContext';

const ManageCV = () => {
  const navigate = useNavigate();
  const { success, error, confirm } = useNotification();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCvs();
  }, []);

  const handleDeleteCv = (id, title) => {
    confirm(
      `Bạn có chắc chắn muốn xóa CV "${title}" không? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          const res = await cvService.deleteCv(id);
          if (res.success) {
            setCvs(prev => prev.filter(cv => cv._id !== id));
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

  return (
    <div className="min-h-screen bg-background font-body-md">
      
      <main className="max-w-container-max mx-auto px-gutter py-stack-lg">
        {/* Welcome Section */}
        <CVWelcome />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* CV List - Main Content */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {/* Filter and Stats */}
            <CVFilter totalCount={cvs.length} />

            {/* CV Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
              {loading ? (
                <div className="col-span-full py-10 text-center text-gray-500">Đang tải danh sách CV...</div>
              ) : (
                cvs.map(cv => (
                  <CVCard 
                    key={cv._id} 
                    id={cv._id}
                    title={cv.title}
                    date={new Date(cv.updatedAt).toLocaleDateString('vi-VN')}
                    isActive={cv.status === 'ACTIVE'}
                    image={cv.templateId?.thumbnailUrl || "https://via.placeholder.com/300x400?text=No+Preview"}
                    onDelete={handleDeleteCv}
                    onDownload={handleDownloadPdf}
                  />
                ))
              )}
              
              {/* Create Placeholder */}
              <CVPlaceholderCard />
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
          <span className="material-symbols-outlined">help_center</span>
          <span className="absolute right-full mr-stack-md whitespace-nowrap bg-on-surface text-on-secondary px-3 py-1 rounded text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Support</span>
        </button>
        <button className="bg-primary text-on-secondary shadow-lg p-stack-md rounded-full hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">chat</span>
        </button>
      </div>
    </div>
  );
};

export default ManageCV;
