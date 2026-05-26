import { MoonOutlined, SunOutlined, SwapOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
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

  const autoTitle = "Automatically change background and content based on your system settings and theme.";

  return themeNames.map((key) => ({
    key,
    label: key === 'auto' ? <Tooltip title={autoTitle} placement="bottom">Auto</Tooltip> : capitalizeFirstLetter(key),
    // disabled: key === themeName,
    icon: key === 'light' ? <SunOutlined />
      : key === 'dark' ? <MoonOutlined />
        : <Tooltip title={autoTitle} placement="bottom">
          <SwapOutlined style={{ marginRight: 8 }} />
        </Tooltip>,
    onClick: () => {
      setThemeName(key);
    },
    style: {
      textDecorationLine: key === themeName ? 'underline' : undefined,
    },
  }));
}
