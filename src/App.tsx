import { ConfigProvider, theme } from 'antd';
import AppContent from './AppContent';
import { ThemeNameContext, useThemeName, type ThemeNames } from './hooks/useThemeName';

export default function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { isDarkMode, themeName, setTheme } = useThemeName();

  const updateThemeName = (value: ThemeNames) => {
    setTheme(value);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <ThemeNameContext
        value={{
          isDarkMode,
          themeName,
          setThemeName: updateThemeName,
        }}
      >
        <AppContent />
      </ThemeNameContext>
    </ConfigProvider>
  );
}
