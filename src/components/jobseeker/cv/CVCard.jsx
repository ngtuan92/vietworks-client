import { useNavigate } from 'react-router-dom';

export const CVCard = ({ id, title, date, isActive, image }) => {
  const navigate = useNavigate();
  return (
    <div className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-surface-container overflow-hidden">
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
        <div className="flex justify-between items-start mb-base">
          <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
          <div className="flex gap-stack-sm">
            <button 
              onClick={() => navigate(`/cv-builder/${id}`)}
              className="p-stack-sm text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button className="p-stack-sm text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        <p className="text-on-surface-variant font-body-sm mb-stack-md">Cập nhật: {date}</p>
        <div className="flex gap-stack-sm">
          <button className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary-fixed transition-colors text-body-sm">Xem trước</button>
          <button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
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
