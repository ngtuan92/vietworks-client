import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Crown, LayoutTemplate, Palette, SearchX } from 'lucide-react';
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
      } catch (err) {
        console.error('Lỗi tải dữ liệu', err);
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
    <div className="bg-slate-50 min-h-screen font-body-md flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-12 px-6 border-b border-slate-800">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Glowing Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700 z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
            Thư Viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mẫu CV Đỉnh Cao</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Thu hút sự chú ý của nhà tuyển dụng ngay từ cái nhìn đầu tiên với các mẫu CV chuẩn ATS, thiết kế thanh lịch và hiện đại.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full -mt-8 relative z-10">
        {/* Filters */}
        <div className="flex flex-nowrap md:flex-wrap justify-center gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar mb-10 w-full items-center">
          <button 
            onClick={() => setSelectedGroup('all')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 ${
              selectedGroup === 'all' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Tất cả mẫu
          </button>
          {careerGroups.map(group => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group._id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                selectedGroup === group._id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                <div className="h-72 bg-slate-200"></div>
                <div className="p-5">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : templates.length > 0 ? (
            templates.map((tpl, idx) => (
              <div 
                key={tpl._id} 
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                
                <div className="relative h-72 bg-slate-100 overflow-hidden p-4 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  {tpl.previewImageUrl ? (
                    <img 
                      src={tpl.previewImageUrl} 
                      alt={tpl.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Palette className="w-8 h-8 opacity-50" />
                      <span className="text-sm font-medium">Chưa có ảnh</span>
                    </div>
                  )}
                  
                  {/* Glassmorphism Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => handleUseTemplate(tpl._id)}
                      className="flex items-center gap-2 bg-white text-blue-600 font-extrabold py-3 px-6 rounded-xl hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-blue-600/50"
                    >
                      <Wand2 className="w-5 h-5" />
                      Dùng mẫu này
                    </button>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col border-t border-slate-50 group-hover:bg-blue-50/10 transition-colors">
                  <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{tpl.name}</h3>
                  <p className="text-sm font-medium text-slate-500 flex-1">{tpl.careerGroupId?.name || 'Đa ngành nghề'}</p>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <SearchX className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy mẫu CV</h3>
              <p className="text-slate-500 max-w-md">Hiện tại chúng tôi chưa có mẫu CV nào thuộc ngành nghề này. Vui lòng chọn ngành nghề khác hoặc xem toàn bộ mẫu.</p>
              <button 
                onClick={() => setSelectedGroup('all')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TemplateGallery;
