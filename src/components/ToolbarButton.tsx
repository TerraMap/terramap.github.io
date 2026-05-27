import { Button, Space, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";
import { getLabelByHandler, getShortcutsByHandler, type ShortcutHandlers } from "../lib/keyboardShortcuts";

function ShortcutTag({ handler }: { handler: keyof ShortcutHandlers }) {
  const shortcuts = getShortcutsByHandler(handler);
  if (shortcuts.length === 0) return null;
  return (
    <Tag>
      <Space separator=" or ">
        {shortcuts.map(s => (
          <kbd key={s.key + (s.shift ? '-shift' : '')}>
            {s.shift ? `Shift + ${s.key}` : s.key}
          </kbd>
        ))}
      </Space>
    </Tag>
  );
}

export default function ToolbarButton(
  {
    children,
    disabled,
    shortcutHandler,
    icon,
    onClick,
    tooltip
  }:
    {
      children?: ReactNode;
      disabled?: boolean;
      shortcutHandler?: keyof ShortcutHandlers;
      icon?: ReactNode;
      onClick: () => void;
      tooltip?: string;
    }
) {
  const label = tooltip ?? (shortcutHandler && getLabelByHandler(shortcutHandler));
  const resolvedIcon = icon ?? (shortcutHandler && (getShortcutsByHandler(shortcutHandler))?.[0]?.icon);

  return (<Tooltip title={
    <Space>
      {label}
      {shortcutHandler && <ShortcutTag handler={shortcutHandler} />}
    </Space>
  }>
    <Button icon={resolvedIcon} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  </Tooltip>);
}
