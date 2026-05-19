import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';

const LinkedinCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('LinkedIn Login Error:', error);
        navigate('/login');
        return;
      }

      if (code) {
        try {
          const res = await authService.linkedinLoginGeneric({ code });

          if (res.success) {
            if (res.user?.role === 'EMPLOYER') {
              navigate('/employer/dashboard');
              return;
            }
            if (res.user?.role === 'ADMIN') {
              navigate('/admin/dashboard');
              return;
            }
            navigate('/');
          }
        } catch (err) {
          console.error('LinkedIn Login API Error:', err);
          navigate('/login');
        }
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-on-surface-variant font-body-md">Authenticating with LinkedIn...</p>
      </div>
    </div>
  );
};

export default LinkedinCallback;
