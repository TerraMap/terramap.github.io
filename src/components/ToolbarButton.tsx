import { Button, Space, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";

export default function ToolbarButton(
  {
    children,
    disabled,
    keyboardShortcut,
    icon,
    onClick,
    tooltip
  }:
    {
      children?: ReactNode;
      disabled?: boolean;
      keyboardShortcut?: string | string[];
      icon: ReactNode;
      onClick: () => void;
      tooltip: string;
    }
) {
  return (<Tooltip title={
    <Space>
      {tooltip}
      {
        typeof keyboardShortcut === 'string' ? (
          <Tag>
            <kbd>{keyboardShortcut}</kbd>
          </Tag>
        ) :
          Array.isArray(keyboardShortcut) ? (
            <Tag>
              <Space separator=" + ">
                {
                  keyboardShortcut.map(k =>
                    <kbd key={k}>{k}</kbd>)
                }
              </Space>
            </Tag>
          ) : ''
      }
    </Space>
  }>
    <Button icon={icon} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  </Tooltip>);
}