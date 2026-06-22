import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Download } from 'lucide-react';

const InlinePdfViewer = ({ url, className }) => {
  const [blobUrl, setBlobUrl] = useState(url?.startsWith('blob:') ? url : null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!url?.startsWith('blob:'));

  useEffect(() => {
    if (!url || url.startsWith('blob:')) return;
    
    let objectUrl = null;
    let isMounted = true;
    
    setLoading(true);
    setError(false);

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const fetchUrl = url.includes('cloudinary.com') 
      ? `${apiBaseUrl}/view-pdf?url=${encodeURIComponent(url)}` 
      : url;
    const accessToken = localStorage.getItem('accessToken');

    fetch(fetchUrl, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then(blob => {
        if (!isMounted) return;
        const fileBlob = new Blob([blob], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(fileBlob);
        setBlobUrl(objectUrl);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching PDF:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 ${className}`}>
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="mb-3 text-sm">Không thể tải nội dung PDF để xem trước.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer" 
          className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Tải về hoặc mở tab mới
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 border border-slate-200 text-slate-500 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-sm">Đang tải PDF...</span>
      </div>
    );
  }

  return <iframe src={blobUrl} className={className} title="Xem trước PDF" />;
};

export default InlinePdfViewer;
