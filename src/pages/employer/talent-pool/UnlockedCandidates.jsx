import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { getOrCreateConversation } from '../../../services/chatService';

const CVPreviewModal = ({ candidate, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    const loadPreview = async () => {
      try {
        if (!candidate?.fileUrl) {
          setError(true);
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
              <a 
                href={previewUrl} 
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90"
                download={candidate.fileName || 'CV.pdf'}
              >
                Tải xuống
              </a>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 font-bold px-3">✕</button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10 text-slate-500 gap-3">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-primary rounded-full animate-spin"></div>
              <p>Đang tải tài liệu...</p>
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-100">
              Không thể tải file CV để xem trước. Bạn có thể tải xuống để xem.
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="CV Preview"
            />
          ) : null}
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
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {['Ứng viên', 'Vị trí', 'Email/SĐT', 'Ngày mở khóa', 'Chi phí', 'Hành động'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Chưa có ứng viên nào được mở khóa.</td>
                </tr>
              ) : (
                rows.map((r) => {
                  const candidate = r.candidateId || {};
                  const cv = r.cvId || {};
                  return (
                    <tr key={r._id} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-semibold text-slate-900">{candidate.fullName || '—'}</td>
                      <td className="px-4 py-4">{cv.title || '—'}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{candidate.email || '—'}</div>
                        <div className="text-xs text-slate-500">{candidate.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {r.unlockedAt ? new Date(r.unlockedAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {r.amountCharged ? `${Number(r.amountCharged).toLocaleString('vi-VN')} VNĐ` : 'Miễn phí / Trừ lượt'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {cv.fileUrl && (
                            <button 
                              onClick={() => setPreviewTarget({ ...candidate, fileUrl: cv.fileUrl, fileName: cv.fileName })}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                            >
                              Xem CV
                            </button>
                          )}
                          <button 
                            onClick={() => handleChat(candidate._id)}
                            disabled={chatLoadingId === candidate._id}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
                          >
                            {chatLoadingId === candidate._id ? 'Đang...' : 'Chat'}
                          </button>
                          {cv.fileUrl && (
                            <button 
                              onClick={() => handleDownloadCV(cv)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                            >
                              Tải CV
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
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
    </div>
  );
};

export default UnlockedCandidates;