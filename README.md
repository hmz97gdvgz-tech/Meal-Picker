# Meal Picker 3.1

This is a compatible update to the existing Meal Picker 3.0 Progressive Web App. The user interface, light/dark mode, three categories, suggestion algorithm, offline operation and Home Screen installation remain unchanged.

## What's new

- **Breakfast:** 16 dishes (unchanged). Avocado Toast was already included and is not duplicated.
- **Lunch / Dinner:** 25 dishes. The existing **Noodles** dish is renamed **Noodles with vegetables**, retaining its ID and history. Seven new dishes: Bottle Gourd Soup, Tomato Soup, Vegetable Soup, Curry Pakora Rice, Moong Dal Soup, White Chole Corn Salad, Khichadi.
- **Protein Power:** 13 dishes. Three new dishes: Ghee Roast Chicken, Chicken Mushroom Soup, Paneer Kofta.
- **Total curated dishes:** 54 (44 original + 10 additional). All 10 additions have distinct, locally bundled illustrations in `food-atlas-additions.png`. The Noodles illustration stays the same.

## Upgrade the existing GitHub Pages application

1. **Back up first:** On your iPhone, launch the installed app, go to **Edit menus** > **Export backup**, and save the JSON backup to Files or iCloud Drive. The exported file is your recovery copy, not something to upload to GitHub.
2. Download this ZIP to your Mac and extract it.
3. Open `https://github.com/hmz97gdvgz-tech/Meal-Picker` > **Code** > **Add file** > **Upload files**.
4. Upload the **ten application files** from inside this folder to the repository **root**, not the ZIP and not the folder itself. GitHub will replace the nine existing names and add one new file (`food-atlas-additions.png`).
5. Enter a commit message such as `Update Meal Picker to v3.1` and click **Commit changes**.
6. Wait until GitHub Pages reports deployment completed. On your phone open `https://hmz97gdvgz-tech.github.io/Meal-Picker/` in Safari, then close and reopen the installed Home Screen app. The service worker may require another close/reopen after checking for updates.
7. Check the menu counts. On an unmodified installation they are **16 / 25 / 13**. If you added or removed dishes yourself, your counts may differ.

**Do not delete the Home Screen app or clear website data.** That can erase locally edited menus and navigation history. The existing local storage key (`meal-picker-v2`) is intentionally retained. The Version 3.1 data migration is additive, keeps custom entries and existing edited lists, preserves current navigation history and renames the Noodles entry in place. It runs only once.

## Contents (10 files)

- `index.html`: unchanged app HTML shell / CSP
- `styles.css`: original styling plus 10 new atlas coordinates
- `app.js`: new defaults, migration, suggestion logic and backup handling
- `sw.js`: updated offline cache version including additional food atlas
- `manifest.webmanifest`: unchanged install settings
- `food-atlas.png`: original 44 illustrations
- `food-atlas-additions.png`: 10 new distinct illustrations
- `icon-192.png` and `icon-512.png`: unchanged app icons
- `README.md`: these instructions

## Data/privacy

Your on-device edits and suggestion history are stored locally under the same web origin, not on GitHub. The public GitHub repository contains the 54 curated dish names and illustrations. There are no external scripts, trackers, database connections or sensitive device permission requests. App resources are cached for offline use.

If Version 3.0 remains visible temporarily, open the hosted app in Safari and refresh, then relaunch the Home Screen version. Never remove the installed app as a troubleshooting first step.
