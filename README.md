# Meal Picker 3.0

A private-on-device, offline-capable Progressive Web App for picking meals from your own menus. Static source code and original starter dishes are public in a public GitHub repository; your edits and browsing history stay in your browser's localStorage.

## Included

- 16 Breakfast suggestions, 18 Lunch / Dinner suggestions, 10 Protein Power suggestions
- 44 distinct, bundled vector-style dish illustrations in a single offline PNG sprite atlas
- Automatic Light / Dark appearance via `prefers-color-scheme`, following iPhone settings
- Non-repeating randomized rotation per category, with accurate Previous and Next history
- Add, rename, and delete dishes; import / export list backups
- First-run defaults and automatic reuse of existing `meal-picker-v2` local data
- Offline caching using the v3 service worker; Content Security Policy; no external code or tracking

## Install or upgrade on GitHub Pages

1. Save a backup on your phone first: **Edit menus** -> **Export backup** (save JSON in Files / iCloud Drive).
2. Extract this ZIP on a computer.
3. Open the existing `Meal-Picker` repository on GitHub. On the **Code** tab choose **Add file** > **Upload files**.
4. Upload the **nine files** from this folder, *not* the ZIP and not the parent folder:
   `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `food-atlas.png`, `icon-192.png`, `icon-512.png`, `README.md`.
   Use the repository root; don't nest the files in a folder. Confirm overwriting files with matching names as prompted.
5. Commit with a message such as `Upgrade Meal Picker to v3`.
6. GitHub Pages will publish automatically. Open `https://hmz97gdvgz-tech.github.io/Meal-Picker/` once deployment finishes.
7. On the iPhone, close and reopen the installed PWA. Cached v2 assets can take a second reopen to update. Do **not** delete the app or clear its website data.

## Troubleshooting

- **Still seeing v2?** Open the GitHub Pages URL in Safari, give the deployment a minute, reload, and reopen the installed app. The service worker updates the cache when v3 is fetched.
- **Missing illustrations?** Confirm `food-atlas.png` is at the root and was uploaded successfully.
- **Meal lists missing?** Do not clear browser storage. Restore using the previously exported JSON backup in **Edit menus** -> **Import backup**. Safari and Home Screen PWA storage may be separate.
- **Dark mode not switching?** Verify iPhone `Settings > Display & Brightness > Dark`, close/reopen the PWA. There is no in-app theme toggle; it follows the OS.

## Privacy / security

The source contains the original 44 dish names and illustrations, and will be publicly readable when hosted on a public repository. Personal changes, navigation history and edited menus are stored only in your device's local browser data; there are no analytics, adverts, permissions or third-party JS libraries. It is important to use GitHub two-factor authentication. Browser local data is not encrypted separately and can be lost if web-app storage is removed; maintain backups.

## Technical files

- `app.js`: all app logic, dish defaults and migration/backup functions; V2 key remains `meal-picker-v2` for seamless upgrades.
- `styles.css`: layout, styling, 44 atlas-position classes, OS-linked dark theme.
- `food-atlas.png`: 6-column, 8-row art atlas. Artwork for all supplied dishes at positions 0-43. Newly entered dishes receive a category-style placeholder.
- `sw.js`: cache v3 assets and serve them offline; same-origin, same-scope requests only.
- `manifest.webmanifest`: install metadata.
- `icon-192.png` and `icon-512.png`: Home Screen icon assets.
- `index.html`: HTML shell with CSP and light/dark theme-color metadata.

No package manager, API, payment or server is required. Use HTTPS GitHub Pages for full PWA install/offline support.
