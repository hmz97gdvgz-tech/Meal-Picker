# Meal Picker PWA — Updated Edition

A personal, offline-capable meal suggestion app. Three categories are preloaded with the dish lists supplied by the app owner:

- **Breakfast:** 16 suggestions
- **Lunch / Dinner:** 18 suggestions
- **Protein Power:** 10 suggestions (6 paneer + 4 chicken)

Individual list entries that name variants are shown as one suggestion, with all listed variants retained.

## Updating the existing GitHub Pages app

1. Extract `meal-picker-updated.zip`.
2. In the GitHub **Meal-Picker** repository, upload **all eight files** from this folder to the repository root, replacing existing files of the same name. `styles.css` is new and must be included.
3. Commit the changes to `main`. The existing GitHub Pages deployment automatically updates after a short delay.
4. Open the GitHub Pages URL on the iPhone. If the installed Home Screen app initially shows the old categories, close and reopen it after a minute or open Safari at the URL to trigger the service-worker update. Do **not** clear website data or uninstall the app merely to refresh it: this may delete locally saved lists.
5. Check all three categories and use **Manage meal lists** for subsequent changes.

## Existing user data and migration

This edition stores lists in `meal-picker-v2` so the previously saved `meal-picker-v1` data remains untouched.

On first use, the app starts with all 44 preloaded suggestions. If this device has user-entered dishes in the previous version, it **merges** them into the corresponding categories without duplicates: previous Breakfast becomes Breakfast; previous Lunch and Dinner are merged into Lunch / Dinner. Protein Power starts with the new entries. This preserves prior work, but any earlier test dishes may also appear; remove them using Manage meal lists if needed. Later updates do not re-add built-in entries that you have deleted.

New edits and history are kept locally on each device. The app does not synchronize across devices. An existing v1 backup can also be imported; that import merges its dishes into the supplied defaults. Exports from v2 preserve the three new categories.

## Randomization

For each category, the app shuffles all available dishes without repetition within each cycle. The **Previous** button travels back through the actual viewed history. **Next** walks forward through prior history before showing a new entry. At the end of a cycle, the order is shuffled again, with the first selection kept different from the final selection of the previous cycle where possible.

## Privacy and security

- GitHub Pages makes the **application code and default meal list public**. It does **not** receive meal lists you add on your device.
- No accounts, trackers, third-party scripts, remote APIs or iPhone permissions are required.
- A restrictive Content Security Policy (CSP) is included. The app's service worker intercepts only same-origin requests within this app's path.
- Backup imports are validated with file-size, category, item count and name-length checks, and require confirmation before replacing lists.
- The app's `localStorage` contents are not separately encrypted. Use **Export backup** periodically and retain copies in a trusted location.
- Do not clear the app's Safari website data or delete the Home Screen installation unless you have a backup.
