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
  labelKey: string;
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

export const keyboardShortcuts: KeyboardShortcut[] = [
  { key: 'f', labelKey: 'shortcuts.open_folder', handler: 'onOpenFolder', icon: <FolderOpenOutlined /> },
  { key: 'o', labelKey: 'shortcuts.open_world_file', handler: 'onOpenWorld', icon: <FileImageOutlined /> },
  { key: 'r', labelKey: 'shortcuts.reload_world', handler: 'onReloadWorld', icon: <ReloadOutlined /> },
  { key: 'b', labelKey: 'shortcuts.choose_blocks', handler: 'onOpenBlocks', icon: <SearchOutlined /> },
  { key: 'p', labelKey: 'shortcuts.find_previous_block', handler: 'onFindPrevious', shift: true, icon: <LeftOutlined /> },
  { key: 'n', labelKey: 'shortcuts.find_next_block', handler: 'onFindNext', icon: <RightOutlined /> },
  { key: 'h', labelKey: 'shortcuts.highlight_all_matching_blocks', handler: 'onHighlight', icon: <HighlightOutlined /> },
  { key: 'x', labelKey: 'shortcuts.clear_highlighted_blocks', handler: 'onClearHighlight', icon: <CloseOutlined /> },
  { key: 'e', labelKey: 'shortcuts.zoom_in', handler: 'onZoomIn', icon: <ZoomInOutlined /> },
  { key: 'c', labelKey: 'shortcuts.zoom_out', handler: 'onZoomOut', icon: <ZoomOutOutlined /> },
  { key: 'z', labelKey: 'shortcuts.zoom_to_fit', handler: 'onResetZoom', icon: <ExpandOutlined /> },
  { key: 'd', labelKey: 'shortcuts.go_to_dungeon', handler: 'onGoToDungeon' },
  { key: 'l', labelKey: 'shortcuts.go_to_location', handler: 'onGoToTile' },
  { key: 's', labelKey: 'shortcuts.go_to_spawn', handler: 'onGoToSpawn' },
  { key: 'i', labelKey: 'shortcuts.toggle_info_pane', handler: 'onToggleInfoPane' },
  { key: 'w', labelKey: 'shortcuts.toggle_wires', handler: 'onToggleWires' },
  { key: 'escape', labelKey: 'shortcuts.hide_tile_indicator', handler: 'onHideTileIndicator' },
];
