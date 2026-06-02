#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$SCRIPT_DIR"
[ -d bin ] || neu update

echo "Building web app..."
cd "$REPO_ROOT"
npx vite build

echo "Copying build output to desktop/resources..."
cd "$SCRIPT_DIR"
rm -rf resources/assets resources/index.html resources/about.html resources/ads.txt resources/windows.html resources/resources
cp -r "$REPO_ROOT/dist/"* resources/

echo "Patching config for production (remote URL)..."
sed -i.bak 's|"url": "/"|"url": "https://terramap.github.io"|' neutralino.config.json

echo "Building Neutralinojs app..."
neu build

echo "Restoring dev config..."
mv neutralino.config.json.bak neutralino.config.json

echo "Packaging archives..."
cd dist/terramap-desktop

# Linux: os/arch/TerraMap + resources.neu
for bin in *-linux_*; do
  [ -f "$bin" ] || continue
  arch="${bin##*linux_}"
  dir="../linux/$arch/TerraMap"
  mkdir -p "$dir"
  cp "$bin" "$dir/TerraMap"
  cp resources.neu "$dir/"
  echo "  linux/$arch/TerraMap"
  tar czf "../TerraMap-linux-${arch}.tar.gz" -C "../linux/$arch" TerraMap
done

# macOS: os/arch/TerraMap.app bundle
for bin in *-mac_*; do
  [ -f "$bin" ] || continue
  arch="${bin##*mac_}"
  dir="../mac/$arch"
  bundle="$dir/TerraMap.app"
  mkdir -p "$bundle/Contents/MacOS" "$bundle/Contents/Resources"
  cp "$bin" "$bundle/Contents/MacOS/TerraMap"
  cp resources.neu "$bundle/Contents/MacOS/"
  cp "$SCRIPT_DIR/TerraMap.icns" "$bundle/Contents/Resources/icon.icns"
  cat > "$bundle/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key>
  <string>TerraMap</string>
  <key>CFBundleDisplayName</key>
  <string>TerraMap</string>
  <key>CFBundleIdentifier</key>
  <string>io.github.terramap.desktop</string>
  <key>CFBundleExecutable</key>
  <string>TerraMap</string>
  <key>CFBundleVersion</key>
  <string>0.1.0</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleIconFile</key>
  <string>icon</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
PLIST
  echo "  mac/$arch/TerraMap.app"
  ( cd "../mac/$arch" && zip -qr "../../TerraMap-mac-${arch}.zip" TerraMap.app )
done

# Windows: os/arch/TerraMap.exe + resources.neu
if [ -f *-win_x64.exe ]; then
  dir="../win/x64/TerraMap"
  mkdir -p "$dir"
  cp *-win_x64.exe "$dir/TerraMap.exe"
  cp resources.neu "$dir/"
  echo "  win/x64/TerraMap"
  ( cd ../win/x64 && zip -qr "../../TerraMap-win-x64.zip" TerraMap )
fi

echo "Done! Archives in desktop/dist/"
ls -lh ../TerraMap-*.{tar.gz,zip} 2>/dev/null
