import { MoonOutlined, SunOutlined, SwapOutlined } from '@ant-design/icons';
import { use } from 'react';
import { capitalizeFirstLetter } from '../lib/string';
import { ThemeNameContext, ThemeNames } from './useThemeName';

export default function useThemeMenuItems() {
  const themeNameContext = use(ThemeNameContext);
  const themeName = themeNameContext?.themeName;
  const setThemeName =
    themeNameContext?.setThemeName ??
    (() => {
      // console.log();
    });

  const themeNames: ThemeNames[] = ['light', 'dark', 'auto'];

  return themeNames.map((key) => ({
    key,
    label: capitalizeFirstLetter(key),
    // disabled: key === themeName,
    icon: key === 'light' ? <SunOutlined /> : key === 'dark' ? <MoonOutlined /> : <SwapOutlined />,
    onClick: () => {
      setThemeName(key);
    },
    title:
      key === 'auto'
        ? 'Automatically change background and content based on your system settings and theme.'
        : undefined,
    style: {
      textDecorationLine: key === themeName ? 'underline' : undefined,
    },
  }));
}
