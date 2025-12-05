import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme;
  return stored === 'dark' || stored === 'light' ? stored : 'light';
};

const applyTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: typeof window !== 'undefined' ? getStoredTheme() : 'light',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));

