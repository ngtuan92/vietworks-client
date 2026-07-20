import { useCallback, useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { renderSection, BuilderContext } from '../../../components/jobseeker/cv/builder/SectionRenderer';
import { CVTemplateRenderer } from '../../../components/cv/CVTemplateRenderer';
import { paginateSectionsWithItemRanges } from '../../../utils/cvPagination';

const EmployerCvPreview = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState(null);
  const [sections, setSections] = useState([]);
  const [, setSaving] = useState(false);
  const cvRef = useRef(null);

  useEffect(() => {
    if (!cvRef.current) return;

    const reportHeight = () => {
      const height = cvRef.current.getBoundingClientRect().height + 40;
      window.parent.postMessage({ type: 'SYNC_CV_HEIGHT', height }, '*');
    };

    const resizeObserver = new ResizeObserver(() => {
      reportHeight();
    });

    resizeObserver.observe(cvRef.current);
    
    setTimeout(reportHeight, 500);

    return () => resizeObserver.disconnect();
  }, [cvData]);

  const handleExportPDF = useCallback(async () => {
    if (!cvRef.current) return;
    setSaving(true);

    try {
      // A4 at 96dpi: 210mm = 793.7px. We render at 2x for crisp output.
      const A4_PX_WIDTH = 794;
      const RENDER_SCALE = 2;

      // --- Step 1: Build an off-screen container at EXACTLY A4 width ---
      const offscreen = document.createElement('div');
      offscreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${A4_PX_WIDTH}px;
        zoom: 1;
        transform: none;
        background: white;
        box-sizing: border-box;
        overflow: hidden;
        z-index: -9999;
        opacity: 0;
        pointer-events: none;
      `;
      document.body.appendChild(offscreen);
      offscreen.appendChild(cvRef.current.cloneNode(true));

      // --- Step 2: Clone all stylesheets from parent page into offscreen's scope ---
      // html2canvas needs to resolve classes correctly. We forcibly reset any scaling.
      const cloneEl = offscreen.firstChild;
      cloneEl.style.cssText = `
        width: ${A4_PX_WIDTH}px !important;
        min-height: auto;
        transform: none !important;
        zoom: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        display: flex;
        flex-direction: column;
      `;

      // --- Step 3: Wait for fonts ---
      await document.fonts.ready;
      // Extra delay to let browser finish compositing
      await new Promise(r => setTimeout(r, 400));

      // --- Step 4: oklab/oklch color patch ---
      const originalGetComputedStyle = window.getComputedStyle;
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = 1; colorCanvas.height = 1;
      const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
      const colorCache = {};
      function processColor(value) {
        if (typeof value !== 'string') return value;
        if (!value.includes('oklab') && !value.includes('oklch') && !value.includes('color(')) return value;
        return value.replace(/(?:oklab|oklch|color)\([^)]+\)/g, match => {
          if (colorCache[match]) return colorCache[match];
          colorCtx.clearRect(0, 0, 1, 1);
          colorCtx.fillStyle = match;
          colorCtx.fillRect(0, 0, 1, 1);
          const d = colorCtx.getImageData(0, 0, 1, 1).data;
          const rgba = `rgba(${d[0]},${d[1]},${d[2]},${(d[3]/255).toFixed(3)})`;
          colorCache[match] = rgba;
          return rgba;
        });
      }
      window.getComputedStyle = function(el, pseudo) {
        const s = originalGetComputedStyle.call(this, el, pseudo);
        return new Proxy(s, {
          get(target, prop) {
            if (prop === 'getPropertyValue') return (p) => processColor(target.getPropertyValue(p));
            const v = target[prop];
            return processColor(typeof v === 'function' ? v.bind(target) : v);
          }
        });
      };

      // --- Step 5: Render per .cv-page ---
      const pages = cloneEl.querySelectorAll('.cv-page');
      if (pages.length === 0) throw new Error('Không tìm thấy trang CV nào để xuất');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const originalScrollY = window.scrollY;
      window.scrollTo(0, 0);

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        const canvas = await html2canvas(pageEl, {
          scale: RENDER_SCALE,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => clonedDoc.fonts.ready,
        });

        const pageImg = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(pageImg, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      window.getComputedStyle = originalGetComputedStyle;
      document.body.removeChild(offscreen);
      window.scrollTo(0, originalScrollY);
      pdf.save(`CV_${cvData.title || 'Template'}.pdf`);

    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
    } finally {
      setSaving(false);
    }
  }, [cvData]);


  useEffect(() => {
    if (!loading && cvData && cvRef.current) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('download') === 'true') {
        const triggerExport = async () => {
          await new Promise(resolve => setTimeout(resolve, 800));
          await handleExportPDF();
          if (window.opener) {
            window.close();
          }
        };
        triggerExport();
      }
    }
  }, [loading, cvData, handleExportPDF]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'DOWNLOAD_TEMPLATE_CV') {
        handleExportPDF();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleExportPDF]);


  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/employer/talent-pool/cv-preview/${cvId}`);
        if (res.data.success && res.data.data.type === 'ONLINE') {
          setCvData(res.data.data.cvData);
          setStyle({
            fontId: res.data.data.cvData.style?.fontId || 'Inter',
            themeColorId: res.data.data.cvData.style?.themeColorId || '#0056b3',
            fontSize: res.data.data.cvData.style?.fontSize || 'medium',
            density: res.data.data.cvData.style?.density || 'normal',
            titleStyle: res.data.data.cvData.style?.titleStyle || 'underline',
            avatarShape: res.data.data.cvData.style?.avatarShape || 'circle'
          });
          const sorted = [...res.data.data.cvData.sections].sort((a, b) => a.order - b.order);
          setSections(sorted);
        } else {
          setError('Không thể tải dữ liệu CV');
        }
      } catch (err) {
        console.error(err);
        setError('Bạn cần mở khóa ứng viên để xem chi tiết CV');
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [cvId]);

  // Load font dynamically
  useEffect(() => {
    if (style?.fontId) {
      const fontName = style.fontId.replace(/ /g, '+');
      const linkId = `cv-font-${fontName}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [style?.fontId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-4 text-gray-600">Đang tải CV...</p>
        </div>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="mt-4 text-gray-600">{error || 'Không tìm thấy CV'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-primary-container text-white rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

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

  const selectedLayout = cvData?.templateSnapshot?.templateCode || cvData?.templateCode || cvData?.templateId?.templateCode || 'left-col';
  const profileSection = sections.find(s => s.sectionCode === 'PROFILE');
  const leftSections = sections.filter(s => s.column === 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);
  const rightSections = sections.filter(s => s.column !== 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);

  const headerLeftSections = sections.filter(s => s.sectionCode !== 'PROFILE' && s.sectionCode !== 'CONTACT' && s.isVisible !== false);
  const contactSection = sections.find(s => s.sectionCode === 'CONTACT');

  const PAGE_CONTENT_MAX_HEIGHT = 1040;

  // 1. left-col pagination
  const leftPages = paginateSectionsWithItemRanges(leftSections, style, 90, PAGE_CONTENT_MAX_HEIGHT);
  const rightPages = paginateSectionsWithItemRanges(rightSections, style, 110, PAGE_CONTENT_MAX_HEIGHT);

  // 2. header-left pagination
  const headerLeftPages = paginateSectionsWithItemRanges(headerLeftSections, style, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 3. two-col-equal pagination
  const equalLeftPages = paginateSectionsWithItemRanges(leftSections, style, 100, PAGE_CONTENT_MAX_HEIGHT);
  const equalRightPages = paginateSectionsWithItemRanges(rightSections, style, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 4. full-width pagination
  const fullWidthPages = paginateSectionsWithItemRanges(headerLeftSections, style, 130, PAGE_CONTENT_MAX_HEIGHT);

  // 5. harvard-classic pagination
  const harvardClassicPages = paginateSectionsWithItemRanges(headerLeftSections, style, 100, PAGE_CONTENT_MAX_HEIGHT);

  // 6. harvard-gsas pagination
  const harvardGsasPages = paginateSectionsWithItemRanges(headerLeftSections, style, 90, PAGE_CONTENT_MAX_HEIGHT);

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

  const isSectionContinuation = (secCode, pageIndex, pagesArray) => {
    for (let p = 0; p < pageIndex; p++) {
      if (pagesArray[p]?.some(s => s.sectionCode === secCode)) {
        return true;
      }
    }
    return false;
  };

  const renderLeftAvatar = () => (
    style.avatarShape !== 'hidden' && (
      <div className="px-5 pt-4 pb-2 text-center shrink-0">
        <div
          className={`relative group/avatar w-20 h-20 mx-auto bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shadow-inner ${style.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}
        >
          {profileSection?.items?.[0]?.avatar ? (
            <img
              src={profileSection.items[0].avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-[36px] text-white/70">person</span>
          )}
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-transparent py-4 px-4 cv-preview-mode overflow-hidden">
      <style>{`
        .cv-preview-mode [data-html2canvas-ignore="true"] {
          display: none !important;
        }
        body, html {
          background: transparent !important;
          overflow: hidden !important;
          height: auto !important;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <div className="flex-grow flex justify-center bg-transparent relative py-2">
        <div
          ref={cvRef}
          className="flex flex-col gap-6 origin-top"
          style={{
            fontFamily: fontMapping[style?.fontId] || 'Inter, sans-serif',
            color: '#374151'
          }}
        >
          <BuilderContext.Provider value={{ isReadOnly: true }}>
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
                renderSection(sec, style, () => {}, columnContext, selectedLayout, isContinuation, null, null)
              )}
            />
          </BuilderContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default EmployerCvPreview;




