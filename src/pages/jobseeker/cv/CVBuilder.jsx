import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import cvService from '../../../services/cvService';
import { useNotification } from '../../../contexts/NotificationContext';

import { SortableItem } from '../../../components/jobseeker/cv/builder/SortableItem';
import { BuilderLeftSidebar } from '../../../components/jobseeker/cv/builder/BuilderLeftSidebar';
import { BuilderRightSidebar } from '../../../components/jobseeker/cv/builder/BuilderRightSidebar';
import { renderSection, BuilderContext } from '../../../components/jobseeker/cv/builder/SectionRenderer';
import { AvatarCropModal } from '../../../components/jobseeker/cv/builder/AvatarCropModal';
import uploadService from '../../../services/uploadService';
import { ArrowLeft, User, UploadCloud } from 'lucide-react';
import { CVTemplateRenderer } from '../../../components/cv/CVTemplateRenderer';

const base64ToFile = (base64String, filename = 'avatar.jpg') => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const buildCvStateFromTemplate = (template) => {
  const layoutConfig = template?.layoutConfig || {};
  const nextSections = Array.isArray(layoutConfig.sections)
    ? layoutConfig.sections.map((sec) => ({
        sectionCode: sec.sectionCode,
        order: sec.order,
        column: sec.column,
        position: sec.position || { x: 0, y: 0 },
        isVisible: sec.isVisible !== undefined ? sec.isVisible : true,
        items: sec.items || []
      }))
    : [];

  const nextStyle = {
    fontId: layoutConfig.defaultFontId || 'Inter',
    themeColorId: layoutConfig.defaultColorId || '#0056b3',
    fontSize: layoutConfig.fontSize || 'medium',
    density: layoutConfig.density || 'normal',
    titleStyle: layoutConfig.titleStyle || 'underline',
    avatarShape: layoutConfig.avatarShape || 'circle',
    avatarZoom: layoutConfig.avatarZoom || 1,
    avatarX: layoutConfig.avatarX || 0,
    avatarY: layoutConfig.avatarY || 0
  };

  return { sections: nextSections, style: nextStyle };
};

const blankTemplateValue = (value) => {
  if (Array.isArray(value)) return value.map(blankTemplateValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, blankTemplateValue(val)]));
  }
  return '';
};

const mergeSectionsWithTemplate = (templateSections, currentSections) => {
  const currentByCode = new Map(currentSections.map((section) => [section.sectionCode, section]));

  return templateSections.map((templateSection) => {
    const currentSection = currentByCode.get(templateSection.sectionCode);
    const templateItems = templateSection.items || [];
    const currentItems = currentSection?.items || [];
    const itemCount = Math.max(currentItems.length, templateItems.length);

    const mergedItems = Array.from({ length: itemCount }).map((_, index) => {
      const blankTemplateItem = blankTemplateValue(templateItems[index] || templateItems[0] || {});
      return {
        ...blankTemplateItem,
        ...(currentItems[index] || {})
      };
    });

    return {
      ...templateSection,
      items: mergedItems
    };
  });
};

const buildTemplateSnapshot = (template) => ({
  templateId: template?._id,
  templateCode: template?.templateCode,
  layoutConfig: template?.layoutConfig || {},
  versionedAt: new Date().toISOString()
});

const CVBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const cvRef = useRef(null);
  const cvDisplayRef = useRef(null);
  const { error: showError, success: showSuccess } = useNotification();

  const [cvData, setCvData] = useState(null);
  const [sections, setSections] = useState([]);
  const [style, setStyle] = useState({
    fontId: 'Inter',
    themeColorId: '#0056b3',
    fontSize: 'medium',
    density: 'normal',
    titleStyle: 'underline',
    avatarShape: 'circle',
    avatarZoom: 1,
    avatarX: 0,
    avatarY: 0
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
            avatarShape: res.data.style?.avatarShape || 'circle',
            avatarZoom: res.data.style?.avatarZoom || 1,
            avatarX: res.data.style?.avatarX || 0,
            avatarY: res.data.style?.avatarY || 0
          });
        }
      } catch (err) {
        console.error(err);
        showError('Kh么ng th峄?t岷 d峄?li峄噓 CV');
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

  const handleMultipleStyleChange = (updates, shouldSave = true) => {
    setStyle(prev => {
      const newStyle = { ...prev, ...updates };
      if (shouldSave) {
        saveCvConfig(sections, newStyle);
      }
      return newStyle;
    });
  };

  const handleStyleChange = (key, value) => {
    handleMultipleStyleChange({ [key]: value }, true);
  };

  const [croppingImage, setCroppingImage] = useState(null);
  const [onCropComplete, setOnCropComplete] = useState(null);

  const handleOpenCropModal = (imageSrc, callback) => {
    setCroppingImage(imageSrc);
    setOnCropComplete(() => callback);
  };

  const handleTemplateChange = async (newTemplate) => {
    try {
      setSaving(true);
      const templateState = buildCvStateFromTemplate(newTemplate);
      const mergedSections = templateState.sections.length > 0
        ? mergeSectionsWithTemplate(templateState.sections, sections)
        : sections;
      const templateSnapshot = buildTemplateSnapshot(newTemplate);
      const payload = {
        templateId: newTemplate._id,
        templateSnapshot,
        ...(templateState.sections.length > 0 ? { sections: mergedSections } : {}),
        style: {
          ...style,
          ...templateState.style
        }
      };
      const res = await cvService.updateCv(id, payload);
      if (res.success) {
        setCvData(prev => ({
          ...prev,
          templateId: newTemplate,
          templateSnapshot
        }));
        if (templateState.sections.length > 0) {
          setSections(mergedSections.sort((a, b) => a.order - b.order));
        }
        setStyle(prev => ({ ...prev, ...templateState.style }));
      }
    } catch (err) {
      console.error(err);
      showError('Kh么ng th峄?膽峄昳 m岷玼 thi岷縯 k岷?CV');
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
      console.error('L峄梚 t峄?膽峄檔g l瓢u', error);
    } finally {
      setSaving(false);
    }
  };

  const prepareCvCapture = async () => {
    const node = cvDisplayRef.current;
    if (!node) return () => {};

    const previousTransform = node.style.transform;
    const previousTransition = node.style.transition;

    node.style.transition = 'none';
    node.style.transform = 'none';

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    return () => {
      node.style.transform = previousTransform;
      node.style.transition = previousTransition;
    };
  };

  const generatePreviewImage = async () => {
    if (!cvRef.current) return null;
    const restoreCvDisplay = await prepareCvCapture();
    try {
      const pages = cvRef.current.querySelectorAll('.cv-page');
      const targetElement = pages.length > 0 ? pages[0] : cvRef.current;
      
      const canvas = await html2canvas(targetElement, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], `cv-preview-${id}.jpg`, { type: 'image/jpeg' });
          try {
            const res = await uploadService.uploadAvatar(file);
            if (res.success && res.data?.fileUrl) {
              resolve(res.data.fileUrl);
            } else {
              resolve(null);
            }
          } catch (uploadErr) {
            console.error('L峄梚 upload 岷h preview:', uploadErr);
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      });
    } catch (err) {
      console.error('L峄梚 t岷 岷h preview:', err);
      return null;
    } finally {
      restoreCvDisplay();
    }
  };

  const handleExitBuilder = async () => {
    try {
      setSaving(true);
      const previewUrl = await generatePreviewImage();
      await cvService.updateCv(id, {
        sections,
        style,
        previewImageUrl: previewUrl || undefined,
        status: 'DRAFT',
        isMain: false
      });
    } catch (err) {
      console.error('L峄梚 khi l瓢u v脿 tho谩t:', err);
    } finally {
      setSaving(false);
      navigate('/manage-cv');
    }
  };

  const handleSaveOfficial = async () => {
    try {
      setSaving(true);
      const previewUrl = await generatePreviewImage();
      await cvService.updateCv(id, {
        sections,
        style,
        previewImageUrl: previewUrl || undefined,
        isMain: true,
        status: 'ACTIVE'
      });
      showSuccess('膼茫 l瓢u th脿nh CV ch铆nh th峄ヽ!');
      navigate('/manage-cv');
    } catch (err) {
      console.error('L峄梚 khi l瓢u ch铆nh th峄ヽ:', err);
      showError('Kh么ng th峄?l瓢u CV');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!cvRef.current) return;
    let restoreCvDisplay = () => {};
    try {
      setSaving(true);
      restoreCvDisplay = await prepareCvCapture();
      const pages = cvRef.current.querySelectorAll('.cv-page');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let previewUrl = null;

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

        // Upload first page snapshot
        await new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `cv-preview-${id}.jpg`, { type: 'image/jpeg' });
              const res = await uploadService.uploadAvatar(file).catch(() => null);
              if (res?.success) previewUrl = res.data.fileUrl;
            }
            resolve();
          }, 'image/jpeg', 0.85);
        });
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

          if (i === 0) {
            // Upload first page snapshot
            await new Promise((resolve) => {
              canvas.toBlob(async (blob) => {
                if (blob) {
                  const file = new File([blob], `cv-preview-${id}.jpg`, { type: 'image/jpeg' });
                  const res = await uploadService.uploadAvatar(file).catch(() => null);
                  if (res?.success) previewUrl = res.data.fileUrl;
                }
                resolve();
              }, 'image/jpeg', 0.85);
            });
          }
        }
      }

      // Save preview URL to DB
      if (previewUrl) {
        await cvService.updateCv(id, {
          sections,
          style,
          previewImageUrl: previewUrl
        }).catch(err => console.error('L峄梚 l瓢u previewUrl:', err));
      }

      pdf.save(`${cvData?.title || 'CV'}.pdf`);
    } catch (err) {
      showError('C贸 l峄梚 khi xu岷 PDF');
      console.error(err);
    } finally {
      restoreCvDisplay();
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-body-md bg-surface">膼ang t岷 Canvas CV...</div>;

  const selectedLayout = cvData?.templateSnapshot?.templateCode || cvData?.templateCode || cvData?.templateId?.templateCode || 'left-col';
  const PAGE_CONTENT_MAX_HEIGHT = 1040;

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

  const paginateSectionsWithItemRanges = (secs, initialHeight = 0, maxHeight = 1250) => {
    const pages = [];
    let currentPageSecs = [];
    let currentHeight = initialHeight;

    const fontScale = style.fontSize === 'small' ? 0.85 : style.fontSize === 'large' ? 1.15 : 1.0;
    const headerHeight = style.density === 'compact' ? 26 : style.density === 'comfortable' ? 44 : 34;
    const gapBetweenSections = style.density === 'compact' ? 8 : style.density === 'comfortable' ? 24 : 16;

    const getItemHeight = (sectionCode, item) => {
      let h = 40;
      if (sectionCode === 'OBJECTIVE' || sectionCode === 'ADDITIONAL_INFO') {
        h = style.density === 'compact' ? 35 : style.density === 'comfortable' ? 65 : 50;
      } else if (sectionCode === 'CONTACT') {
        h = style.density === 'compact' ? 40 : style.density === 'comfortable' ? 70 : 55;
      } else if (sectionCode === 'SKILLS' || sectionCode === 'INTERESTS') {
        h = style.density === 'compact' ? 18 : style.density === 'comfortable' ? 32 : 24;
      } else if (sectionCode === 'CERTIFICATES' || sectionCode === 'AWARDS') {
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

      if (isObjective || isContact || sec.sectionCode === 'ADDITIONAL_INFO') {
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

      if (sec.sectionCode === 'SKILLS' || sec.sectionCode === 'INTERESTS') {
        const itemH = getItemHeight(sec.sectionCode);
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

      // X峄?l媒 khi section danh s谩ch r峄梟g (items.length === 0)
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
  const leftPages = paginateSectionsWithItemRanges(leftSections, 90, PAGE_CONTENT_MAX_HEIGHT);
  const rightPages = paginateSectionsWithItemRanges(rightSections, 110, PAGE_CONTENT_MAX_HEIGHT);

  // 2. header-left pagination
  const headerLeftPages = paginateSectionsWithItemRanges(headerLeftSections, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 3. two-col-equal pagination
  const equalLeftPages = paginateSectionsWithItemRanges(leftSections, 100, PAGE_CONTENT_MAX_HEIGHT);
  const equalRightPages = paginateSectionsWithItemRanges(rightSections, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 4. full-width pagination
  const fullWidthPages = paginateSectionsWithItemRanges(headerLeftSections, 130, PAGE_CONTENT_MAX_HEIGHT);

  // 5. harvard-classic pagination
  const harvardClassicPages = paginateSectionsWithItemRanges(headerLeftSections, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 6. harvard-gsas pagination
  const harvardGsasPages = paginateSectionsWithItemRanges(headerLeftSections, 90, PAGE_CONTENT_MAX_HEIGHT);

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
  const renderLeftAvatar = () => (
    style.avatarShape !== 'hidden' && (
      <div className="px-5 pt-4 pb-2 text-center shrink-0">
        <div
          className={`relative group/avatar w-20 h-20 mx-auto bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer ${style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
          title="Click 膽峄?t岷 岷h 膽岷 di峄噉 l锚n"
        >
          {profileSection?.items[0]?.avatar ? (
            <img
              src={profileSection.items[0].avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white/70" />
          )}
          <label
            data-html2canvas-ignore="true"
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
            title="Click 膽峄?t岷 岷h 膽岷 di峄噉 l锚n"
          >
            <UploadCloud className="text-white w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    handleOpenCropModal(reader.result, (croppedBase64) => {
                      const updatedItems = [...(profileSection.items || [])];
                      if (!updatedItems[0]) updatedItems[0] = {};
                      updatedItems[0].avatar = croppedBase64;
                      handleSectionContentUpdate('PROFILE', updatedItems);
                      handleMultipleStyleChange({
                        avatarZoom: 1,
                        avatarX: 0,
                        avatarY: 0
                      });
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
      </div>
    )
  );
  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-body-md">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => navigate('/manage-cv')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-primary/40 hover:text-primary transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <span className="text-slate-500 text-sm font-medium">Xem trước: {cvData?.title}</span>
            <button
              onClick={handleExportPDF}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-bold hover:bg-primary/90 transition disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              {saving ? 'Đang xuất...' : 'Tải PDF'}
            </button>
          </div>
          <div
            ref={cvRef}
            className="flex flex-col gap-6 cv-preview-mode"
            style={{ fontFamily: fontMapping[style.fontId] || 'sans-serif', color: '#374151' }}
          >
            <style>{`
              .cv-preview-mode [data-html2canvas-ignore="true"] {
                display: none !important;
              }
            `}</style>
            <BuilderContext.Provider value={{ isReadOnly: isPreviewMode }}>
              <CVTemplateRenderer
                selectedLayout={selectedLayout}
                style={style}
                totalPages={totalPages}
                pages={{
                  left: leftPages,
                  right: rightPages,
                  headerLeft: headerLeftPages,
                  equalLeft: equalLeftPages,
                  equalRight: equalRightPages,
                  fullWidth: fullWidthPages,
                  harvardClassic: harvardClassicPages,
                  harvardGsas: harvardGsasPages,
                  isSectionContinuation
                }}
                profileSection={profileSection}
                contactSection={contactSection}
                renderLeftAvatar={renderLeftAvatar}
                renderSection={(sec, columnContext, isContinuation = false) => (
                  renderSection(sec, style, null, columnContext, selectedLayout, isContinuation, null, null)
                )}
              />
            </BuilderContext.Provider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body-md flex p-5 pt-16 gap-5 max-w-[1720px] mx-auto w-full relative justify-center">
      {/* Auto-downloading PDF Overlay */}
      {isAutoDownloading && (
        <div className="fixed inset-0 bg-[#f9fafb] z-[9999] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">膼ang xu岷 b岷 file PDF c峄 b岷...</h2>
          <p className="text-sm text-gray-500">Qu谩 tr矛nh n脿y c贸 th峄?m岷 v脿i gi芒y 膽峄?膽岷 b岷 膽峄?s岷痗 n茅t cao nh岷.</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleExitBuilder}
        disabled={saving}
        className="absolute top-4 left-5 z-20 mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang CV
      </button>
      
      {/* Left Sidebar Toolbox */}
      <BuilderLeftSidebar
        sections={sections}
        setSections={setSections}
        saveCvConfig={saveCvConfig}
        style={style}
      />

      {/* Main Canvas Area */}
      <div className="flex-grow flex justify-center bg-transparent relative overflow-x-auto py-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div
            ref={cvDisplayRef}
            className="origin-top transition-transform duration-200"
            style={{ transform: 'scale(0.9)' }}
          >
            <div
              ref={cvRef}
              className="flex flex-col gap-6"
              style={{
                fontFamily: fontMapping[style.fontId] || 'sans-serif',
                color: '#374151'
              }}
            >
              <BuilderContext.Provider value={{ isReadOnly: false }}>
                <SortableContext items={leftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                  <SortableContext items={rightSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                    <SortableContext items={headerLeftSections.map(s => s.sectionCode)} strategy={verticalListSortingStrategy}>
                      <CVTemplateRenderer
                        selectedLayout={selectedLayout}
                        style={style}
                        totalPages={totalPages}
                        pages={{
                          left: leftPages,
                          right: rightPages,
                          headerLeft: headerLeftPages,
                          equalLeft: equalLeftPages,
                          equalRight: equalRightPages,
                          fullWidth: fullWidthPages,
                          harvardClassic: harvardClassicPages,
                          harvardGsas: harvardGsasPages,
                          isSectionContinuation
                        }}
                        profileSection={profileSection}
                        contactSection={contactSection}
                        renderLeftAvatar={renderLeftAvatar}
                        renderSection={(sec, columnContext, isContinuation = false) => (
                          renderSection(sec, style, handleSectionContentUpdate, columnContext, selectedLayout, isContinuation, handleMultipleStyleChange, handleOpenCropModal)
                        )}
                        wrapSection={(sec, node) => (
                          <SortableItem key={sec.sectionCode} id={sec.sectionCode}>
                            {node}
                          </SortableItem>
                        )}
                      />
                    </SortableContext>
                  </SortableContext>
                </SortableContext>
              </BuilderContext.Provider>
            </div>
          </div>
                </DndContext>
      </div>
      {/* Right Sidebar Properties/Settings */}
      <BuilderRightSidebar
        style={style}
        onStyleChange={handleStyleChange}
        onExport={handleExportPDF}
        onSaveOfficial={handleSaveOfficial}
        isSaving={saving}
        navigateBack={handleExitBuilder}
        currentTemplateId={cvData?.templateId?._id}
        onTemplateChange={handleTemplateChange}
      />

      {croppingImage && (
        <AvatarCropModal
          imageUrl={croppingImage}
          onClose={() => {
            setCroppingImage(null);
            setOnCropComplete(null);
          }}
          onConfirm={async (croppedBase64) => {
            try {
              setSaving(true);
              const file = base64ToFile(croppedBase64);
              const res = await uploadService.uploadAvatar(file);
              if (res.success && res.data?.fileUrl) {
                if (onCropComplete) {
                  onCropComplete(res.data.fileUrl);
                }
              } else {
                if (onCropComplete) {
                  onCropComplete(croppedBase64);
                }
              }
            } catch (err) {
              console.error('Cloudinary upload failed, falling back to base64:', err);
              if (onCropComplete) {
                onCropComplete(croppedBase64);
              }
            } finally {
              setSaving(false);
              setCroppingImage(null);
              setOnCropComplete(null);
            }
          }}
          onDelete={() => {
            if (onCropComplete) {
              onCropComplete(null);
            }
            setCroppingImage(null);
            setOnCropComplete(null);
          }}
        />
      )}
    </div>
  );
};

export default CVBuilder;
