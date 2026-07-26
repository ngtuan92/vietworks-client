import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { getOrCreateConversation } from '../../../services/chatService';
import { Eye, MessageCircle, Download, CalendarPlus, FileText } from 'lucide-react';
import { TalentPoolInterviewModal } from './CVSearch';

const CVPreviewModal = ({ candidate, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [iframeHeight, setIframeHeight] = useState(1150);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SYNC_CV_HEIGHT' && e.data.height) {
        setIframeHeight(e.data.height);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    let objectUrl = '';
    const loadPreview = async () => {
      try {
        if (!candidate?.fileUrl) {
          setPreviewUrl(`/employer/talent-pool/cv-preview/${candidate.cvId}`);
          setLoading(false);
          return;
        }
        
        // Fetch the PDF via the proxy endpoint to bypass attachment headers
        const res = await api.get(`/view-pdf`, {
          params: { url: candidate.fileUrl },
          responseType: 'blob'
        });
        
        objectUrl = URL.createObjectURL(res.data);
        setPreviewUrl(objectUrl);
      } catch (err) {
        console.error('Failed to load CV preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreview();
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [candidate]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white border border-slate-200/60 premium-shadow rounded-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-900">Chi tiết CV: {candidate.fullName}</h3>
          <div className="flex items-center gap-3">
            {previewUrl && (
              candidate?.fileUrl ? (
                <a 
                  href={previewUrl} 
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90"
                  download={candidate.fileName || 'CV.pdf'}
                >
                  Tải CV xuống
                </a>
              ) : (
                <button
                  onClick={() => {
                    const iframe = document.getElementById('cv-preview-iframe');
                    if (iframe) iframe.contentWindow.postMessage('DOWNLOAD_TEMPLATE_CV', '*');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90"
                >
                  Tải CV xuống
                </button>
              )
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200">✕</button>
          </div>
        </div>
        <div className="flex-1 p-5 bg-slate-100 overflow-y-auto custom-scrollbar relative flex flex-col items-center">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error || !previewUrl ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Không thể tải file CV để xem trước. Bạn có thể tải xuống để xem.
            </div>
          ) : !candidate?.fileUrl ? (
            <iframe
              id="cv-preview-iframe"
              src={previewUrl}
              scrolling="no"
              className="w-[820px] border-none rounded-xl bg-white shadow-sm"
              style={{ height: `${iframeHeight}px`, flexShrink: 0 }}
              title="CV Preview"
            />
          ) : (
            <object data={previewUrl} type="application/pdf" className="w-full h-full rounded-xl border border-slate-200 shadow-sm bg-white">
              <embed src={previewUrl} type="application/pdf" className="w-full h-full bg-white" />
            </object>
          )}
        </div>
      </div>
    </div>
  );
};

const UnlockedCandidates = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);

  useEffect(() => {
    api.get('/employer/unlocked-candidates')
      .then(r => { if (r.data.success) setRows(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChat = async (candidateId) => {
    try {
      setChatLoadingId(candidateId);
      const res = await getOrCreateConversation(null, candidateId);
      if (res.success) {
        navigate(`/employer/messages?conversationId=${res.data._id}`);
      }
    } catch (error) {
      console.error('Lỗi khi mở chat:', error);
      alert('Không thể mở chat lúc này. Vui lòng thử lại sau.');
    } finally {
      setChatLoadingId(null);
    }
  };

  const handleDownloadCV = async (cv) => {
    if (!cv.fileUrl) return alert('Ứng viên này không có file CV.');
    try {
      const res = await api.get(`/view-pdf`, { params: { url: cv.fileUrl }, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.fileName || 'CV.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Không thể tải CV lúc này.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ứng viên đã mở khóa</h1>
        <p className="text-slate-600 mt-1">Quản lý danh sách ứng viên đã trả phí để xem đầy đủ thông tin.</p>
      </div>

      <section className="bg-white border border-slate-200/60 premium-shadow rounded-2xl transition-all overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#003f87] text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="text-left px-4 py-4 whitespace-nowrap">Ứng viên</th>
                <th className="text-center px-4 py-4 whitespace-nowrap">Mời phỏng vấn</th>
                <th className="text-left px-4 py-4 whitespace-nowrap">Ngày mở khóa</th>
                <th className="text-left px-4 py-4 whitespace-nowrap border-l border-blue-100/50">Tên Hồ Sơ (CV)</th>
                <th className="text-left px-4 py-4 whitespace-nowrap">Thao tác CV</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">Chưa có ứng viên nào được mở khóa.</td>
                </tr>
              ) : (
                rows.flatMap((r, candidateIndex) => {
                  const candidate = r.candidateId || {};
                  const cvs = (r.allCvs && r.allCvs.length > 0) ? r.allCvs : [{}];
                  const bgClass = candidateIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50/20';

                  return cvs.map((cv, index) => (
                    <tr key={`${r._id}-${cv._id || index}`} className={`border-t ${index === 0 ? 'border-slate-200' : 'border-slate-100 border-dashed'} transition-colors ${bgClass}`}>
                      {index === 0 && (
                        <>
                          <td rowSpan={cvs.length} className="px-4 py-4 font-semibold text-slate-900 align-top border-r border-slate-100/50">
                            {candidate.fullName || '—'}
                            <div className="text-sm font-medium text-slate-600 mt-1">{candidate.email || '—'}</div>
                            <div className="text-xs font-normal text-slate-500">{candidate.phone || '—'}</div>
                          </td>
                          <td rowSpan={cvs.length} className="px-4 py-4 align-top border-r border-slate-100/50">
                            <div className="flex flex-col gap-2 items-center w-40">
                              <button 
                                onClick={() => setInviteTarget({ ...candidate, applications: r.applications, cvId: cvs[0]?._id })}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-xs shadow-sm shadow-emerald-600/20 w-full justify-center"
                                title="Mời phỏng vấn"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                Mời phỏng vấn
                              </button>
                              
                              {r.applications && r.applications.length > 0 && (
                                <div className="mt-2 flex flex-col gap-1 w-full border-t border-slate-100 pt-2">
                                  <span className="text-[10px] text-slate-500 font-medium text-center uppercase mb-1">Các vị trí đã mời</span>
                                  {r.applications.map(app => (
                                    <Link 
                                      key={app._id}
                                      to={`/employer/applications/${app._id}`}
                                      className="inline-flex items-center justify-between gap-1.5 px-2 py-1.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100 transition-colors w-full"
                                      title={`Xem hồ sơ: ${app.jobTitle}`}
                                    >
                                      <span className="truncate flex-1 text-left">{app.jobTitle || 'Công việc'}</span>
                                      <FileText className="w-3 h-3 shrink-0" />
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td rowSpan={cvs.length} className="px-4 py-4 whitespace-nowrap align-top border-r border-slate-100/50">
                            {r.unlockedAt ? new Date(r.unlockedAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                        </>
                      )}
                      
                      <td className={`px-4 py-4 font-medium text-[#003f87]`}>
                        {cv.title || '—'}
                      </td>
                      <td className={`px-4 py-4`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <button 
                            onClick={() => handleChat(candidate._id)}
                            disabled={chatLoadingId === candidate._id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#003f87] text-[#003f87] font-medium hover:bg-blue-50 disabled:opacity-70 transition-colors text-xs"
                            title="Nhắn tin với ứng viên"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {chatLoadingId === candidate._id ? 'Đang...' : 'Chat'}
                          </button>
                          {true && (
                            <button 
                              onClick={() => {
                                if (cv.fileUrl) {
                                  setPreviewTarget({ ...candidate, fileUrl: cv.fileUrl, fileName: cv.fileName });
                                } else {
                                  setPreviewTarget({ ...candidate, cvId: cv._id });
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#003f87] font-medium hover:bg-blue-100 transition-colors text-xs"
                              title="Xem CV"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem CV
                            </button>
                          )}
                          {cv.fileUrl ? (
                            <button 
                              onClick={() => handleDownloadCV(cv)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-xs"
                              title="Tải CV"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Tải CV
                            </button>
                          ) : (
                            <button 
                              onClick={() => window.open(`/employer/talent-pool/cv-preview/${cv._id}?download=true`, '_blank')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-xs"
                              title="Tải CV"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Tải CV
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {previewTarget && (
        <CVPreviewModal 
          candidate={previewTarget} 
          onClose={() => setPreviewTarget(null)} 
        />
      )}
      {inviteTarget && (
        <TalentPoolInterviewModal 
          candidate={inviteTarget} 
          onClose={() => setInviteTarget(null)}
          onSuccess={(newApp) => {
            setInviteTarget(null);
            if (newApp) {
              setRows(prev => prev.map(r => {
                if (r.candidateId?._id === inviteTarget._id) {
                  return {
                    ...r,
                    applications: [newApp, ...(r.applications || [])]
                  };
                }
                return r;
              }));
            }
          }}
        />
      )}
    </div>
  );
};

export default UnlockedCandidates;
