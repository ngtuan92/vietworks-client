import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    type: 'info', // 'success' | 'error' | 'warning' | 'info' | 'confirm'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    closeText: 'Đóng'
  });

  const show = useCallback((options) => {
    setConfig({
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || 'Đồng ý',
      cancelText: options.cancelText || 'Hủy',
      closeText: options.closeText || 'Đóng'
    });
    setIsOpen(true);
  }, []);

  const success = useCallback((message, title = 'Thành công', onClose = null) => {
    show({ type: 'success', title, message, onCancel: onClose });
  }, [show]);

  const error = useCallback((message, title = 'Lỗi', onClose = null) => {
    show({ type: 'error', title, message, onCancel: onClose });
  }, [show]);

  const warning = useCallback((message, title = 'Cảnh báo', onClose = null) => {
    show({ type: 'warning', title, message, onCancel: onClose });
  }, [show]);

  const info = useCallback((message, title = 'Thông báo', onClose = null) => {
    show({ type: 'info', title, message, onCancel: onClose });
  }, [show]);

  const confirm = useCallback((message, onConfirm, onCancel = null, title = 'Xác nhận') => {
    show({ type: 'confirm', title, message, onConfirm, onCancel });
  }, [show]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (config.onCancel) {
      config.onCancel();
    }
  }, [config]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (config.onConfirm) {
      config.onConfirm();
    }
  }, [config]);

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <FiCheckCircle className="w-16 h-16 text-emerald-500 animate-bounce-short" />;
      case 'error':
        return <FiXCircle className="w-16 h-16 text-rose-500 animate-shake" />;
      case 'warning':
        return <FiAlertTriangle className="w-16 h-16 text-amber-500 animate-pulse" />;
      case 'confirm':
        return <FiInfo className="w-16 h-16 text-indigo-500" />;
      default:
        return <FiInfo className="w-16 h-16 text-sky-500" />;
    }
  };

  const getHeaderBg = () => {
    switch (config.type) {
      case 'success':
        return 'bg-emerald-50';
      case 'error':
        return 'bg-rose-50';
      case 'warning':
        return 'bg-amber-50';
      case 'confirm':
        return 'bg-indigo-50';
      default:
        return 'bg-sky-50';
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      warning(
        'Phiên làm việc của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục.',
        'Yêu cầu đăng nhập',
        () => {
          window.location.href = '/login';
        }
      );
    };

    window.addEventListener('unauthorized_access', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized_access', handleUnauthorized);
    };
  }, [warning]);

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, confirm }}>
      {children}

      {/* Modern Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 opacity-100 animate-fade-in-scale">
            {/* Header / Accent Bar */}
            <div className={`flex items-center justify-center p-8 ${getHeaderBg()} border-b border-gray-100`}>
              {getIcon()}
            </div>

            {/* Content Body */}
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {config.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {config.message}
              </p>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 pb-6 flex items-center gap-3">
              {config.type === 'confirm' ? (
                <>
                  <button
                    onClick={close}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    {config.cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 border border-indigo-700 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {config.confirmText}
                  </button>
                </>
              ) : (
                <button
                  onClick={close}
                  className={`w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                    config.type === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                      : config.type === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                      : config.type === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
                      : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100'
                  }`}
                >
                  {config.closeText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
