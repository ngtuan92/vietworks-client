import React from 'react';

const A4_PAGE_WIDTH_PX = 794;
const A4_PAGE_HEIGHT_PX = 1123;

export const CVPageFrame = ({ children, className = 'cv-page shadow-xl', style }) => (
  <div
    className={`${className} bg-white flex flex-col relative overflow-hidden pb-[20px] flex-shrink-0`}
    style={{
      width: `${A4_PAGE_WIDTH_PX}px`,
      height: `${A4_PAGE_HEIGHT_PX}px`,
      boxSizing: 'border-box',
      ...style
    }}
  >
    {children}
    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-white px-12 border-t border-gray-100 flex justify-end items-center text-[10px] text-gray-400 font-medium select-none pointer-events-none z-20">
      <span>© VietWorks</span>
    </div>
  </div>
);

export const renderSectionTitle = (sectionCode) => (
  sectionCode === 'EDUCATION' ? 'HỌC VẤN' :
    sectionCode === 'EXPERIENCE' ? 'KINH NGHIỆM' :
      sectionCode === 'SKILLS' ? 'KỸ NĂNG' :
        sectionCode === 'OBJECTIVE' ? 'MỤC TIÊU' :
          sectionCode === 'PROJECTS' ? 'DỰ ÁN' :
            sectionCode === 'CERTIFICATES' ? 'CHỨNG CHỈ' :
              sectionCode === 'ACTIVITIES' ? 'HOẠT ĐỘNG' : sectionCode
);

