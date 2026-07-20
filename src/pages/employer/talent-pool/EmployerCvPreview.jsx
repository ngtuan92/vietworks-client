import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { renderSection, BuilderContext } from '../../../components/jobseeker/cv/builder/SectionRenderer';

const EmployerCvPreview = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const cvRef = useRef(null);

  const handleExportPDF = async () => {
    if (!cvRef.current) return;

    // Workaround for html2canvas oklab/oklch bug
    const originalGetComputedStyle = window.getComputedStyle;
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
    const colorCache = {};

    function processValue(value) {
      if (typeof value === 'string' && (value.includes('oklab') || value.includes('oklch') || value.includes('color('))) {
        return value.replace(/(?:oklab|oklch|color)\([^)]+\)/g, match => {
          if (colorCache[match]) return colorCache[match];
          colorCtx.clearRect(0, 0, 1, 1);
          colorCtx.fillStyle = match;
          colorCtx.fillRect(0, 0, 1, 1);
          const data = colorCtx.getImageData(0, 0, 1, 1).data;
          const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
          colorCache[match] = rgba;
          return rgba;
        });
      }
      return value;
    }

    window.getComputedStyle = function(el, pseudoElt) {
      const style = originalGetComputedStyle.call(this, el, pseudoElt);
      return new Proxy(style, {
        get: function(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(property) {
              return processValue(target.getPropertyValue(property));
            };
          }
          const value = target[prop];
          return processValue(typeof value === 'function' ? value.bind(target) : value);
        }
      });
    };

    try {
      setSaving(true);
      await document.fonts.ready; // Ensure fonts are fully loaded
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          return clonedDoc.fonts.ready;
        }
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
      pdf.save(`CV_${cvData.title || 'Template'}.pdf`);
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setSaving(false);
    }
  };

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
  }, [loading, cvData]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'DOWNLOAD_TEMPLATE_CV') {
        handleExportPDF();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [cvData]);


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

  const selectedLayout = cvData.templateId?.templateCode || 'left-col';
  const profileSection = sections.find(s => s.sectionCode === 'PROFILE');
  const leftSections = sections.filter(s => s.column === 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);
  const rightSections = sections.filter(s => s.column !== 'left' && s.sectionCode !== 'PROFILE' && s.isVisible !== false);

  const headerLeftSections = sections.filter(s => s.sectionCode !== 'PROFILE' && s.sectionCode !== 'CONTACT' && s.isVisible !== false);
  const contactSection = sections.find(s => s.sectionCode === 'CONTACT');

  return (
    <div className="min-h-screen bg-transparent py-4 px-4 cv-preview-mode">
      <style>{`
        .cv-preview-mode [data-html2canvas-ignore="true"] {
          display: none !important;
        }
        body {
          background: transparent !important;
        }
      `}</style>
      {/* CV Canvas */}
      <div className="flex justify-center pb-20 drop-shadow-xl">
        <BuilderContext.Provider value={{ isReadOnly: true }}>
        <div
          ref={cvRef}
          className="bg-white"
          style={{
            width: '210mm',
            minHeight: '297mm',
            fontFamily: fontMapping[style?.fontId] || 'Inter, sans-serif',
            color: '#374151'
          }}
        >
          {/* Left Column Layout */}
          {selectedLayout === 'left-col' && (
            <div className="flex w-full overflow-hidden">
              {/* Left Sidebar */}
              <div
                style={{ backgroundColor: style?.themeColorId || '#0056b3' }}
                className="w-[35%] p-6 text-white flex flex-col gap-6"
              >
                {profileSection && style?.avatarShape !== 'hidden' && (
                  <div className="px-5 pt-4 pb-2 text-center shrink-0">
                    <div
                      className={`w-20 h-20 mx-auto bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden ${
                        style?.avatarShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                      }`}
                    >
                      {profileSection.items?.[0]?.avatar ? (
                        <img src={profileSection.items[0].avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[36px] text-white/70">person</span>
                      )}
                    </div>
                  </div>
                )}
                {leftSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'left', selectedLayout, false)}
                  </div>
                ))}
              </div>

              {/* Right Main area */}
              <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                {profileSection && (
                  <div className="border-b pb-4" style={{ borderColor: `${style?.themeColorId}20` }}>
                    {renderSection(profileSection, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                )}
                <div className="space-y-6">
                  {rightSections.map(sec => (
                    <div key={sec.sectionCode} className="w-full">
                      {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Header Left Layout */}
          {selectedLayout === 'header-left' && (
            <div className="p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${style?.themeColorId}30` }}>
                {profileSection && (
                  <div className="flex-1">
                    {renderSection(profileSection, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {headerLeftSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Equal Layout */}
          {selectedLayout === 'two-col-equal' && (
            <div className="flex w-full overflow-hidden">
              <div className="flex-1 p-6 flex flex-col gap-6">
                {leftSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'left', selectedLayout, false)}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-6 flex flex-col gap-6 bg-gray-50">
                {rightSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Width Layout */}
          {selectedLayout === 'full-width' && (
            <div className="p-8 bg-white flex flex-col gap-6 w-full overflow-hidden">
              {profileSection && (
                <div className="border-b pb-4 mb-4" style={{ borderColor: `${style?.themeColorId}30` }}>
                  {renderSection(profileSection, style, () => {}, 'right', selectedLayout, false)}
                </div>
              )}
              <div className="space-y-6">
                {headerLeftSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Harvard Classic Layout */}
          {selectedLayout === 'harvard-classic' && (
            <div className="flex w-full overflow-hidden">
              <div className="w-[30%] bg-gray-900 text-white p-6 flex flex-col gap-4">
                {profileSection && (
                  <div className="mb-4 pb-4 border-b border-white/20">
                    <div className="w-16 h-16 mb-3 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                      {profileSection.items?.[0]?.avatar ? (
                        <img src={profileSection.items[0].avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-white/70">person</span>
                      )}
                    </div>
                    {renderSection(profileSection, style, () => {}, 'left', selectedLayout, false)}
                  </div>
                )}
                {leftSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'left', selectedLayout, false)}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-6 bg-white flex flex-col gap-6">
                {rightSections.map(sec => (
                  <div key={sec.sectionCode} className="w-full">
                    {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Harvard GSAS Layout */}
          {selectedLayout === 'harvard-gsas' && (
            <div className="p-0 bg-white flex flex-col w-full">
              <div className="bg-gray-100 p-6 border-b" style={{ borderColor: '#e5e7eb' }}>
                <div className="flex items-center gap-6">
                  {profileSection && (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                      {profileSection.items?.[0]?.avatar ? (
                        <img src={profileSection.items[0].avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    {profileSection && renderSection(profileSection, style, () => {}, 'right', selectedLayout, false)}
                  </div>
                </div>
              </div>
              <div className="flex flex-1">
                <div className="flex-1 p-6 flex flex-col gap-6">
                  {leftSections.map(sec => (
                    <div key={sec.sectionCode} className="w-full">
                      {renderSection(sec, style, () => {}, 'left', selectedLayout, false)}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-6 bg-gray-50 flex flex-col gap-6">
                  {rightSections.map(sec => (
                    <div key={sec.sectionCode} className="w-full">
                      {renderSection(sec, style, () => {}, 'right', selectedLayout, false)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        </BuilderContext.Provider>
      </div>
    </div>
  );
};

export default EmployerCvPreview;
