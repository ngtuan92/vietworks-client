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
import { BuilderLeftSidebar } from '../../../components/jobseeker/cv/builder/BuilderLeftSidebar';
import { BuilderRightSidebar } from '../../../components/jobseeker/cv/builder/BuilderRightSidebar';
// Sections
import { renderSection } from '../../../components/jobseeker/cv/builder/SectionRenderer';
import { User, UploadCloud } from 'lucide-react';

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
      const pages = cvRef.current.querySelectorAll('.cv-page');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      if (pages.length === 0) {
        // Fallback for single page
        const canvas = await html2canvas(cvRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const singlePdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, singlePdfHeight);
      } else {
        for (let i = 0; i < pages.length; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          const canvas = await html2canvas(pages[i], {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      }

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

  const paginateSectionsWithItemRanges = (secs, initialHeight = 0, maxHeight = 1000) => {
    const pages = [];
    let currentPageSecs = [];
    let currentHeight = initialHeight;

    const fontScale = style.fontSize === 'small' ? 0.85 : style.fontSize === 'large' ? 1.15 : 1.0;
    const headerHeight = style.density === 'compact' ? 26 : style.density === 'comfortable' ? 44 : 34;
    const gapBetweenSections = style.density === 'compact' ? 8 : style.density === 'comfortable' ? 24 : 16;

    const getItemHeight = (sectionCode, item) => {
      let h = 40;
      if (sectionCode === 'OBJECTIVE') {
        h = style.density === 'compact' ? 35 : style.density === 'comfortable' ? 65 : 50;
      } else if (sectionCode === 'CONTACT') {
        h = style.density === 'compact' ? 40 : style.density === 'comfortable' ? 70 : 55;
      } else if (sectionCode === 'SKILLS') {
        h = style.density === 'compact' ? 18 : style.density === 'comfortable' ? 32 : 24;
      } else if (sectionCode === 'CERTIFICATES') {
        h = style.density === 'compact' ? 18 : style.density === 'comfortable' ? 30 : 22;
      } else if (sectionCode === 'EDUCATION') {
        h = style.density === 'compact' ? 30 : style.density === 'comfortable' ? 50 : 40;
      } else if (item) {
        const baseH = style.density === 'compact' ? 32 : style.density === 'comfortable' ? 50 : 40;
        let descLines = 0;
        if (item.description) {
          const text = item.description.replace(/<[^>]*>/g, '');
          descLines = Math.max(Math.ceil(text.length / 60), 1);
        }
        const descH = descLines * (style.density === 'compact' ? 12 : style.density === 'comfortable' ? 20 : 15);
        h = baseH + descH;
      }
      return h * fontScale;
    };

    for (let i = 0; i < secs.length; i++) {
      const sec = secs[i];
      const items = sec.items || [];
      const isObjective = sec.sectionCode === 'OBJECTIVE';
      const isContact = sec.sectionCode === 'CONTACT';

      let secHeaderHeight = headerHeight * fontScale;
      const gap = currentPageSecs.length > 0 ? gapBetweenSections : 0;

      if (isObjective || isContact) {
        const itemH = getItemHeight(sec.sectionCode);
        const totalSecHeight = secHeaderHeight + itemH;

        if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
          pages.push(currentPageSecs);
          currentPageSecs = [{ ...sec, renderItemRange: [0, 1] }];
          currentHeight = totalSecHeight;
        } else {
          currentHeight += gap + totalSecHeight;
          currentPageSecs.push({ ...sec, renderItemRange: [0, 1] });
        }
        continue;
      }

      if (sec.sectionCode === 'SKILLS') {
        const itemH = getItemHeight('SKILLS');
        const rows = Math.max(Math.ceil(items.length / 5), 1);
        const addButtonH = (style.density === 'compact' ? 12 : style.density === 'comfortable' ? 20 : 16) * fontScale;
        const totalSecHeight = secHeaderHeight + rows * itemH + addButtonH;

        if (currentPageSecs.length > 0 && currentHeight + gap + totalSecHeight > maxHeight) {
          pages.push(currentPageSecs);
          currentPageSecs = [{ ...sec, renderItemRange: [0, items.length] }];
          currentHeight = totalSecHeight;
        } else {
          currentHeight += gap + totalSecHeight;
          currentPageSecs.push({ ...sec, renderItemRange: [0, items.length] });
        }
        continue;
      }

      // Xử lý khi section danh sách rỗng (items.length === 0)
      if (items.length === 0) {
        const addButtonH = (style.density === 'compact' ? 12 : style.density === 'comfortable' ? 20 : 16) * fontScale;
        const emptySecHeight = secHeaderHeight + addButtonH;
        if (currentPageSecs.length > 0 && currentHeight + gap + emptySecHeight > maxHeight) {
          pages.push(currentPageSecs);
          currentPageSecs = [{ ...sec, renderItemRange: [0, 0] }];
          currentHeight = emptySecHeight;
        } else {
          currentHeight += gap + emptySecHeight;
          currentPageSecs.push({ ...sec, renderItemRange: [0, 0] });
        }
        continue;
      }

      // For multi-item sections
      let itemIdx = 0;
      let pageStartIdx = 0;
      let headerAdded = false;
      const addButtonH = (style.density === 'compact' ? 12 : style.density === 'comfortable' ? 20 : 16) * fontScale;

      while (itemIdx < items.length) {
        const item = items[itemIdx];
        if (!item) {
          itemIdx++;
          continue;
        }
        const itemH = getItemHeight(sec.sectionCode, item);
        const currentGap = (currentPageSecs.length > 0 || headerAdded) ? gapBetweenSections : 0;

        let heightNeeded = itemH;
        if (!headerAdded) {
          heightNeeded += secHeaderHeight;
        }
        if (itemIdx === items.length - 1) {
          heightNeeded += addButtonH;
        }

        if (currentHeight + currentGap + heightNeeded > maxHeight) {
          // If we are on a completely blank page, we must force this item to fit
          if (currentHeight === 0 && itemIdx === pageStartIdx) {
            itemIdx++;
            currentHeight += heightNeeded;
            headerAdded = true;
          } else {
            // Push the items that fit on the current page
            if (itemIdx > pageStartIdx) {
              currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
            }
            if (currentPageSecs.length > 0) {
              pages.push(currentPageSecs);
            }
            currentPageSecs = [];
            currentHeight = 0;
            pageStartIdx = itemIdx;
            headerAdded = false;
          }
        } else {
          itemIdx++;
          currentHeight += currentGap + heightNeeded;
          headerAdded = true;
        }
      }

      // Push remaining items of this section
      if (itemIdx > pageStartIdx) {
        currentPageSecs.push({ ...sec, renderItemRange: [pageStartIdx, itemIdx] });
      }
    }

    if (currentPageSecs.length > 0) {
      pages.push(currentPageSecs);
    }

    if (pages.length === 0) {
      pages.push([]);
    }

    return pages;
  };

  // 1. left-col pagination
  const leftPages = paginateSectionsWithItemRanges(leftSections, 90, 1000);
  const rightPages = paginateSectionsWithItemRanges(rightSections, 110, 1000);

  // 2. header-left pagination
  const headerLeftPages = paginateSectionsWithItemRanges(headerLeftSections, 100, 1000);

  // 3. two-col-equal pagination
  const equalLeftPages = paginateSectionsWithItemRanges(leftSections, 100, 1000);
  const equalRightPages = paginateSectionsWithItemRanges(rightSections, 100, 1000);

  // 4. full-width pagination
  const fullWidthPages = paginateSectionsWithItemRanges(headerLeftSections, 130, 1000);

  // 5. harvard-classic pagination
  const harvardClassicPages = paginateSectionsWithItemRanges(headerLeftSections, 100, 1000);

  // 6. harvard-gsas pagination
  const harvardGsasPages = paginateSectionsWithItemRanges(headerLeftSections, 90, 1000);

  // Determine total pages depending on selected layout
  let totalPages = 1;
  if (selectedLayout === 'left-col') {
    totalPages = Math.max(leftPages.length, rightPages.length);
  } else if (selectedLayout === 'header-left') {
    totalPages = headerLeftPages.length;
  } else if (selectedLayout === 'two-col-equal') {
    totalPages = Math.max(equalLeftPages.length, equalRightPages.length);
  } else if (selectedLayout === 'full-width') {
    totalPages = fullWidthPages.length;
  } else if (selectedLayout === 'harvard-classic') {
    totalPages = harvardClassicPages.length;
  } else if (selectedLayout === 'harvard-gsas') {
    totalPages = harvardGsasPages.length;
  }
  totalPages = Math.max(totalPages, 1);

  // Helper to determine if a section is a continuation from a previous page
  const isSectionContinuation = (secCode, pageIndex, pagesArray) => {
    for (let p = 0; p < pageIndex; p++) {
      if (pagesArray[p]?.some(s => s.sectionCode === secCode)) {
        return true;
      }
    }
    return false;
  };

  const queryParams = new URLSearchParams(window.location.search);
  const isAutoDownloading = queryParams.get('download') === 'true';

  return (
    <div className="min-h-screen bg-slate-50 font-body-md flex p-6 gap-6 max-w-[1600px] mx-auto w-full relative justify-center">
      {/* Auto-downloading PDF Overlay */}
      {isAutoDownloading && (
        <div className="fixed inset-0 bg-[#f9fafb] z-[9999] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Đang xuất bản file PDF của bạn...</h2>
          <p className="text-sm text-gray-500">Quá trình này có thể mất vài giây để đảm bảo độ sắc nét cao nhất.</p>
        </div>
      )}
      
      {/* Left Sidebar Toolbox */}
      <BuilderLeftSidebar
        sections={sections}
        setSections={setSections}
        saveCvConfig={saveCvConfig}
        style={style}
      />

      {/* Main Canvas Area */}
      <div className="flex-grow flex justify-center bg-transparent relative">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div
            ref={cvRef}
            className="flex flex-col gap-6"
            style={{
              fontFamily: fontMapping[style.fontId] || 'sans-serif',
              color: '#374151'
            }}
          >
            <SortableContext items={leftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
              <SortableContext items={rightSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                  {Array.from({ length: totalPages }).map((_, pageIdx) => {
                    const pLeft = leftPages[pageIdx] || [];
                    const pRight = rightPages[pageIdx] || [];
                    const pHeaderLeft = headerLeftPages[pageIdx] || [];
                    const pEqualLeft = equalLeftPages[pageIdx] || [];
                    const pEqualRight = equalRightPages[pageIdx] || [];
                    const pFullWidth = fullWidthPages[pageIdx] || [];
                    const pHarvardClassic = harvardClassicPages[pageIdx] || [];
                    const pHarvardGsas = harvardGsasPages[pageIdx] || [];

                    return (
                      <div
                        key={pageIdx}
                        className="cv-page bg-white shadow-xl flex flex-col relative overflow-hidden pb-[40px]"
                        style={{
                          width: '210mm',
                          height: '297mm',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Left Column Layout */}
                        {selectedLayout === 'left-col' && (
                          <div className="flex-1 flex w-full overflow-hidden">
                            {/* Left Sidebar */}
                            <div
                              style={{ backgroundColor: style.themeColorId }}
                              className="w-[35%] p-6 text-white flex flex-col gap-6"
                            >
                              {/* Avatar in Left Sidebar */}
                              {pageIdx === 0 && style.avatarShape !== 'hidden' && (
                                <div className="px-5 pt-4 pb-2 text-center shrink-0">
                                  <div
                                    className={`relative group/avatar w-20 h-20 mx-auto bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden relative shadow-inner ${style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                                      }`}
                                  >
                                    {profileSection?.items[0]?.avatar ? (
                                      <img src={profileSection.items[0].avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-5 h-5 text-white/70"  />
                                    )}
                                    <label
                                      data-html2canvas-ignore="true"
                                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                                    >
                                      <UploadCloud className="text-white w-5 h-5"  />
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

                              {pLeft.map(sec => {
                                const isCont = isSectionContinuation(sec.sectionCode, pageIdx, leftPages);
                                return isCont ? (
                                  <div key={sec.sectionCode} className="w-full">
                                    {renderSection(sec, style, handleSectionContentUpdate, 'left', selectedLayout, true)}
                                  </div>
                                ) : (
                                  <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                    {renderSection(sec, style, handleSectionContentUpdate, 'left', selectedLayout, false)}
                                  </SortableItem>
                                );
                              })}
                            </div>

                            {/* Right Main area */}
                            <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                              {/* Header Box */}
                              {pageIdx === 0 && profileSection && (
                                <div className="border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                                  <SortableItem id="PROFILE">
                                    {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                  </SortableItem>
                                </div>
                              )}

                              <div className="space-y-6">
                                {pRight.map(sec => {
                                  const isCont = isSectionContinuation(sec.sectionCode, pageIdx, rightPages);
                                  return isCont ? (
                                    <div key={sec.sectionCode} className="w-full">
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                    </div>
                                  ) : (
                                    <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Header Left Layout */}
                        {selectedLayout === 'header-left' && (
                          <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
                            {/* Header block */}
                            {pageIdx === 0 && (
                              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}30` }}>
                                {profileSection && (
                                  <div className="flex-1">
                                    <SortableItem id="PROFILE">
                                      {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                                {contactSection && (
                                  <div className="text-right shrink-0">
                                    <SortableItem id="CONTACT">
                                      {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main Wide Area */}
                            <div className="space-y-6">
                              {pHeaderLeft.map(sec => {
                                const isCont = isSectionContinuation(sec.sectionCode, pageIdx, headerLeftPages);
                                return isCont ? (
                                  <div key={sec.sectionCode} className="w-full">
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                  </div>
                                ) : (
                                  <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                  </SortableItem>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Two Column Equal */}
                        {selectedLayout === 'two-col-equal' && (
                          <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
                            {/* Full Width Top Header */}
                            {pageIdx === 0 && profileSection && (
                              <div className="p-6 rounded-xl text-white flex justify-between items-center" style={{ backgroundColor: style.themeColorId }}>
                                <div className="flex-1">
                                  <SortableItem id="PROFILE">
                                    {renderSection(profileSection, style, handleSectionContentUpdate, 'left', selectedLayout, false)}
                                  </SortableItem>
                                </div>
                              </div>
                            )}

                            {/* Split Columns */}
                            <div className="grid grid-cols-2 gap-6 flex-1">
                              {/* Left Column */}
                              <div className="space-y-6 border-r pr-6" style={{ borderColor: `${style.themeColorId}10` }}>
                                {pLeft.map(sec => {
                                  const isCont = isSectionContinuation(sec.sectionCode, pageIdx, equalLeftPages);
                                  return isCont ? (
                                    <div key={sec.sectionCode} className="w-full">
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                    </div>
                                  ) : (
                                    <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  );
                                })}
                              </div>

                              {/* Right Column */}
                              <div className="space-y-6">
                                {pRight.map(sec => {
                                  const isCont = isSectionContinuation(sec.sectionCode, pageIdx, equalRightPages);
                                  return isCont ? (
                                    <div key={sec.sectionCode} className="w-full">
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                    </div>
                                  ) : (
                                    <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Full Width Layout */}
                        {selectedLayout === 'full-width' && (
                          <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
                            {/* Center Header Banner */}
                            {pageIdx === 0 && (
                              <div className="flex flex-col items-center justify-center border-b pb-6" style={{ borderColor: `${style.themeColorId}20` }}>
                                {profileSection && (
                                  <div className="text-center w-full">
                                    <SortableItem id="PROFILE">
                                      {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                                {contactSection && (
                                  <div className="mt-4 flex justify-center w-full max-w-sm">
                                    <SortableItem id="CONTACT">
                                      {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main Content Area */}
                            <div className="space-y-6 flex-1">
                              {pFullWidth.map(sec => {
                                const isCont = isSectionContinuation(sec.sectionCode, pageIdx, fullWidthPages);
                                return isCont ? (
                                  <div key={sec.sectionCode} className="w-full">
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                  </div>
                                ) : (
                                  <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                  </SortableItem>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Harvard Classic Layout */}
                        {selectedLayout === 'harvard-classic' && (
                          <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden text-left">
                            {/* Centered Harvard Header Banner */}
                            {pageIdx === 0 && (
                              <div className="flex flex-col items-center justify-center border-b-2 pb-6" style={{ borderColor: style.themeColorId }}>
                                {profileSection && (
                                  <div className="text-center w-full">
                                    <SortableItem id="PROFILE">
                                      {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                                {contactSection && (
                                  <div className="mt-3 flex justify-center w-full">
                                    <SortableItem id="CONTACT">
                                      {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main Content Area */}
                            <div className="space-y-6 flex-1">
                              {pHarvardClassic.map(sec => {
                                const isCont = isSectionContinuation(sec.sectionCode, pageIdx, harvardClassicPages);
                                return isCont ? (
                                  <div key={sec.sectionCode} className="w-full">
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                  </div>
                                ) : (
                                  <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                                    {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                  </SortableItem>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Harvard GSAS Asymmetric Layout */}
                        {selectedLayout === 'harvard-gsas' && (
                          <div className="flex-1 p-8 bg-white flex flex-col gap-6 w-full overflow-hidden text-left">
                            {/* Asymmetric Header */}
                            {pageIdx === 0 && (
                              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: `${style.themeColorId}20` }}>
                                {profileSection && (
                                  <div className="flex-1">
                                    <SortableItem id="PROFILE">
                                      {renderSection(profileSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                                {contactSection && (
                                  <div className="text-right shrink-0">
                                    <SortableItem id="CONTACT">
                                      {renderSection(contactSection, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                    </SortableItem>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Main Content Area: Left Title / Right Content grid */}
                            <div className="space-y-6 flex-1">
                              {pHarvardGsas.map(sec => {
                                const isCont = isSectionContinuation(sec.sectionCode, pageIdx, harvardGsasPages);
                                return isCont ? (
                                  <div key={sec.sectionCode} className="grid grid-cols-[1fr_3.5fr] gap-6 border-b border-gray-100 pb-4 last:border-b-0">
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
                                      {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, true)}
                                    </div>
                                  </div>
                                ) : (
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
                                        {renderSection(sec, style, handleSectionContentUpdate, 'right', selectedLayout, false)}
                                      </div>
                                    </div>
                                  </SortableItem>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Page Footer Watermark */}
                        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-white px-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none pointer-events-none z-20">
                          <span>VietWorks - Mẫu CV Chuyên Nghiệp</span>
                          <span>Trang {pageIdx + 1} / {totalPages}</span>
                        </div>
                      </div>
                    );
                  })}
                </SortableContext>
              </SortableContext>
            </SortableContext>
          </div>
                </DndContext>
      </div>

      {/* Right Sidebar Properties/Settings */}
      <BuilderRightSidebar
        style={style}
        onStyleChange={handleStyleChange}
        onExport={handleExportPDF}
        isSaving={saving}
        navigateBack={() => navigate('/manage-cv')}
        currentTemplateId={cvData?.templateId?._id}
        onTemplateChange={handleTemplateChange}
      />
    </div>
  );
};

export default CVBuilder;
