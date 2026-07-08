import { GlobalOutlined } from '@ant-design/icons';
import { Radio, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { languages } from './LanguageDropdown';

export default function LanguageSelect() {
  const { i18n, t } = useTranslation();

  return (
    <Space orientation='horizontal'>
      <GlobalOutlined />
      <div>{t('language')}</div>
      <Radio.Group
        onChange={async (e) => {
          if (typeof e.target.value !== 'string') return;
          const key = e.target.value;
          await i18n.changeLanguage(key);
          localStorage.setItem('language', key);
        }}
        options={languages.map(({ key, label }) => ({
          value: key,
          label
        }))}
        value={i18n.resolvedLanguage ?? i18n.language}
        optionType="button"
        buttonStyle="solid"
      />
    </Space>
  );
}
