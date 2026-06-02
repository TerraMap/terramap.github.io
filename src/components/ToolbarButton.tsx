import { Button, Space, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";
import { getLabelByHandler, getShortcutByHandler, type ShortcutHandlers } from "../lib/keyboardShortcuts";

function ShortcutTag({ handler }: { handler: keyof ShortcutHandlers }) {
  const shortcut = getShortcutByHandler(handler);
  if (!shortcut) return null;
  return (
    <Tag>
      <kbd key={shortcut.key + (shortcut.shift ? '-shift' : '')}>
        {shortcut.shift ? `Shift + ${shortcut.key}` : shortcut.key}
      </kbd>
    </Tag>
  );
}

export default function ToolbarButton(
  {
    children,
    disabled,
    loading,
    shortcutHandler,
    icon,
    onClick,
    tooltip
  }:
    {
      children?: ReactNode;
      disabled?: boolean;
      loading?: boolean;
      shortcutHandler?: keyof ShortcutHandlers;
      icon?: ReactNode;
      onClick: () => void;
      tooltip?: string;
    }
) {
  const label = tooltip ?? (shortcutHandler && getLabelByHandler(shortcutHandler));
  const resolvedIcon = icon ?? (shortcutHandler && (getShortcutByHandler(shortcutHandler))?.icon);

  return (<Tooltip title={
    <Space>
      {label}
      {shortcutHandler && <ShortcutTag handler={shortcutHandler} />}
    </Space>
  }>
    <Button icon={resolvedIcon} onClick={onClick} disabled={disabled} loading={loading}>
      {children}
    </Button>
  </Tooltip>);
}
