import { create } from 'zustand';

export const useAuthStore = create((set) => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('accessToken');
  
  let initialUser = null;
  try {
    initialUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  return {
    user: initialUser,
    accessToken: storedToken,
    isAuthenticated: !!storedToken && !!initialUser,
    
    setAuth: (user, accessToken) => {
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
      
      set({ 
        user, 
        accessToken, 
        isAuthenticated: !!accessToken && !!user 
      });
    },
    
    clearAuth: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
      });
    },
    
    updateUser: (updatedUser) => {
      set((state) => {
        const newUser = state.user ? { ...state.user, ...updatedUser } : updatedUser;
        localStorage.setItem('user', JSON.stringify(newUser));
        return { user: newUser };
      });
    }
  };
});

export default useAuthStore;
