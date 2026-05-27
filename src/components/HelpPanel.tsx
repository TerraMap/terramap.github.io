import { FolderOutlined, GlobalOutlined } from '@ant-design/icons';
import { Space, Table, Typography } from 'antd';
import firstBy from 'thenby';
import { useDetectOS, type PathEntry } from '../hooks/useDetectOS';
import { keyboardShortcuts } from '../lib/keyboardShortcuts';
import PathOsTabs from './PathOsTabs';
import ToolbarButton from './ToolbarButton';

const { Title, Paragraph, Text } = Typography;

const worldPaths: PathEntry[] = [
  { os: 'linux', label: '', path: '~/.local/share/Terraria' },
  { os: 'linux', label: '(Steam Cloud)', path: '~/.local/share/Steam/userdata/{YOUR_USER_ID}/105600/remote', copyPath: '~/.local/share/Steam/userdata/' },
  { os: 'macos', label: '', path: '~/Library/Application Support/Terraria' },
  { os: 'macos', label: '(Steam Cloud)', path: '~/Library/Application Support/Steam/userdata/{YOUR_USER_ID}/105600/remote', copyPath: '~/Library/Application Support/Steam/userdata/' },
  { os: 'windows', label: '', path: '%USERPROFILE%\\Documents\\My Games\\Terraria\\Worlds' },
  { os: 'windows', label: '(Steam Cloud)', path: 'C:\\Program Files (x86)\\Steam\\userdata\\{YOUR_USER_ID}\\105600\\remote', copyPath: 'C:\\Program Files (x86)\\Steam\\userdata\\' },
];

export function HelpPanel(
  { directoryInputRef, worldFileInputRef }:
    {
      directoryInputRef: React.RefObject<HTMLInputElement | null>;
      worldFileInputRef: React.RefObject<HTMLInputElement | null>;
    }
) {
  const userOS = useDetectOS();

  return (
    <div style={{ padding: '0px 32px 32px', maxWidth: 900, margin: '0 auto' }}>
      <Typography>
        <Title level={3}>Getting Started</Title>
        <Paragraph>
          TerraMap is an interactive Terraria world map viewer.
        </Paragraph>
        <Paragraph>
          To use TerraMap, please start by doing one of the following:
        </Paragraph>

        To avoid spoilers:

        <ul>
          <li>
            Click the <ToolbarButton
              shortcutHandler="onOpenFolder"
              icon={<FolderOutlined />}
              onClick={() => directoryInputRef.current?.click()}
            >
              Folder
            </ToolbarButton> button to select a folder that contains world and player map files from your computer.<br />
            <b>Note</b>: you may see a warning about {"Uploading"} files. The files are read in your browser and will not actually be uploaded.
          </li>
        </ul>

        {"If you don't care about spoilers:"}

        <ul>
          <li>
            Click the <ToolbarButton
              shortcutHandler="onOpenWorld"
              icon={<GlobalOutlined />}
              onClick={() => worldFileInputRef.current?.click()}
            >
              World
            </ToolbarButton> button to select a Terraria <Text code>.wld</Text> file from your computer.
          </li>
          <li>Drag and drop a Terraria <Text code>.wld</Text> file from your computer into this page.</li>
        </ul>
        <Paragraph>
          Terraria world and player map files are usually located at (click to copy path):
        </Paragraph>
        <PathOsTabs userOS={userOS} paths={worldPaths} />
        <Paragraph>
          Once a world file is loaded, you can pan and zoom the map, search for blocks & items, view chest contents, and more.
        </Paragraph>
        <Title level={4}>Keyboard Shortcuts</Title>
      </Typography>

      <Table
        dataSource={keyboardShortcuts}
        rowKey="label"
        pagination={false}
        size="small"
        columns={[
          {
            dataIndex: 'key',
            title: "Shortcut",
            render: (key: string, { shift }) => <kbd>{shift ? `Shift + ${key}` : key}</kbd>,
            sorter: firstBy('key').thenBy('shift')
          },
          {
            dataIndex: 'label',
            title: "Command",
            render: (label: string, { icon }) => <Space>{icon ?? <span style={{ paddingLeft: 14 }} />}{label}</Space>,
            sorter: firstBy('label')
          }
        ]}
      />

    </div >
  );
}
