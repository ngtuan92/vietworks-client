import React from 'react';
import { LayoutDashboard, Trash2, HelpCircle } from 'lucide-react';

const sectionNames = {
  'PROFILE': 'Giới thiệu bản thân',
  'CONTACT': 'Thông tin liên hệ',
  'EDUCATION': 'Học vấn',
  'EXPERIENCE': 'Kinh nghiệm làm việc',
  'OBJECTIVE': 'Mục tiêu nghề nghiệp',
  'PROJECTS': 'Dự án thực tế',
  'SKILLS': 'Kỹ năng chuyên môn',
  'LANGUAGES': 'Ngoại ngữ',
  'CERTIFICATES': 'Chứng chỉ',
  'CERTIFICATIONS': 'Chứng chỉ & Giải thưởng',
  'ACTIVITIES': 'Hoạt động ngoại khóa',
  'HOBBIES': 'Sở thích & Hoạt động',
  'REFERENCES': 'Người tham chiếu',
  'AWARDS': 'Giải thưởng',
};

export const BuilderLeftSidebar = ({ sections = [], setSections, saveCvConfig, style }) => {
  const handleToggleSection = (sectionCode) => {
    if (!sections || !setSections || !saveCvConfig) return;
    const updated = sections.map(sec =>
      sec.sectionCode === sectionCode ? { ...sec, isVisible: sec.isVisible === false ? true : false } : sec
    );
    setSections(updated);
    saveCvConfig(updated, style);
  };

  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-100px)] sticky top-24 shrink-0 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Cấu trúc CV</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
        <p className="text-[11px] text-slate-500 mb-2 italic">Bật / Tắt trạng thái hiển thị của các phần nội dung trong CV. Kéo thả bên khung xem trước để thay đổi vị trí.</p>
        
        {sections.map((sec) => (
          <div 
            key={sec.sectionCode} 
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-primary/30 transition-colors shadow-sm"
          >
            <div className="flex flex-col pr-2 overflow-hidden">
              <span className="text-sm font-bold text-slate-700 leading-tight truncate">
                {sectionNames[sec.sectionCode] || sec.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                {sec.sectionCode}
              </span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input 
                type="checkbox" 
                checked={sec.isVisible !== false}
                onChange={() => handleToggleSection(sec.sectionCode)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
