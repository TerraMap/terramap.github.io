import { createContext, useEffect, useState } from 'react';

export type ThemeNames = 'dark' | 'light' | 'auto';

export interface ThemeNameContextProps {
  isDarkMode: boolean;
  themeName: ThemeNames;
  setThemeName: (value: ThemeNames) => void;
}

export const ThemeNameContext = createContext<ThemeNameContextProps | undefined>(undefined);

export const ThemeNameStorageKey = 'theme';

export function useThemeName() {
  const getMediaQueryList = () =>
    typeof window === 'undefined' ? undefined : window.matchMedia('(prefers-color-scheme: dark)');

  const [mediaQueryList, setMediaQueryList] = useState(() => getMediaQueryList());

  // default to dark mode if the system theme is unspecified
  const systemDarkModeDefault = mediaQueryList ? mediaQueryList.matches : true;

  // system theme
  const [systemDarkMode, setSystemDarkMode] = useState(systemDarkModeDefault);

  // watch for system theme changes
  useEffect(() => {
    if (mediaQueryList) {
      const onChange = (ev: MediaQueryListEvent) => {
        setSystemDarkMode(ev.matches);
      };

      // when this component is mounted for the first time, subscribe to the system theme change event handler
      mediaQueryList.addEventListener('change', onChange);

      // when this component is unmounted, unsubscript from the system theme change event handler
      return () => mediaQueryList.removeEventListener('change', onChange);
    }
  }, [mediaQueryList]);

  const systemThemeName: ThemeNames = systemDarkMode ? 'dark' : 'light';

  // user theme preference from local storage
  const userThemeValue = getThemeNameFromLocalStorage();
  const userThemeName: ThemeNames = userThemeValue === 'dark' ? 'dark' : userThemeValue === 'light' ? 'light' : 'auto';

  // final theme name to use
  const finalThemeName = userThemeName;

  const isDarkMode = finalThemeName === 'auto' ? systemThemeName === 'dark' : finalThemeName === 'dark';

  return {
    isDarkMode,
    themeName: finalThemeName,
    setTheme: (value: ThemeNames) => {
      setThemeNameToLocalStorage(value);
      setMediaQueryList(getMediaQueryList());
    },
  };
}

function getThemeNameFromLocalStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(ThemeNameStorageKey);
}

function setThemeNameToLocalStorage(value: ThemeNames) {
  localStorage.setItem(ThemeNameStorageKey, value);
}
