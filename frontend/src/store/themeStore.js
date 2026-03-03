import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
    isDarkMode: false,

    initializeTheme: () => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored ? stored === 'dark' : prefersDark;

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        set({ isDarkMode: isDark });
    },

    toggleTheme: () => {
        const newIsDark = !get().isDarkMode;
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        set({ isDarkMode: newIsDark });
    },

    setTheme: (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        set({ isDarkMode: isDark });
    },
}));

export default useThemeStore;
