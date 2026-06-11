import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook bảo vệ hành động cá nhân hóa của Jobseeker.
 *
 * Cách dùng:
 *   const { guard, AuthModal } = useJobseekerAuth();
 *
 *   // Bọc bất kỳ hành động nào cần đăng nhập:
 *   <button onClick={guard(() => handleSaveJob())}>Lưu việc làm</button>
 *
 *   // Đặt modal ở cuối JSX:
 *   <AuthModal />
 */
const useJobseekerAuth = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [modal, setModal] = useState({ open: false, action: '' });

  const isJobseeker = isAuthenticated && user?.role === 'JOBSEEKER';

  /**
   * guard(fn, actionLabel?)
   * Trả về event handler: nếu đã là Jobseeker thì chạy fn(), ngược lại mở modal.
   */
  const guard = useCallback(
    (fn, actionLabel = '') =>
      (...args) => {
        if (isJobseeker) {
          return fn(...args);
        }
        setModal({ open: true, action: actionLabel });
      },
    [isJobseeker]
  );

  const closeModal = useCallback(() => setModal({ open: false, action: '' }), []);

  return { guard, isJobseeker, modalState: modal, closeModal };
};

export default useJobseekerAuth;
