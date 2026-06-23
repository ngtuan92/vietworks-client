import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cvService from '../../../services/cvService';
import adminService from '../../../services/adminService';
import useAuth from '../../../hooks/useAuth';
import { useNotification } from '../../../contexts/NotificationContext';

const TemplateGallery = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { confirm, error } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [careerGroups, setCareerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsRes, templatesRes] = await Promise.all([
          adminService.getCareerGroups(),
          cvService.getActiveTemplates(selectedGroup !== 'all' ? { careerGroupId: selectedGroup } : {})
        ]);
        
        if (groupsRes.success) setCareerGroups(groupsRes.data);
        if (templatesRes.success) setTemplates(templatesRes.data);
      } catch (error) {
        console.error('Lỗi tải dữ liệu', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGroup]);

  const handleUseTemplate = async (templateId) => {
    if (!isAuthenticated) {
      confirm(
        'Bạn cần đăng nhập để tạo CV từ mẫu này. Vui lòng đăng nhập để tiếp tục.',
        () => {
          navigate('/login', { state: { from: '/cv-templates/gallery' } });
        },
        null,
        'Yêu cầu đăng nhập',
        'Đăng nhập',
        'Hủy'
      );
      return;
    }

    try {
      const response = await cvService.createCv({
        templateId,
        title: 'CV Chưa Đặt Tên'
      });
      if (response.success) {
        navigate(`/cv-builder/${response.data._id}`);
      }
    } catch (err) {
      error('Có lỗi xảy ra khi tạo CV mới');
    }
  };

  return (
    <div className="bg-surface font-body-md flex flex-col">
      <main className="flex-1 max-w-container-max mx-auto px-gutter py-stack-lg w-full">
        <div className="text-center mb-stack-xl">
          <h1 className="text-display-sm font-display text-on-surface mb-stack-sm">
            Thư Viện Mẫu CV
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Chọn mẫu CV phù hợp với ngành nghề và phong cách của bạn để bắt đầu hành trình tìm việc mơ ước.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-stack-sm justify-center mb-stack-xl">
          <button 
            onClick={() => setSelectedGroup('all')}
            className={`px-4 py-2 rounded-full font-bold transition-all ${
              selectedGroup === 'all' 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Tất cả
          </button>
          {careerGroups.map(group => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group._id)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                selectedGroup === group._id
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-lg">
          {loading ? (
            <div className="col-span-full py-20 text-center text-on-surface-variant">Đang tải danh sách mẫu...</div>
          ) : templates.length > 0 ? (
            templates.map(tpl => (
              <div key={tpl._id} className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
                <div className="relative h-64 bg-surface-container overflow-hidden p-stack-sm">
                  {tpl.previewImageUrl ? (
                    <img 
                      src={tpl.previewImageUrl} 
                      alt={tpl.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high rounded flex items-center justify-center text-on-surface-variant">
                      Chưa có ảnh đại diện
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => handleUseTemplate(tpl._id)}
                      className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      Dùng Mẫu Này
                    </button>
                  </div>
                </div>
                <div className="p-stack-md flex-1 flex flex-col">
                  <h3 className="font-headline-sm text-on-surface mb-1">{tpl.name}</h3>
                  <p className="text-body-sm text-on-surface-variant flex-1">{tpl.careerGroupId?.name || 'Chung'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-on-surface-variant">
              Không tìm thấy mẫu CV nào cho ngành nghề này.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TemplateGallery;
