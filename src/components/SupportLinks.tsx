import { GithubOutlined, HeartOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { DONATE_URL, GITHUB_URL } from '../lib/support';

/** The support message followed by Donate / Star on GitHub buttons. */
export function SupportLinks({ size = 'middle' }: { size?: 'small' | 'middle' }) {
  const { t } = useTranslation();

  return (
    <Space wrap size="small" align="center">
      <span>{t('support_message')}</span>
      <Space.Compact>
        <Button size={size} icon={<HeartOutlined />} href={DONATE_URL} target="_blank" rel="noopener noreferrer">
          {t('donate')}
        </Button>
        <Button size={size} icon={<GithubOutlined />} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          {t('star_on_github')}
        </Button>
      </Space.Compact>
    </Space>
  );
}
