import { create } from 'zustand';

export const useAppStore = create((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

export default useAppStore;
