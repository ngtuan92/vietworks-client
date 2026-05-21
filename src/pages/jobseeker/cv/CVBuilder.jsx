import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import cvService from '../../../services/cvService';
import { useNotification } from '../../../contexts/NotificationContext';

// Sortable Item wrapper
import { SortableItem } from '../../../components/jobseeker/cv/builder/SortableItem';
// Toolbar
import { BuilderToolbar } from '../../../components/jobseeker/cv/builder/BuilderToolbar';
// Sections
import { renderSection } from '../../../components/jobseeker/cv/builder/SectionRenderer';

const CVBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cvRef = useRef(null);
  const { error: showError } = useNotification();

  const [cvData, setCvData] = useState(null);
  const [sections, setSections] = useState([]);
  const [style, setStyle] = useState({
    fontId: 'Inter',
    themeColorId: '#0056b3',
    fontSize: 'medium',
    density: 'normal',
    titleStyle: 'underline',
    avatarShape: 'circle'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchCv = async () => {
      try {
        setLoading(true);
        const res = await cvService.getCvById(id);
        if (res.success) {
          setCvData(res.data);
          // sort sections by order initially
          const sorted = [...res.data.sections].sort((a, b) => a.order - b.order);
          setSections(sorted);
          setStyle({
            fontId: res.data.style?.fontId || 'Inter',
            themeColorId: res.data.style?.themeColorId || '#0056b3',
            fontSize: res.data.style?.fontSize || 'medium',
            density: res.data.style?.density || 'normal',
            titleStyle: res.data.style?.titleStyle || 'underline',
            avatarShape: res.data.style?.avatarShape || 'circle'
          });
        }
      } catch (err) {
        console.error(err);
        showError('Không thể tải dữ liệu CV');
        navigate('/manage-cv');
      } finally {
        setLoading(false);
      }
    };
    fetchCv();
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && cvData && cvRef.current) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('download') === 'true') {
        const triggerExport = async () => {
          await new Promise(resolve => setTimeout(resolve, 800));
          await handleExportPDF();
          navigate('/manage-cv');
        };
        triggerExport();
      }
    }
  }, [loading, cvData, id, navigate]);

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.sectionCode === active.id);
        const newIndex = items.findIndex((item) => item.sectionCode === over.id);

        // Ensure they are in the same column
        if (items[oldIndex].column === items[newIndex].column) {
          const newArray = arrayMove(items, oldIndex, newIndex);
          // update orders
          const updatedArray = newArray.map((item, index) => ({ ...item, order: index + 1 }));

          // Auto-save
          saveCvConfig(updatedArray, style);

          return updatedArray;
        }
        return items;
      });
    }
  };

  const handleStyleChange = (key, value) => {
    const newStyle = { ...style, [key]: value };
    setStyle(newStyle);
    saveCvConfig(sections, newStyle);
  };

  const handleTemplateChange = async (newTemplate) => {
    try {
      setSaving(true);
      const res = await cvService.updateCv(id, { templateId: newTemplate._id });
      if (res.success) {
        setCvData(prev => ({
          ...prev,
          templateId: newTemplate
        }));
      }
    } catch (err) {
      console.error(err);
      showError('Không thể đổi mẫu thiết kế CV');
    } finally {
      setSaving(false);
    }
  };

  const handleSectionContentUpdate = (sectionCode, newContent) => {
    const updatedSections = sections.map(sec =>
      sec.sectionCode === sectionCode ? { ...sec, items: newContent } : sec
    );
    setSections(updatedSections);
    saveCvConfig(updatedSections, style);
  };

  const saveCvConfig = async (currentSections, currentStyle) => {
    try {
      setSaving(true);
      await cvService.updateCv(id, {
        sections: currentSections,
        style: currentStyle
      });
    } catch (error) {
      console.error('Lỗi tự động lưu', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!cvRef.current) return;
    try {
      setSaving(true);
      // html2canvas-pro: fork hỗ trợ oklab/oklch natively (Tailwind v4 compatible)
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cvData?.title || 'CV'}.pdf`);
    } catch (err) {
      showError('Có lỗi khi xuất PDF');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-body-md bg-surface">Đang tải Canvas CV...</div>;

  const selectedLayout = cvData?.templateId?.templateCode || 'left-col';

  const leftSections = sections.filter(s => s.column === 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);
  const rightSections = sections.filter(s => s.column !== 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);

  const headerLeftSections = sections.filter(s => s.sectionCode !== 'PROFILE' && s.sectionCode !== 'CONTACT' && s.isVisible !== false);
  const contactSection = sections.find(s => s.sectionCode === 'CONTACT');
  const profileSection = sections.find(s => s.sectionCode === 'PROFILE');

  // Mapped font name mapping
  const fontMapping = {
    'Inter': 'Inter, sans-serif',
    'Roboto': 'Roboto, sans-serif',
    'Outfit': 'Outfit, sans-serif',
    'Montserrat': 'Montserrat, sans-serif',
    'Poppins': 'Poppins, sans-serif',
    'Open Sans': 'Open Sans, sans-serif',
    'Lora': 'Lora, serif',
    'Lato': 'Lato, sans-serif',
    'Playfair Display': 'Playfair Display, serif',
    'Fira Code': 'monospace'
  };

  const queryParams = new URLSearchParams(window.location.search);
  const isAutoDownloading = queryParams.get('download') === 'true';

  return (
    <div className="min-h-screen bg-slate-50 font-body-md flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-7xl mx-auto w-full relative">
      {/* Auto-downloading PDF Overlay */}
      {isAutoDownloading && (
        <div className="fixed inset-0 bg-[#f9fafb] z-[9999] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-t-[#0056b3] border-gray-200 rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Đang xuất bản file PDF của bạn...</h2>
          <p className="text-sm text-gray-500">Quá trình này có thể mất vài giây để đảm bảo độ sắc nét cao nhất.</p>
        </div>
      )}
      {/* Sidebar Toolbar */}
      <BuilderToolbar
        style={style}
        onStyleChange={handleStyleChange}
        onExport={handleExportPDF}
        isSaving={saving}
        navigateBack={() => navigate('/manage-cv')}
        sections={sections}
        setSections={setSections}
        saveCvConfig={saveCvConfig}
        currentTemplateId={cvData?.templateId?._id}
        onTemplateChange={handleTemplateChange}
      />

      {/* Main Canvas Area */}
      <div className="flex-grow flex justify-center bg-transparent relative">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {/* A4 Paper scale */}
          <div
            ref={cvRef}
            className="bg-white shadow-xl flex flex-col relative"
            style={{
              width: '210mm',
              minHeight: '297mm',
              fontFamily: fontMapping[style.fontId] || 'sans-serif',
              color: '#374151'
            }}
          >
            {/* Left Column Layout */}
            {selectedLayout === 'left-col' && (
              <div className="flex-1 flex w-full h-full">
                {/* Left Sidebar */}
                <div
                  style={{ backgroundColor: style.themeColorId }}
                  className="w-[35%] p-6 text-white flex flex-col gap-6"
                >
                  {/* Avatar in Left Sidebar */}
                  {style.avatarShape !== 'hidden' && (
                    <div className="px-5 pt-4 pb-2 text-center shrink-0">
                      <div 
                        className={`relative group/avatar w-20 h-20 mx-auto bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden relative shadow-inner ${
                          style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                        }`}
                      >
                        {profileSection?.items[0]?.avatar ? (
                          <img src={profileSection.items[0].avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[36px] text-white/70">person</span>
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
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
                                  const updatedItems = [...(profileSection.items || [])];
                                  if (!updatedItems[0]) updatedItems[0] = {};
                                  updatedItems[0].avatar = reader.result;
                                  handleSectionContentUpdate('PROFILE', updatedItems);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <SortableContext items={leftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {leftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'left', selectedLayout)}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>

                {/* Right Main area */}
                <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                  {/* Header Box */}
                  {profileSection && (
                    <div className="border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}

                  <div className="space-y-6">
                    <SortableContext items={rightSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                      {rightSections.map(sec => (
                        <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                          {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </div>
                </div>
              </div>
            )}

            {/* Header Left Layout */}
            {selectedLayout === 'header-left' && (
              <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full h-full">
                {/* Header block */}
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}30` }}>
                  {profileSection && (
                    <div className="flex-1">
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                  {contactSection && (
                    <div className="text-right shrink-0">
                      <SortableItem id="CONTACT">
                        {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                </div>

                {/* Main Wide Area */}
                <div className="space-y-6">
                  <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {headerLeftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Two Column Equal */}
            {selectedLayout === 'two-col-equal' && (
              <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full h-full">
                {/* Full Width Top Header */}
                {profileSection && (
                  <div className="p-6 rounded-xl text-white flex justify-between items-center" style={{ backgroundColor: style.themeColorId }}>
                    <div className="flex-1">
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'left', selectedLayout)}
                      </SortableItem>
                    </div>
                  </div>
                )}

                {/* Split Columns */}
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {/* Left Column */}
                  <div className="space-y-6 border-r pr-6" style={{ borderColor: `${style.themeColorId}10` }}>
                    <SortableContext items={leftSections.filter(s => s.sectionCode !== 'PROFILE').map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                      {leftSections.filter(s => s.sectionCode !== 'PROFILE').map(sec => (
                        <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                          {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <SortableContext items={rightSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                      {rightSections.map(sec => (
                        <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                          {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                        </SortableItem>
                      ))}
                    </SortableContext>
                  </div>
                </div>
              </div>
            )}

            {/* Full Width Layout */}
            {selectedLayout === 'full-width' && (
              <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full h-full">
                {/* Center Header Banner */}
                <div className="flex flex-col items-center justify-center border-b pb-6" style={{ borderColor: `${style.themeColorId}20` }}>
                  {profileSection && (
                    <div className="text-center w-full">
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                  {contactSection && (
                    <div className="mt-4 flex justify-center w-full max-w-sm">
                      <SortableItem id="CONTACT">
                        {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="space-y-6 flex-1">
                  <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {headerLeftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Harvard Classic Layout */}
            {selectedLayout === 'harvard-classic' && (
              <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full h-full text-left">
                {/* Centered Harvard Header Banner */}
                <div className="flex flex-col items-center justify-center border-b-2 pb-6" style={{ borderColor: style.themeColorId }}>
                  {profileSection && (
                    <div className="text-center w-full">
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                  {contactSection && (
                    <div className="mt-3 flex justify-center w-full">
                      <SortableItem id="CONTACT">
                        {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="space-y-6 flex-1">
                  <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {headerLeftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}

            {/* Harvard GSAS Asymmetric Layout */}
            {selectedLayout === 'harvard-gsas' && (
              <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full h-full text-left">
                {/* Asymmetric Header */}
                <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                  {profileSection && (
                    <div className="flex-1">
                      <SortableItem id="PROFILE">
                        {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                  {contactSection && (
                    <div className="text-right shrink-0">
                      <SortableItem id="CONTACT">
                        {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout)}
                      </SortableItem>
                    </div>
                  )}
                </div>

                {/* Main Content Area: Left Title / Right Content grid */}
                <div className="space-y-6 flex-1">
                  <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {headerLeftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        <div className="grid grid-cols-[1fr_3.5fr] gap-6 border-b border-gray-100 pb-4 last:border-b-0">
                          <div className="text-right pr-2">
                            <h4 className="text-[12.5px] font-bold uppercase tracking-wider font-sans" style={{ color: style.themeColorId }}>
                              {sec.sectionCode === 'EDUCATION' ? 'HỌC VẤN' :
                               sec.sectionCode === 'EXPERIENCE' ? 'KINH NGHIỆM' :
                               sec.sectionCode === 'SKILLS' ? 'KỸ NĂNG' :
                               sec.sectionCode === 'OBJECTIVE' ? 'MỤC TIÊU' :
                               sec.sectionCode === 'PROJECTS' ? 'DỰ ÁN' :
                               sec.sectionCode === 'CERTIFICATES' ? 'CHỨNG CHỈ' :
                               sec.sectionCode === 'ACTIVITIES' ? 'HOẠT ĐỘNG' : sec.sectionCode}
                            </h4>
                          </div>
                          <div className="text-left">
                            {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout)}
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default CVBuilder;
