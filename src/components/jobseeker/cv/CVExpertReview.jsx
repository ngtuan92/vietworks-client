import React, { useState } from 'react';
import AICvReviewEngine from './AICvReviewEngine';

const CVExpertReview = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#003f87] to-[#002554] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      {/* Background patterns */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-400 animate-pulse">psychology</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">AI Core Technology</span>
          </div>
          <h3 className="text-xl font-bold font-sans tracking-tight mb-2">Đánh Giá CV Chuyên Sâu</h3>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
            Nhận phản hồi ATS tự động từ AI để phát hiện lỗi sai, đo lường điểm số tương thích và tạo bộ câu hỏi chuẩn bị phỏng vấn.
          </p>
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-white text-[#003f87] hover:bg-blue-50 font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group/btn active:scale-98 cursor-pointer"
        >
          <span>Bắt đầu chấm điểm CV</span>
          <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>

      {/* MODAL WRAPPER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <AICvReviewEngine onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CVExpertReview;
