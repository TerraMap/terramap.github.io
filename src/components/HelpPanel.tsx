import { theme, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

export function HelpPanel() {
  const { token: { colorBgContainer } } = theme.useToken();
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
          World files are located at:
        </Paragraph>
        <Paragraph>
          <Text code>%USERPROFILE%\Documents\My Games\Terraria\Worlds</Text>
        </Paragraph>
        <Paragraph>
          Once loaded, you can pan and zoom the map, search for blocks, view chest contents, and more.
        </Paragraph>
        <Title level={4}>Keyboard Shortcuts</Title>
        <Paragraph>
          <Text keyboard>E</Text> Zoom in<br />
          <Text keyboard>C</Text> Zoom out<br />
          <Text keyboard>Ctrl+B</Text> Open block search
        </Paragraph>
      </Typography>
    </div>
  );
}
