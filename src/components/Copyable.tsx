import { CopyOutlined } from '@ant-design/icons';
import { App, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export default function Copyable({ label, copyText }: {
  label: string | ReactNode;
  copyText?: string;
}) {
  const { notification } = App.useApp();

  let textToCopy: string;

  if (copyText) textToCopy = copyText;
  else if (typeof label === 'string') textToCopy = label;
  else textToCopy = '';

  const handleClick = () => {
    void navigator.clipboard.writeText(textToCopy).then(() => {
      notification.success({ key: 'copy', title: `Copied: ${textToCopy}`, placement: 'bottomRight' });
    });
  };

  return (
    <Text code style={{ cursor: 'pointer' }} onClick={handleClick} title={`Click to copy: ${textToCopy}`}>
      {label} <CopyOutlined />
    </Text>
  );
}