import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && message) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, message, onClose]);

  if (!message) return null;

  const isError = type === 'error';

  const toastContent = (
    <div className="fixed top-20 right-4 z-[999999] transition-all duration-300 ease-in-out">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
        {isError ? <AlertCircle className="w-5 h-5 text-rose-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
        <p className="text-sm font-semibold">{message}</p>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors">
          <X className={`w-4 h-4 ${isError ? 'text-rose-500' : 'text-emerald-500'}`} />
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(toastContent, document.body) : toastContent;
};

export default Toast;
