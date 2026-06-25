import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const CVWelcome = () => {
  const navigate = useNavigate();
  return (
    <section className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-background mb-stack-sm">Quản Lý CV Của Bạn</h1>
        <p className="text-on-surface-variant font-body-md">Tạo và tối ưu nhiều CV cho các hướng nghề nghiệp khác nhau.</p>
      </div>
      <button
        onClick={() => navigate('/cv-templates/gallery')}
        className="flex items-center gap-stack-sm bg-primary text-on-secondary px-6 py-3 rounded-lg font-bold shadow-md hover:bg-primary-container transition-all active:scale-95"
      >
        <PlusCircle className="w-5 h-5" />
        <span>Tạo CV Mới</span>
      </button>
    </section>
  );
};

export default CVWelcome;
