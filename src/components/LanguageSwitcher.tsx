import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';

const languages = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'ru', label: 'Русский' },
  { key: 'zh-CN', label: '中文 (简体)' },
  { key: 'pt-BR', label: 'Português (Brasil)' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const items: MenuProps['items'] = languages.map(({ key, label }) => ({
    key,
    label,
    onClick: async () => {
      await i18n.changeLanguage(key);
      localStorage.setItem('language', key);
    },
  }));

  return (
    <Dropdown menu={{
      items: [
        {
          key: 'language',
          label: 'Language',
          type: 'group'
        },
        ...items
      ], selectedKeys: [i18n.resolvedLanguage ?? i18n.language]
    }}>
      <Button icon={<GlobalOutlined />} />
    </Dropdown>
  );
}
