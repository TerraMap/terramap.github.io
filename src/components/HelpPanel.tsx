import { Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

export function HelpPanel() {
  return (
    <div style={{ padding: '80px 32px 32px', maxWidth: 700, margin: '0 auto' }}>
      <Typography>
        <Title level={3}>Getting Started</Title>
        <Paragraph>
          TerraMap is an interactive Terraria world map viewer.
        </Paragraph>
        <Paragraph>
          Click <Text strong>Open</Text> to select a Terraria <Text code>.wld</Text> file from your computer.
        </Paragraph>
        <Paragraph>
          World files are usually located at:
        </Paragraph>
        <ul>
          <li><Text strong>Linux (Steam Cloud)</Text>: <Text code>~/.local/share/Steam/userdata/&#123;YOUR_USER_ID&#125;/105600/remote/worlds</Text></li>
          <li><Text strong>Linux</Text>: <Text code>~/.local/share/Terraria/Worlds</Text></li>
          <li><Text strong>MacOS (Steam Cloud)</Text>: <Text code>~/Library/Application Support/Steam/userdata/&#123;YOUR_USER_ID&#125;/105600/remote/worlds</Text></li>
          <li><Text strong>MacOS</Text>: <Text code>~/Library/Application Support/Terraria/Worlds</Text></li>
          <li><Text strong>Windows (Steam Cloud)</Text>: <Text code>C:\Program Files (x86)\Steam\userdata\&#123;YOUR_USER_ID&#125;\105600\remote\worlds</Text></li>
          <li><Text strong>Windows</Text>: <Text code>%USERPROFILE%\Documents\My Games\Terraria\Worlds</Text></li>
        </ul>
        <Paragraph>
          Once loaded, you can pan and zoom the map, search for blocks, view chest contents, and more.
        </Paragraph>
        <Title level={4}>Keyboard Shortcuts</Title>
        <Paragraph>
          <Text keyboard>E</Text> Zoom in<br />
          <Text keyboard>C</Text> Zoom out<br />
          <Text keyboard>Ctrl+F</Text> Open block search
        </Paragraph>
      </Typography>
    </div>
  );
}
