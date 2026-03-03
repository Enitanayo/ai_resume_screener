import useThemeStore from '../store/themeStore';

/**
 * Custom hook for theme management
 */
export const useTheme = () => {
    const { isDarkMode, toggleTheme, setTheme, initializeTheme } = useThemeStore();

    return {
        isDarkMode,
        toggleTheme,
        setTheme,
        initializeTheme,
    };
};

export default useTheme;
