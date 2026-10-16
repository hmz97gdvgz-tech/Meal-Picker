# Meal Picker PWA

Private, offline-capable meal suggestion app. No sample dishes are included: you add all dishes yourself.

## Publish with GitHub Pages
1. Create a free GitHub account (if needed) and a new repository, e.g. `meal-picker`.
2. Upload all six app files from this folder to the repository root (`index.html`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`).
3. Go to Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)` → Save.
4. Open the published HTTPS URL on your iPhone in Safari. Share → Add to Home Screen.
5. Open the installed app and add your meal lists under Manage meal lists.

## Privacy and backups
Meal data stays in the browser's local storage on each device. GitHub Pages hosts only the app code, not your meal data. The public URL is not password protected, but no personal data is uploaded. Use Export backup periodically and store the JSON somewhere safe. Import backup restores lists (not browsing history). Clearing browser/site data or removing the installed app may erase locally stored lists.

## Randomization
Each meal category has its own shuffled queue. Next walks forward through prior history before generating another suggestion. Once the queue is exhausted, a new shuffled queue begins; when possible, its first dish differs from the previous suggestion. Previous walks back through the exact history. Deleting a dish removes it from the queue and history.
