import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
    isDarkMode: true,

    initializeTheme: () => {
        // Always use dark mode for the premium dark theme
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        set({ isDarkMode: true });
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
