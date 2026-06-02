import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  const login = async (credentials, roleType = 'generic') => {
    let response;
    if (roleType === 'jobseeker') {
      response = await authService.loginJobseeker(credentials);
    } else if (roleType === 'employer') {
      response = await authService.loginEmployer(credentials);
    } else {
      response = await authService.login(credentials);
    }

    if (response && response.success) {
      setAuth(response.user, response.accessToken);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isEmployer: user?.role === 'EMPLOYER',
    isJobseeker: user?.role === 'JOBSEEKER',
    isAdmin: user?.role === 'ADMIN',
    setAuth,
    clearAuth,
    updateUser,
    login,
    logout,
  };
};

export default useAuth;
