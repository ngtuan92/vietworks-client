import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, UserPlus, LogIn, X } from 'lucide-react';

const ACTION_MESSAGES = {
  save_job:       { title: 'Lưu việc làm', desc: 'Đăng nhập để lưu tin tuyển dụng và xem lại sau.' },
  apply_job:      { title: 'Ứng tuyển việc làm', desc: 'Đăng nhập để nộp hồ sơ ứng tuyển ngay.' },
  follow_company: { title: 'Theo dõi công ty', desc: 'Đăng nhập để theo dõi công ty và nhận thông báo tuyển dụng mới.' },
  manage_cv:      { title: 'Quản lý CV', desc: 'Đăng nhập để tạo, chỉnh sửa và quản lý CV của bạn.' },
  buy_package:    { title: 'Mua gói dịch vụ', desc: 'Đăng nhập để mua gói Boost CV và tăng cơ hội việc làm.' },
  ai_review:      { title: 'AI Review CV', desc: 'Đăng nhập để sử dụng công cụ phân tích CV bằng trí tuệ nhân tạo.' },
};

const DEFAULT_MESSAGE = {
  title: 'Yêu cầu đăng nhập',
  desc: 'Đăng nhập hoặc đăng ký để tiếp tục sử dụng chức năng này.',
};

/**
 * Props:
 *   open        — boolean
 *   action      — key từ ACTION_MESSAGES (optional)
 *   onClose     — () => void
 */
const JobseekerAuthModal = ({ open, action = '', onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const msg = ACTION_MESSAGES[action] || DEFAULT_MESSAGE;

  const goLogin = () => {
    onClose();
    navigate('/login', { state: { from: location } });
  };

  const goRegister = () => {
    onClose();
    navigate('/register', { state: { from: location } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero */}
        <div className="flex flex-col items-center justify-center pt-10 pb-6 px-6 bg-gradient-to-b from-blue-50 to-white border-b border-slate-100">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-black text-slate-900 text-center">{msg.title}</h3>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">{msg.desc}</p>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={goLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
          <button
            onClick={goRegister}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký tài khoản miễn phí
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition py-1 cursor-pointer"
          >
            Tiếp tục duyệt mà không đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobseekerAuthModal;
