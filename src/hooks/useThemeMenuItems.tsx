import { MoonOutlined, SunOutlined, SwapOutlined } from '@ant-design/icons';
import { Tooltip, type MenuProps } from 'antd';
import { use } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeNames } from './useThemeName';
import { ThemeNameContext } from './useThemeName';

type MenuItem = Required<MenuProps>['items'][number];

export default function useThemeMenuItems(): MenuItem[] {
  const { t } = useTranslation();
  const themeNameContext = use(ThemeNameContext);
  const themeName = themeNameContext?.themeName;
  const setThemeName =
    themeNameContext?.setThemeName ??
    (() => {
      // console.log();
    });

  const themeNames: ThemeNames[] = ['light', 'dark', 'auto'];

  const autoTitle = t('themes.auto_description');

  return [
    {
      key: 'theme',
      label: t('theme'),
      type: 'group',
    },
    ...themeNames.map((key) => ({
      key,
      label: key === 'auto' ? <Tooltip title={autoTitle} placement="bottom">{t('themes.auto')}</Tooltip> : t(`themes.${key}`),
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
    }))];
}
