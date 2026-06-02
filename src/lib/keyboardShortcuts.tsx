import {
  CloseOutlined,
  ExpandOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  HighlightOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { ReactNode } from "react";

export interface KeyboardShortcut {
  key: string;
  label: string;
  handler: keyof ShortcutHandlers;
  shift?: boolean;
  icon?: ReactNode;
}

export interface ShortcutHandlers {
  onClearHighlight: () => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onGoToDungeon: () => void;
  onGoToTile: () => void;
  onGoToSpawn: () => void;
  onHideTileIndicator: () => void;
  onHighlight: () => void;
  onOpenBlocks: () => void;
  onOpenFolder: () => void;
  onOpenWorld: () => void;
  onReloadWorld: () => void;
  onResetZoom: () => void;
  onToggleInfoPane: () => void;
  onToggleWires: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function getShortcutByHandler(handler: keyof ShortcutHandlers): KeyboardShortcut | undefined {
  return keyboardShortcuts.find(s => s.handler === handler);
}

export function getLabelByHandler(handler: keyof ShortcutHandlers): string | undefined {
  return keyboardShortcuts.find(s => s.handler === handler)?.label;
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  { key: 'f', label: 'Open Folder', handler: 'onOpenFolder', icon: <FolderOpenOutlined /> },
  { key: 'o', label: 'Open Terraria World File', handler: 'onOpenWorld', icon: <FileImageOutlined /> },
  { key: 'r', label: 'Reload World', handler: 'onReloadWorld', icon: <ReloadOutlined /> },
  { key: 'b', label: 'Choose Blocks', handler: 'onOpenBlocks', icon: <SearchOutlined /> },
  { key: 'p', label: 'Find Previous Block', handler: 'onFindPrevious', shift: true, icon: <LeftOutlined /> },
  { key: 'n', label: 'Find Next Block', handler: 'onFindNext', icon: <RightOutlined /> },
  { key: 'h', label: 'Highlight All Matching Blocks', handler: 'onHighlight', icon: <HighlightOutlined /> },
  { key: 'x', label: 'Clear Highlighted Blocks', handler: 'onClearHighlight', icon: <CloseOutlined /> },
  { key: 'e', label: 'Zoom In', handler: 'onZoomIn', icon: <ZoomInOutlined /> },
  { key: 'c', label: 'Zoom Out', handler: 'onZoomOut', icon: <ZoomOutOutlined /> },
  { key: 'z', label: 'Zoom To Fit', handler: 'onResetZoom', icon: <ExpandOutlined /> },
  { key: 'd', label: 'Go To Dungeon', handler: 'onGoToDungeon' },
  { key: 'l', label: 'Go To Location', handler: 'onGoToTile' },
  { key: 's', label: 'Go To Spawn', handler: 'onGoToSpawn' },
  { key: 'i', label: 'Info Pane (Show / Hide)', handler: 'onToggleInfoPane' },
  { key: 'w', label: 'Wires (Show / Hide)', handler: 'onToggleWires' },
  { key: 'escape', label: 'Hide Tile Indicator', handler: 'onHideTileIndicator' },
];
