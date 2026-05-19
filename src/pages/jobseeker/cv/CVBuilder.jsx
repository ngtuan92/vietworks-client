import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import cvService from '../../../services/cvService';

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

  const [cvData, setCvData] = useState(null);
  const [sections, setSections] = useState([]);
  const [style, setStyle] = useState({ fontId: 'Inter', themeColorId: '#0056b3' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sensors for Dnd
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
            themeColorId: res.data.style?.themeColorId || '#0056b3'
          });
        }
      } catch (error) {
        console.error(error);
        alert('Không thể tải dữ liệu CV');
        navigate('/manage-cv');
      } finally {
        setLoading(false);
      }
    };
    fetchCv();
  }, [id, navigate]);

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
      setSaving(true); // use saving state to show indicator
      const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true });
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
    } catch (error) {
      alert('Có lỗi khi xuất PDF');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-body-md bg-surface">Đang tải Canvas CV...</div>;

  const leftSections = sections.filter(s => s.column === 'left' && s.isVisible);
  const rightSections = sections.filter(s => s.column === 'right' && s.isVisible);
  const fullSections = sections.filter(s => s.column === 'full' && s.isVisible);

  const columns = cvData?.templateId?.layoutConfig?.columns || 2;
  const isTwoCol = columns === 2;

  // Mapped font name mapping
  const fontMapping = {
    'Inter': 'Inter, sans-serif',
    'Roboto': 'Roboto, sans-serif',
    'Outfit': 'Outfit, sans-serif',
    'Playfair Display': 'Playfair Display, serif',
    'Fira Code': 'monospace'
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-body-md flex flex-col md:flex-row">
      {/* Sidebar Toolbar */}
      <BuilderToolbar 
        style={style} 
        onStyleChange={handleStyleChange} 
        onExport={handleExportPDF} 
        isSaving={saving}
        navigateBack={() => navigate('/manage-cv')}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center h-screen relative">
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
            {isTwoCol ? (
              <div className="flex flex-1 h-full">
                {/* Left Column */}
                <div className="w-1/3 p-6" style={{ backgroundColor: style.themeColorId, color: '#ffffff' }}>
                  <SortableContext items={leftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {leftSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'left')}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
                {/* Right Column */}
                <div className="w-2/3 p-6 bg-white">
                  <SortableContext items={rightSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    {rightSections.map(sec => (
                      <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                        {renderSection(sec, style, handleSectionContentUpdate, 'right')}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-8 bg-white">
                <SortableContext items={fullSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                  {fullSections.map(sec => (
                    <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                      {renderSection(sec, style, handleSectionContentUpdate, 'full')}
                    </SortableItem>
                  ))}
                </SortableContext>
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default CVBuilder;
