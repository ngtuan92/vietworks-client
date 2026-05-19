import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

const EmployerLinkedinCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        navigate('/employer/login');
        return;
      }

      if (!code) {
        navigate('/employer/login');
        return;
      }

      try {
        const result = await authService.linkedinLoginEmployer({ code });
        if (result.success) {
          navigate('/employer/dashboard');
          return;
        }
        navigate('/employer/login');
      } catch (err) {
        navigate('/employer/login');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-on-surface-variant font-body-md">Đang xác thực LinkedIn cho nhà tuyển dụng...</p>
      </div>
    </div>
  );
};

export default EmployerLinkedinCallback;
