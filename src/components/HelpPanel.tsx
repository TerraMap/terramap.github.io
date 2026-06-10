import { GlobalOutlined } from '@ant-design/icons';
import { Space, Spin, Table, Typography } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import firstBy from 'thenby';
import { useDetectOS, type PathEntry } from '../hooks/useDetectOS';
import { keyboardShortcuts } from '../lib/keyboardShortcuts';
import LanguageSelect from './LanguageSelect';
import PathOsTabs from './PathOsTabs';
import ToolbarButton from './ToolbarButton';

const { Title, Paragraph, Text } = Typography;

export function HelpPanel(
  { directoryInputRef, worldFileInputRef, checkingNative, nativeAvailable, onChooseWorld }:
    {
      directoryInputRef: React.RefObject<HTMLInputElement | null>;
      worldFileInputRef: React.RefObject<HTMLInputElement | null>;
      checkingNative?: boolean;
      nativeAvailable?: boolean;
      onChooseWorld: () => void;
    }
) {
  const userOS = useDetectOS();
  const { t } = useTranslation();

  const worldPaths: PathEntry[] = [
    { os: 'linux', label: '', path: '~/.local/share/Terraria' },
    { os: 'linux', label: t('steam_cloud'), path: '~/.local/share/Steam/userdata/{YOUR_USER_ID}/105600/remote', copyPath: '~/.local/share/Steam/userdata/' },
    { os: 'macos', label: '', path: '~/Library/Application Support/Terraria' },
    { os: 'macos', label: t('steam_cloud'), path: '~/Library/Application Support/Steam/userdata/{YOUR_USER_ID}/105600/remote', copyPath: '~/Library/Application Support/Steam/userdata/' },
    { os: 'windows', label: '', path: '%USERPROFILE%\\Documents\\My Games\\Terraria\\Worlds' },
    { os: 'windows', label: t('steam_cloud'), path: 'C:\\Program Files (x86)\\Steam\\userdata\\{YOUR_USER_ID}\\105600\\remote', copyPath: 'C:\\Program Files (x86)\\Steam\\userdata\\' },
  ];

  const openButton = checkingNative
    ? <Spin />
    : nativeAvailable
      ? <ToolbarButton icon={<GlobalOutlined />} onClick={onChooseWorld}>{t('choose_world')}</ToolbarButton>
      : <ToolbarButton shortcutHandler="onOpenFolder" onClick={() => directoryInputRef.current?.click()}>{t('folder')}</ToolbarButton>;

  const worldButton = <ToolbarButton shortcutHandler="onOpenWorld" onClick={() => worldFileInputRef.current?.click()}>{t('open_world_file')}</ToolbarButton>;

  return (
    <div style={{ padding: '0px 32px 32px', maxWidth: 900, margin: '0 auto' }}>
      <Typography style={{ paddingTop: '1rem' }}>
        <LanguageSelect />
        <Title level={3}>{t('getting_started')}</Title>
        <Paragraph>{t('terramap_description')}</Paragraph>
        <Paragraph>{t('get_started_intro')}</Paragraph>

        {t('to_avoid_spoilers')}

        <ul>
          <li>
            <Trans i18nKey="open_folder_instruction" components={[openButton]} /><br />
            <b>{t('note')}</b>: {t('upload_warning')}
          </li>
        </ul>

        {t('if_no_spoilers')}

        <ul>
          <li>
            <Trans i18nKey="open_world_instruction" components={[worldButton]} />
          </li>
          <li><Trans i18nKey="drag_drop_description" components={{ code: <Text code /> }} /></li>
        </ul>
        <Paragraph>{t('world_files_location')}</Paragraph>
        <PathOsTabs userOS={userOS} paths={worldPaths} />
        <Paragraph>{t('world_loaded_description')}</Paragraph>
        <Title level={4}>{t('keyboard_shortcuts')}</Title>
      </Typography>

      <Table
        dataSource={keyboardShortcuts}
        rowKey="labelKey"
        pagination={false}
        size="small"
        columns={[
          {
            dataIndex: 'key',
            title: t('shortcut'),
            render: (key: string, { shift }) => (
              <kbd>
                {shift ? `Shift + ${key}` : key}
              </kbd>
            ),
            sorter: firstBy('key').thenBy('shift')
          },
          {
            dataIndex: 'labelKey',
            title: t('command'),
            render: (labelKey: string, { icon }) => (
              <Space>
                {icon ?? <span style={{ paddingLeft: 14 }} />}{t(labelKey)}
              </Space>
            ),
            sorter: (a, b) => t(a.labelKey).localeCompare(t(b.labelKey))
          }
        ]}
      />

    </div>
  );
}
