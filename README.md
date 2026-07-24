# TerraMap
TerraMap is an interactive Terraria v1.4.5 world map viewer that loads quickly and lets you pan, zoom, find blocks, ores, items in chests, dungeons, NPCs, etc.

This is the source code repository.  If you're looking for the web app, you can find it here: https://terramap.github.io

If you're looking for the cross-platform native  app, you can find it here: https://terramap.github.io/native.html

If you're looking for the Windows-only app, you can find it here: https://terramap.github.io/windows.html

## Native App Release Process

The native (Tauri-based) desktop app is built and released by [.github/workflows/native-release.yml](.github/workflows/native-release.yml).

### Bumping the version

- **`package.json`** (`version`) — source of truth for the web app. [vite.config.ts](vite.config.ts) imports it and bakes it into `__APP_VERSION__` at build time. Bump this manually before release.
- **`native/tauri.conf.json`** (`version`) — native app version. For tagged/manual-tag releases this is overwritten automatically from the `native-vX.Y.Z` tag (see below), so it doesn't strictly need bumping first — but keep it in sync so local native dev builds (`npm run native`) show the right version.

### Triggering a release

- **Tagged release**: push a tag matching `native-v*`, e.g.:
  ```
  git tag native-v0.2.0
  git push origin native-v0.2.0
  ```
  This builds, signs, and publishes a GitHub Release named `TerraMap Native App 0.2.0`.
- **Manual dry run**: run the workflow via `workflow_dispatch` in the Actions tab and leave the `tag` input blank. This builds all platform artifacts without setting a version or publishing a release, useful for verifying the build still works.
- **Manual release**: run `workflow_dispatch` with `tag` set to a `native-vX.Y.Z` value to produce a full signed release the same as pushing a tag.

### What the workflow does

1. **test** — runs `npm ci` and `npm test` (lint, typecheck, vitest) on Ubuntu; the build only proceeds if this passes.
2. **build** — runs in a matrix across `mac-arm64`, `mac-x64`, `linux-x64`, and `win-x64`:
   - Sets the version in `native/tauri.conf.json` from the tag (tagged/manual releases only).
   - Imports the Apple signing certificate and builds/notarizes the macOS app (`npx tauri build`).
   - On Linux, additionally builds a Flatpak bundle via `flatpak-builder`.
   - Renames bundle outputs to `TerraMap-{version}-{label}.{ext}` (`.dmg`, `.app.tar.gz`, `.AppImage`, `.deb`, `.rpm`, `.msi`, `-setup.exe`, `.flatpak`) and uploads them as build artifacts. Windows artifacts are uploaded unsigned at this stage.
3. **sign-windows** — submits the unsigned Windows build to [SignPath](https://signpath.io/) for code signing and uploads the signed result.
4. **release** — (tagged/manual-tag runs only) downloads all platform artifacts and publishes a GitHub Release with the install instructions and every bundle attached.

### Prerequisites for signed releases

The following repository secrets/variables must be configured for macOS notarization and Windows signing to succeed:
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `SIGNPATH_API_TOKEN`, and the SignPath `organization-id`/`project-slug`/`signing-policy-slug`/`artifact-configuration-slug` variables.

### Local development/build

- `npm run native` — run the native app in dev mode (`tauri dev`).
- `npm run native:build` — produce a local unsigned native build for your current platform (`tauri build`).

## Sponsors

<table>
    <tr>
        <td style="width:50px">
            <img src="signpath.png" width="50" height="50">
        </td>
        <td>
            Free code signing on Windows provided by <a href="https://signpath.io/">SignPath.io</a>, certificate by <a href="https://www.signpath.com/solutions/for-open-source-community-foundation">SignPath Foundation</a>.
        </td>
    </tr>
</table>