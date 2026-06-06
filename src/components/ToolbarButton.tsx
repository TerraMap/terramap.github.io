import { Button, Space, Tag, Tooltip } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getShortcutByHandler, type ShortcutHandlers } from "../lib/keyboardShortcuts";

export function ShortcutLabel({ handler }: { handler: keyof ShortcutHandlers }) {
  const { t } = useTranslation();
  const shortcut = getShortcutByHandler(handler);
  if (!shortcut) return null;
  return (
    <>
      {t(shortcut.labelKey)}
      <ShortcutTag handler={handler} />
    </>
  );
}

export function ShortcutTag({ handler }: { handler: keyof ShortcutHandlers }) {
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
  const { t } = useTranslation();
  const shortcut = shortcutHandler ? getShortcutByHandler(shortcutHandler) : undefined;
  const label = shortcut ? t(shortcut.labelKey) : tooltip;
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
