import React from 'react';

const EditableText = ({ tag: Tag = 'div', html, className, style, onChange, placeholder }) => {
  return (
    <Tag
      className={`outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50 hover:!text-gray-900 focus:border-blue-500 focus:bg-white focus:!text-gray-900 focus:ring-1 focus:ring-blue-500 rounded px-1 transition-all min-h-[1.5em] empty:before:content-[attr(placeholder)] empty:before:text-gray-400 ${className || ''}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: html }}
      placeholder={placeholder}
    />
  );
};

export const renderSection = (section, style, onUpdate, columnContext, layoutCode, isContinuation) => {
  const code = section.sectionCode;
  const items = section.items || [];
  
  const isLeft = columnContext === 'left';
  const headingColor = isLeft ? '#ffffff' : style.themeColorId;
  const textColor = isLeft ? '#f3f4f6' : '#374151';
  const subtextColor = isLeft ? '#d1d5db' : '#6b7280';

  const fSize = style.fontSize || 'medium';
  
  const nameSize = fSize === 'small' ? 'text-[18px] font-bold' : fSize === 'large' ? 'text-[26px] font-bold' : 'text-[22px] font-bold';
  const headingSize = fSize === 'small' ? 'text-[10.5px]' : fSize === 'large' ? 'text-[14.5px]' : 'text-[12.5px]';
  const subHeadingSize = fSize === 'small' ? 'text-[9px]' : fSize === 'large' ? 'text-[13px]' : 'text-[11px]';
  const bodySize = fSize === 'small' ? 'text-[8.5px]' : fSize === 'large' ? 'text-[12px]' : 'text-[10px]';
  const iconSizeClass = fSize === 'small' ? 'text-[9px]' : fSize === 'large' ? 'text-[13px]' : 'text-[11px]';

  const dens = style.density || 'normal';
  const marginClass = dens === 'compact' ? 'mb-2' : dens === 'comfortable' ? 'mb-6' : 'mb-4';
  const itemGapClass = dens === 'compact' ? 'space-y-1' : dens === 'comfortable' ? 'space-y-3.5' : 'space-y-2';

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (!newItems[index]) newItems[index] = {};
    newItems[index][field] = value;
    onUpdate(code, newItems);
  };

  const addItem = (defaultObj = {}) => {
    onUpdate(code, [...items, defaultObj]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(code, newItems);
  };

  const SectionHeader = ({ title }) => {
    if (layoutCode === 'harvard-gsas') return null;
    const tStyle = style.titleStyle || 'underline';
    const borderCol = isLeft ? 'rgba(255,255,255,0.2)' : `${style.themeColorId}40`;
    const displayTitle = title;
    
    if (tStyle === 'underline') {
      return (
        <div className="mb-3">
          <h2 
            className={`${headingSize} font-black uppercase tracking-widest border-b-2 pb-1`}
            style={{ color: headingColor, borderColor: borderCol }}
          >
            {displayTitle}
          </h2>
        </div>
      );
    }
    if (tStyle === 'accent-bg') {
      return (
        <div className="mb-3">
          <h2 
            className={`${headingSize} font-black uppercase tracking-widest px-2 py-1 rounded`}
            style={{ 
              backgroundColor: isLeft ? 'rgba(255,255,255,0.15)' : style.themeColorId, 
              color: '#ffffff' 
            }}
          >
            {displayTitle}
          </h2>
        </div>
      );
    }
    if (tStyle === 'left-border') {
      return (
        <div className="mb-3">
          <h2 
            className={`${headingSize} font-black uppercase tracking-widest pl-2 border-l-4`}
            style={{ 
              color: headingColor, 
              borderColor: isLeft ? '#ffffff' : style.themeColorId 
            }}
          >
            {displayTitle}
          </h2>
        </div>
      );
    }
    // minimal
    return (
      <div className="mb-3">
        <h2 
          className={`${headingSize} font-black uppercase tracking-widest`}
          style={{ color: headingColor }}
        >
          {displayTitle}
        </h2>
      </div>
    );
  };

  switch (code) {
    case 'PROFILE':
      const profile = items[0] || { 
        name: 'HỌ VÀ TÊN', 
        title: 'VỊ TRÍ ỨNG TUYỂN', 
        summary: 'Mục tiêu nghề nghiệp ngắn gọn',
        avatar: ''
      };
      if (layoutCode === 'harvard-classic') {
        return (
          <div className={`${marginClass} flex flex-col gap-2 items-center text-center w-full`}>
            <div className="w-full text-center">
              <EditableText 
                tag="h1" 
                className={`${nameSize} font-black uppercase mb-1 tracking-tight`} 
                style={{ color: headingColor }}
                html={profile.name} 
                onChange={v => updateItem(0, 'name', v)} 
              />
              <EditableText 
                tag="h2" 
                className={`${subHeadingSize} font-extrabold mb-2 uppercase tracking-wider text-gray-500`} 
                html={profile.title} 
                onChange={v => updateItem(0, 'title', v)} 
              />
              <EditableText 
                className={`${bodySize} leading-relaxed max-w-2xl mx-auto`} 
                style={{ color: textColor }}
                html={profile.summary} 
                onChange={v => updateItem(0, 'summary', v)} 
              />
            </div>
          </div>
        );
      }

      if (layoutCode === 'two-col-equal') {
        return (
          <div className={`${marginClass} flex items-center justify-between gap-6 w-full`}>
            <div className="text-left flex-1">
              <EditableText 
                tag="h1" 
                className={`${nameSize} font-extrabold tracking-tight leading-none text-white block`} 
                html={profile.name} 
                onChange={v => updateItem(0, 'name', v)} 
              />
              <EditableText 
                tag="h2" 
                className={`${subHeadingSize} text-white/80 block mt-1 font-bold uppercase tracking-wider`} 
                html={profile.title} 
                onChange={v => updateItem(0, 'title', v)} 
              />
              <EditableText 
                className={`${bodySize} text-white/70 mt-2 block`} 
                html={profile.summary} 
                onChange={v => updateItem(0, 'summary', v)} 
              />
            </div>
            {style.avatarShape !== 'hidden' && (
              <div className="relative group/avatar shrink-0">
                <div 
                  className={`w-16 h-16 bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden relative shadow-inner ${
                    style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                  }`}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[28px] text-white/80">person</span>
                  )}
                  <label 
                    data-html2canvas-ignore="true"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">cloud_upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateItem(0, 'avatar', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        );
      }

      if (layoutCode === 'full-width') {
        return (
          <div className={`${marginClass} flex flex-col items-center justify-center text-center w-full`}>
            {style.avatarShape !== 'hidden' && (
              <div className="relative group/avatar shrink-0 mb-4">
                <div 
                  className={`w-20 h-20 bg-gray-100 border flex items-center justify-center overflow-hidden relative shadow-inner ${
                    style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                  }`}
                  style={{ borderColor: `${style.themeColorId}20` }}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-gray-400">person</span>
                  )}
                  <label 
                    data-html2canvas-ignore="true"
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-white text-[18px]">cloud_upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="sr-only" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateItem(0, 'avatar', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
            <EditableText 
              tag="h1" 
              className={`${nameSize} font-extrabold tracking-tight leading-none block`} 
              style={{ color: style.themeColorId }}
              html={profile.name} 
              onChange={v => updateItem(0, 'name', v)} 
            />
            <EditableText 
              tag="h2" 
              className={`${subHeadingSize} text-gray-500 block mt-1.5 font-bold uppercase tracking-wider`} 
              html={profile.title} 
              onChange={v => updateItem(0, 'title', v)} 
            />
            <EditableText 
              className={`${bodySize} text-gray-600 mt-2 max-w-xl block`} 
              html={profile.summary} 
              onChange={v => updateItem(0, 'summary', v)} 
            />
          </div>
        );
      }

      if (layoutCode === 'left-col') {
        return (
          <div className={`${marginClass} flex flex-col w-full text-left`}>
            <EditableText 
              tag="h1" 
              className={`${nameSize} font-extrabold text-gray-800 tracking-tight leading-none block`} 
              html={profile.name} 
              onChange={v => updateItem(0, 'name', v)} 
            />
            <EditableText 
              tag="h2" 
              className={`${subHeadingSize} font-bold mt-2 uppercase tracking-widest block`} 
              style={{ color: style.themeColorId }}
              html={profile.title} 
              onChange={v => updateItem(0, 'title', v)} 
            />
            <EditableText 
              className={`${bodySize} text-gray-600 mt-3 block`} 
              html={profile.summary} 
              onChange={v => updateItem(0, 'summary', v)} 
            />
          </div>
        );
      }

      return (
        <div className={`${marginClass} flex ${isLeft ? 'flex-col gap-3 items-center text-center' : 'flex-col sm:flex-row gap-4 items-start'}`}>
          {style.avatarShape !== 'hidden' && layoutCode !== 'harvard-classic' && layoutCode !== 'harvard-gsas' && (
            <div className={`relative group/avatar shrink-0 ${isLeft ? 'mx-auto' : 'mx-auto sm:mx-0'}`}>
              <div 
                className={`w-16 h-16 bg-gray-200 border flex items-center justify-center overflow-hidden relative shadow-inner ${
                  style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                }`}
                style={{ borderColor: isLeft ? 'rgba(255,255,255,0.2)' : `${style.themeColorId}20` }}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[32px]" style={{ color: isLeft ? '#ffffffaa' : '#9ca3af' }}>person</span>
                )}
                {/* Invisible file input trigger */}
                <label 
                  data-html2canvas-ignore="true"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">cloud_upload</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          updateItem(0, 'avatar', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
          <div className={`flex-1 w-full ${isLeft ? 'text-center' : 'text-left'}`}>
            <EditableText 
              tag="h1" 
              className={`${nameSize} font-black uppercase mb-1 tracking-tight`} 
              style={{ color: headingColor }}
              html={profile.name} 
              onChange={v => updateItem(0, 'name', v)} 
            />
            <EditableText 
              tag="h2" 
              className={`${subHeadingSize} font-extrabold mb-2 uppercase tracking-wider`} 
              style={{ color: isLeft ? 'rgba(255,255,255,0.85)' : style.themeColorId }}
              html={profile.title} 
              onChange={v => updateItem(0, 'title', v)} 
            />
            <EditableText 
              className={`${bodySize} leading-relaxed`} 
              style={{ color: textColor }}
              html={profile.summary} 
              onChange={v => updateItem(0, 'summary', v)} 
            />
          </div>
        </div>
      );

    case 'CONTACT':
      const contact = items[0] || { phone: '0123 456 789', email: 'email@example.com', address: 'Hà Nội, Việt Nam' };
      if (layoutCode === 'harvard-classic') {
        return (
          <div className={marginClass}>
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] font-medium font-sans">
              {contact.address && (
                <div className="flex items-center gap-1">
                  <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>location_on</span>
                  <EditableText 
                    html={contact.address} 
                    onChange={v => updateItem(0, 'address', v)} 
                    placeholder="Địa chỉ"
                    className="break-words"
                  />
                </div>
              )}
              {(contact.address && contact.phone) && <span className="text-gray-400">|</span>}
              {contact.phone && (
                <div className="flex items-center gap-1">
                  <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>phone</span>
                  <EditableText 
                    html={contact.phone} 
                    onChange={v => updateItem(0, 'phone', v)} 
                    placeholder="Điện thoại"
                    className="break-words"
                  />
                </div>
              )}
              {(contact.phone && contact.email) && <span className="text-gray-400">|</span>}
              {contact.email && (
                <div className="flex items-center gap-1">
                  <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>mail</span>
                  <EditableText 
                    html={contact.email} 
                    onChange={v => updateItem(0, 'email', v)} 
                    placeholder="Email"
                    className="break-all"
                  />
                </div>
              )}
            </div>
          </div>
        );
      }
      return (
        <div className={marginClass}>
          <SectionHeader title="Liên Hệ" />
          <div className={`space-y-1.5 ${bodySize}`} style={{ color: textColor }}>
            <div className="flex items-center gap-1.5 py-0.5">
              <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>phone</span>
              <EditableText 
                html={contact.phone} 
                onChange={v => updateItem(0, 'phone', v)} 
                placeholder="Điện thoại"
                className="flex-1 break-words"
              />
            </div>
            <div className="flex items-center gap-1.5 py-0.5">
              <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>mail</span>
              <EditableText 
                html={contact.email} 
                onChange={v => updateItem(0, 'email', v)} 
                placeholder="Email"
                className="flex-1 break-all"
              />
            </div>
            <div className="flex items-center gap-1.5 py-0.5">
              <span className={`material-symbols-outlined ${iconSizeClass} opacity-75 shrink-0`}>location_on</span>
              <EditableText 
                html={contact.address} 
                onChange={v => updateItem(0, 'address', v)} 
                placeholder="Địa chỉ"
                className="flex-1 break-words"
              />
            </div>
          </div>
        </div>
      );

    case 'OBJECTIVE':
      const objective = items[0] || { summary: 'Nhập mục tiêu nghề nghiệp của bạn...' };
      return (
        <div className={marginClass}>
          {layoutCode !== 'harvard-gsas' && <SectionHeader title="Mục Tiêu Nghề Nghiệp" />}
          <EditableText 
            className={`${bodySize} leading-relaxed`} 
            style={{ color: textColor }}
            html={objective.summary} 
            onChange={v => updateItem(0, 'summary', v)} 
            placeholder="Nhập mục tiêu nghề nghiệp..."
          />
        </div>
      );

    case 'EXPERIENCE':
      return (
        <div className={marginClass}>
          <SectionHeader title="Kinh Nghiệm" />
          <div className={itemGapClass}>
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className={`relative group/item ${ (layoutCode === 'harvard-classic' || layoutCode === 'harvard-gsas') ? '' : 'border-l-2 pl-3' }`} style={{ borderColor: isLeft ? 'rgba(255,255,255,0.2)' : `${style.themeColorId}20` }}>
                  <div className="flex justify-between items-baseline gap-2 flex-wrap mb-0.5">
                    <EditableText tag="h3" className={`font-bold ${subHeadingSize}`} style={{ color: headingColor }} html={item.title || 'Vị trí công việc'} onChange={v => updateItem(i, 'title', v)} />
                    <EditableText className={`${bodySize} font-medium italic`} style={{ color: subtextColor }} html={item.date || 'MM/YYYY - MM/YYYY'} onChange={v => updateItem(i, 'date', v)} />
                  </div>
                  <EditableText className={`${bodySize} font-semibold mb-1`} style={{ color: isLeft ? 'rgba(255,255,255,0.9)' : style.themeColorId }} html={item.company || 'Tên công ty'} onChange={v => updateItem(i, 'company', v)} />
                  <EditableText className={`${bodySize} leading-relaxed`} style={{ color: textColor }} html={item.description || '- Mô tả công việc...'} onChange={v => updateItem(i, 'description', v)} />
                  
                  {/* Delete button */}
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ company: 'Tên Công Ty', date: 'Thời gian', title: 'Chức danh', description: 'Mô tả công việc' })} 
                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm kinh nghiệm
              </button>
            )}
          </div>
        </div>
      );

    case 'EDUCATION':
      return (
        <div className={marginClass}>
          <SectionHeader title="Học Vấn" />
          <div className={itemGapClass}>
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className="relative group/item">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap mb-0.5">
                    <EditableText tag="h3" className={`font-bold ${subHeadingSize}`} style={{ color: headingColor }} html={item.school || 'Tên trường'} onChange={v => updateItem(i, 'school', v)} />
                    <EditableText className={`${bodySize} font-medium italic`} style={{ color: subtextColor }} html={item.date || 'MM/YYYY - MM/YYYY'} onChange={v => updateItem(i, 'date', v)} />
                  </div>
                  <div className="flex justify-between items-center gap-2 flex-wrap mb-1">
                    <EditableText className={`${bodySize} font-semibold`} style={{ color: textColor }} html={item.major || 'Chuyên ngành'} onChange={v => updateItem(i, 'major', v)} />
                    <EditableText className={`${bodySize}`} style={{ color: subtextColor }} html={item.gpa || 'GPA: X.X'} onChange={v => updateItem(i, 'gpa', v)} />
                  </div>
                  
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ school: 'Tên Trường', date: 'Thời gian', major: 'Chuyên ngành', gpa: 'GPA' })} 
                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm học văn
              </button>
            )}
          </div>
        </div>
      );

    case 'SKILLS':
      return (
        <div className={marginClass}>
          <SectionHeader title="Kỹ Năng" />
          <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className="relative group/item">
                  <EditableText 
                    className={`px-2 py-0.5 rounded ${bodySize} font-medium border transition-colors ${
                      isLeft 
                        ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' 
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                    }`} 
                    style={{ color: textColor }} 
                    html={item.name || 'Kỹ năng'} 
                    onChange={v => updateItem(i, 'name', v)} 
                  />
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover/item:opacity-100 text-[10px] shadow transition-opacity"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ name: 'Kỹ năng mới' })} 
                className={`px-2 py-0.5 rounded ${bodySize} border border-dashed flex items-center gap-0.5 ${isLeft ? 'border-white/40 text-white/70 hover:bg-white/5' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
              >
                + Thêm
              </button>
            )}
          </div>
        </div>
      );

    case 'PROJECTS':
      return (
        <div className={marginClass}>
          <SectionHeader title="Dự Án" />
          <div className={itemGapClass}>
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className={`relative group/item ${ (layoutCode === 'harvard-classic' || layoutCode === 'harvard-gsas') ? '' : 'border-l-2 pl-3' }`} style={{ borderColor: isLeft ? 'rgba(255,255,255,0.2)' : `${style.themeColorId}20` }}>
                  <div className="flex justify-between items-baseline gap-2 flex-wrap mb-0.5">
                    <EditableText tag="h3" className={`font-bold ${subHeadingSize}`} style={{ color: headingColor }} html={item.name || 'Tên dự án'} onChange={v => updateItem(i, 'name', v)} />
                    <EditableText className={`${bodySize} font-medium italic`} style={{ color: subtextColor }} html={item.date || 'Thời gian'} onChange={v => updateItem(i, 'date', v)} />
                  </div>
                  <EditableText className={`${bodySize} font-semibold mb-1`} style={{ color: isLeft ? 'rgba(255,255,255,0.9)' : style.themeColorId }} html={item.role || 'Vai trò'} onChange={v => updateItem(i, 'role', v)} />
                  <EditableText className={`${bodySize} leading-relaxed`} style={{ color: textColor }} html={item.description || '- Mô tả dự án...'} onChange={v => updateItem(i, 'description', v)} />
                  
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ name: 'Tên Dự Án', date: 'Thời gian', role: 'Vai trò', description: 'Mô tả dự án' })} 
                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm dự án
              </button>
            )}
          </div>
        </div>
      );

    case 'CERTIFICATES':
      return (
        <div className={marginClass}>
          <SectionHeader title="Chứng Chỉ" />
          <div className={itemGapClass}>
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className="relative group/item flex justify-between items-center py-0.5">
                  <EditableText className={`font-semibold ${bodySize}`} style={{ color: textColor }} html={item.name || 'Tên chứng chỉ'} onChange={v => updateItem(i, 'name', v)} />
                  <EditableText className={`${bodySize} font-medium italic`} style={{ color: subtextColor }} html={item.date || 'Thời gian'} onChange={v => updateItem(i, 'date', v)} />
                  
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -left-6 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ name: 'Tên chứng chỉ', date: 'Thời gian' })} 
                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm chứng chỉ
              </button>
            )}
          </div>
        </div>
      );

    case 'ACTIVITIES':
      return (
        <div className={marginClass}>
          <SectionHeader title="Hoạt Động" />
          <div className={itemGapClass}>
            {items.map((item, i) => {
              if (section.renderItemRange) {
                const [start, end] = section.renderItemRange;
                if (i < start || i >= end) return null;
              }
              return (
                <div key={i} className="relative group/item">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap mb-0.5">
                    <EditableText tag="h3" className={`font-bold ${subHeadingSize}`} style={{ color: headingColor }} html={item.name || 'Tên hoạt động'} onChange={v => updateItem(i, 'name', v)} />
                    <EditableText className={`${bodySize} font-medium italic`} style={{ color: subtextColor }} html={item.date || 'Thời gian'} onChange={v => updateItem(i, 'date', v)} />
                  </div>
                  <EditableText className={`${bodySize} leading-relaxed`} style={{ color: textColor }} html={item.description || '- Mô tả hoạt động...'} onChange={v => updateItem(i, 'description', v)} />
                  
                  <button 
                    data-html2canvas-ignore="true"
                    onClick={() => removeItem(i)} 
                    className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              );
            })}
            {(!section.renderItemRange || section.renderItemRange[1] === items.length) && (
              <button 
                data-html2canvas-ignore="true"
                onClick={() => addItem({ name: 'Tên hoạt động', date: 'Thời gian', description: 'Mô tả hoạt động' })} 
                className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Thêm hoạt động
              </button>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="mb-6 border-dashed border-2 p-4 text-center text-gray-400">
          Section {code}
        </div>
      );
  }
};
