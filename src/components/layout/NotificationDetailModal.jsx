import React from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotificationTarget } from '../../utils/notificationNavigation';
import useAuth from '../../hooks/useAuth';

const NotificationDetailModal = ({ isOpen, onClose, notification }) => {
  const { user } = useAuth();
  
  if (!isOpen || !notification) return null;

  const handleActionClick = () => {
    const target = getNotificationTarget(notification, user);
    if (!target?.path) return;
    
    if (target.path.startsWith('http://') || target.path.startsWith('https://')) {
      window.open(target.path, '_blank', 'noopener,noreferrer');
    } else {
      // If it's an internal route but we are in a modal, we might want to close the modal first
      // then let the parent handle navigation or we use window.location
      // Actually, we can use window.location.href or just use an <a> tag
    }
  };

  const target = getNotificationTarget(notification, user);
  const actionUrl = target?.path;
  const isExternal = actionUrl && (actionUrl.startsWith('http://') || actionUrl.startsWith('https://'));

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-900">Chi tiết thông báo</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <h4 className="text-xl font-bold text-slate-900 mb-2">{notification.title}</h4>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(notification.createdAt).toLocaleString('vi-VN')}
          </div>

          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
            {notification.content}
          </div>
        </div>

        {actionUrl && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            {isExternal ? (
              <a 
                href={actionUrl}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={onClose}
                className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Xem chi tiết <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link 
                to={actionUrl}
                onClick={onClose}
                className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Xem chi tiết <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default NotificationDetailModal;
