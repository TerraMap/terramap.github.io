import { CopyOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import useApp from 'antd/es/app/useApp';
import type { ReactNode } from 'react';

const { Text } = Typography;

export default function Copyable({ label, copyText }: {
  label: string | ReactNode;
  copyText?: string;
}) {
  const { message } = useApp();

  let textToCopy: string;

  if (copyText) textToCopy = copyText;
  else if (typeof label === 'string') textToCopy = label as string;
  else textToCopy = '';

  const handleClick = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      message.success(`Copied: ${textToCopy}`);
    });
  };

  return (
    <Text code style={{ cursor: 'pointer' }} onClick={handleClick} title={`Click to copy: ${textToCopy}`}>
      {label} <CopyOutlined />
    </Text>
  );
}