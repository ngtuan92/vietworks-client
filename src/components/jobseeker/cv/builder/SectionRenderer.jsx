import React from 'react';

// Common editable text component
const EditableText = ({ tag: Tag = 'div', html, className, style, onChange, placeholder }) => {
  return (
    <Tag
      className={`outline-none border border-transparent hover:border-gray-300 hover:bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 transition-all min-h-[1.5em] empty:before:content-[attr(placeholder)] empty:before:text-gray-400 ${className || ''}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: html }}
      placeholder={placeholder}
    />
  );
};

export const renderSection = (section, style, onUpdate, columnContext) => {
  const code = section.sectionCode;
  const items = section.items || [];
  
  // Base styles based on column context
  const isLeft = columnContext === 'left';
  const headingColor = isLeft ? '#ffffff' : style.themeColorId;
  const textColor = isLeft ? '#f3f4f6' : '#374151';
  const subtextColor = isLeft ? '#d1d5db' : '#6b7280';

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

  const SectionHeader = ({ title }) => (
    <div className="mb-4 relative group/header">
      <h2 
        className="text-lg font-black uppercase tracking-widest border-b-2 pb-1" 
        style={{ color: headingColor, borderColor: isLeft ? 'rgba(255,255,255,0.2)' : `${style.themeColorId}40` }}
      >
        {title}
      </h2>
    </div>
  );

  switch (code) {
    case 'PROFILE':
      const profile = items[0] || { name: 'HỌ VÀ TÊN', title: 'VỊ TRÍ ỨNG TUYỂN', summary: 'Mục tiêu nghề nghiệp ngắn gọn' };
      return (
        <div className="mb-6">
          <EditableText 
            tag="h1" 
            className="text-3xl font-black uppercase mb-1" 
            style={{ color: headingColor }}
            html={profile.name} 
            onChange={v => updateItem(0, 'name', v)} 
          />
          <EditableText 
            tag="h2" 
            className="text-lg font-bold mb-4 uppercase tracking-wider" 
            style={{ color: isLeft ? 'rgba(255,255,255,0.8)' : style.themeColorId }}
            html={profile.title} 
            onChange={v => updateItem(0, 'title', v)} 
          />
          <EditableText 
            className="text-sm leading-relaxed" 
            style={{ color: textColor }}
            html={profile.summary} 
            onChange={v => updateItem(0, 'summary', v)} 
          />
        </div>
      );

    case 'CONTACT':
      const contact = items[0] || { phone: '0123 456 789', email: 'email@example.com', address: 'Hà Nội, Việt Nam' };
      return (
        <div className="mb-6">
          <SectionHeader title="Liên Hệ" />
          <div className="space-y-2 text-sm" style={{ color: textColor }}>
            {['phone', 'email', 'address'].map(field => (
              <EditableText 
                key={field}
                html={contact[field]} 
                onChange={v => updateItem(0, field, v)} 
                placeholder={`Nhập ${field}`}
              />
            ))}
          </div>
        </div>
      );

    case 'EXPERIENCE':
      return (
        <div className="mb-6">
          <SectionHeader title="Kinh Nghiệm" />
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="relative group/item">
                <div className="flex justify-between items-baseline mb-1">
                  <EditableText tag="h3" className="font-bold text-base" style={{ color: headingColor }} html={item.title || 'Vị trí công việc'} onChange={v => updateItem(i, 'title', v)} />
                  <EditableText className="text-xs font-semibold" style={{ color: subtextColor }} html={item.date || 'MM/YYYY - MM/YYYY'} onChange={v => updateItem(i, 'date', v)} />
                </div>
                <EditableText className="text-sm font-semibold mb-1" style={{ color: headingColor }} html={item.company || 'Tên công ty'} onChange={v => updateItem(i, 'company', v)} />
                <EditableText className="text-sm leading-relaxed" style={{ color: textColor }} html={item.description || '- Mô tả công việc...'} onChange={v => updateItem(i, 'description', v)} />
                
                {/* Delete button */}
                <button onClick={() => removeItem(i)} className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100"><span className="material-symbols-outlined text-[14px]">delete</span></button>
              </div>
            ))}
            <button onClick={() => addItem()} className="text-xs text-blue-500 hover:underline">+ Thêm kinh nghiệm</button>
          </div>
        </div>
      );

    case 'EDUCATION':
      return (
        <div className="mb-6">
          <SectionHeader title="Học Vấn" />
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="relative group/item">
                <div className="flex justify-between items-baseline mb-1">
                  <EditableText tag="h3" className="font-bold text-base" style={{ color: headingColor }} html={item.school || 'Tên trường'} onChange={v => updateItem(i, 'school', v)} />
                  <EditableText className="text-xs font-semibold" style={{ color: subtextColor }} html={item.date || 'MM/YYYY - MM/YYYY'} onChange={v => updateItem(i, 'date', v)} />
                </div>
                <EditableText className="text-sm font-semibold mb-1" style={{ color: headingColor }} html={item.major || 'Chuyên ngành'} onChange={v => updateItem(i, 'major', v)} />
                <EditableText className="text-sm" style={{ color: textColor }} html={item.gpa || 'GPA: X.X'} onChange={v => updateItem(i, 'gpa', v)} />
                
                <button onClick={() => removeItem(i)} className="absolute -left-6 top-1 text-red-500 opacity-0 group-hover/item:opacity-100"><span className="material-symbols-outlined text-[14px]">delete</span></button>
              </div>
            ))}
            <button onClick={() => addItem()} className="text-xs text-blue-500 hover:underline">+ Thêm học vấn</button>
          </div>
        </div>
      );

    case 'SKILLS':
      return (
        <div className="mb-6">
          <SectionHeader title="Kỹ Năng" />
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <div key={i} className="relative group/item">
                <EditableText 
                  className={`px-3 py-1 rounded text-sm font-semibold ${isLeft ? 'bg-white/10' : 'bg-gray-100'}`} 
                  style={{ color: textColor }} 
                  html={item.name || 'Kỹ năng mới'} 
                  onChange={v => updateItem(i, 'name', v)} 
                />
                <button onClick={() => removeItem(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover/item:opacity-100 text-[10px]">x</button>
              </div>
            ))}
            <button onClick={() => addItem()} className={`px-3 py-1 rounded text-sm border border-dashed ${isLeft ? 'border-white/50 text-white/80' : 'border-gray-400 text-gray-500'}`}>+ Thêm</button>
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
