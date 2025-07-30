import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      theme: 'light',
      language: 'vi',
      
      login: (user, tokens) => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// App Store for general app state
export const useAppStore = create((set, get) => ({
  sidebarCollapsed: false,
  loading: false,
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setLoading: (loading) => set({ loading }),
}));

