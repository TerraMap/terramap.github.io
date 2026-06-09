# TerraMap Native Dev Setup on Steam Deck

This guide sets up a durable development environment for `npm run native` (Tauri) on a Steam Deck. The setup uses a Distrobox container for system libraries so everything survives SteamOS updates.

## Prerequisites

- VS Code installed as a Flatpak (`com.visualstudio.code`)
- A Konsole or desktop terminal available outside VS Code

---

## 1. Install Rust

In Konsole (outside VS Code):

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Accept the defaults. When it finishes, source the environment:

```sh
source $HOME/.cargo/env
```

Rustup installs to `~/.cargo`, which lives in your home directory and survives SteamOS updates.

---

## 2. Create a Distrobox Container

SteamOS's root filesystem is read-only and wiped on system updates. Distrobox runs a container that shares your home directory but has its own persistent package manager.

```sh
distrobox create --name dev --image archlinux:latest
```

---

## 3. Install System Dependencies Inside the Container

Enter the container:

```sh
distrobox enter dev
```

Install the packages Tauri 2 requires:

```sh
sudo pacman -Syu
sudo pacman -S --needed base-devel webkit2gtk-4.1 gtk3 openssl libappindicator-gtk3 librsvg pkg-config nodejs npm
```

> **Note:** Tauri 2 requires `webkit2gtk-4.1`. The older `webkit2gtk` package will not be found.

Verify Rust is visible (it comes from `~/.cargo` in your shared home directory):

```sh
cargo --version
```

Exit the container:

```sh
exit
```

---

## 4. Grant VS Code Flatpak Access to Your Home Directory

Back in Konsole on the host:

```sh
flatpak override --user com.visualstudio.code --filesystem=home
```

---

## 5. Configure VS Code Terminal to Use the Container

Open VS Code, press `Ctrl+Shift+P`, and select **Open User Settings (JSON)**. Add:

```json
"terminal.integrated.defaultProfile.linux": "dev",
"terminal.integrated.profiles.linux": {
    "dev": {
        "path": "/usr/bin/flatpak-spawn",
        "args": ["--host", "distrobox", "enter", "dev"]
    }
}
```

`flatpak-spawn --host` is required because the VS Code Flatpak is sandboxed and cannot run host binaries like `distrobox` directly.

> **Note:** VS Code's JSON schema validation will show a warning on `defaultProfile` because it only knows about built-in profile names. The setting works correctly at runtime — ignore the squiggle.

Restart VS Code. Every new terminal will now open inside the `dev` container.

---

## 6. Run the App

```sh
npm run native
```

---

## 7. Build and Test the Flatpak Bundle (One-Time Setup)

This installs the tools needed to build a `.flatpak` bundle locally for testing on Steam Deck.

### Install `org.flatpak.Builder` on the host

In Konsole:

```sh
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.flatpak.Builder org.gnome.Platform//47 org.gnome.Sdk//47
```

This downloads ~500MB and only needs to be done once.

---

## 8. Build and Test the Flatpak Bundle (Each Time)

### Step 1 — Build the release binary

In VS Code terminal (Distrobox). `APPIMAGE_EXTRACT_AND_RUN=1` is required to work around a FUSE limitation inside the container:

```sh
APPIMAGE_EXTRACT_AND_RUN=1 npx tauri build --config native/tauri.conf.json --target x86_64-unknown-linux-gnu
```

### Step 2 — Stage files for the Flatpak build

In VS Code terminal:

```sh
cd ~/source/terramap.github.io
cp native/target/x86_64-unknown-linux-gnu/release/terramap-native native/flatpak/terramap
cp native/icons/32x32.png native/flatpak/32x32.png
cp native/icons/128x128.png native/flatpak/128x128.png
cp native/icons/128x128@2x.png native/flatpak/256x256.png
```

### Step 3 — Build the bundle and install it

In Konsole (host):

```sh
cd ~/source/terramap.github.io
flatpak run org.flatpak.Builder --force-clean --repo=flatpak-repo flatpak-build native/flatpak/io.github.terramap.native.yml
flatpak build-bundle flatpak-repo TerraMap.flatpak io.github.terramap.native
flatpak install --user TerraMap.flatpak
flatpak run io.github.terramap.native
```

To uninstall after testing:

```sh
flatpak uninstall --user io.github.terramap.native
```

> **Note:** Do not use `cargo build --release` directly — it bypasses the Tauri CLI and the binary will try to connect to `localhost` instead of `https://terramap.github.io`.

---

## Maintenance

- **After a SteamOS update:** The Distrobox container and `~/.cargo` are unaffected. No reinstallation needed.
- **Adding more system libraries:** `distrobox enter dev` then `sudo pacman -S <package>`.
- **Updating the container:** `distrobox enter dev` then `sudo pacman -Syu`.
