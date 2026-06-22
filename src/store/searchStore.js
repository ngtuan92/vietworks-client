import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  globalKeyword: '',
  globalLocation: '',
  setGlobalKeyword: (globalKeyword) => set({ globalKeyword }),
  setGlobalLocation: (globalLocation) => set({ globalLocation }),
}));
