# i18n Progress

Tracking localization work across the codebase. Target languages (by user count): Spanish, Russian, Simplified Chinese, Brazilian Portuguese.

## Setup
- [x] Install `i18next` + `react-i18next`
- [x] Create `src/i18n/i18n.ts` (initialization)
- [x] Create `src/i18n/en.json` (English strings)
- [x] Add language switcher UI
- [ ] Translations
  - [ ] `en.json`
  - [ ] `es.json`
  - [ ] `ru.json`
  - [ ] `zh-CN.json`
  - [ ] `pt-BR.json`

---

## Files

### Done
| File | Strings | Notes |
|---|---|---|
| [src/lib/keyboardShortcuts.tsx](src/lib/keyboardShortcuts.tsx) | 17 | Keys derived from handler names at render time in ToolbarButton |
| [src/components/ToolbarButton.tsx](src/components/ToolbarButton.tsx) | — | Updated to call `t()` for shortcut labels |
| [src/components/Navbar.tsx](src/components/Navbar.tsx) | 11 | All UI strings externalized |

### Pending
| File | ~Strings | Notes |
|---|---|---|
| [src/components/HelpPanel.tsx](src/components/HelpPanel.tsx) | ~7 | "Getting Started", "Keyboard Shortcuts", intro text, table headers |
| [src/components/BlockSelectorModal.tsx](src/components/BlockSelectorModal.tsx) | ~7 | "Choose Blocks", "Cancel", "OK", filter tabs, search placeholders |
| [src/components/WorldPickerModal.tsx](src/components/WorldPickerModal.tsx) | ~6 | Modal title, "Select a different world", table column headers |
| [src/components/DirectoryPickerModal.tsx](src/components/DirectoryPickerModal.tsx) | ~5 | Modal title, "Show all spoilers", descriptive text |
| [src/lib/tileDisplayFields.ts](src/lib/tileDisplayFields.ts) | ~19 | Field labels: "Location", "Tile", "Wall", "Slope", "Paint", etc. |
| [src/lib/slopeLabels.ts](src/lib/slopeLabels.ts) | 5 | Slope type names |
| [src/components/TileDescriptions.tsx](src/components/TileDescriptions.tsx) | ~18 | Entity type display names |
| [src/AppContent.tsx](src/AppContent.tsx) | ~5 | Notification messages with interpolation ("Highlighted {{count}} matches", "Explored: {{percent}}") |
| [src/components/WorldPropertiesList.tsx](src/components/WorldPropertiesList.tsx) | 1 | "Filter world properties..." placeholder |
| [src/components/DropOverlay.tsx](src/components/DropOverlay.tsx) | 2 | Drop zone instructions |
| [src/components/Copyable.tsx](src/components/Copyable.tsx) | ~2 | "Click to copy", "Copied:" notification |
