# Notebook

Notebook is a personal journal and task manager built with React 19 and Vite. It has no backend.
- **Journal:** entries with a title, body, mood, energy level, tags and date, plus a streak count and a mood strip.
- **Tasks:** a to-do list with status (to do, in progress, done), priority, due dates and subtasks. Finishing tasks shows confetti and celebration GIFs.
- **Task history:** a log of task events that can be exported as CSV.
- **Look and feel:** Light / Dark / Auto theme (Auto follows the device live), an aqua brand colour, and optional *mood colours* that tint the whole app with the colour of today's journal mood.
- **Onboarding:** a first-run welcome tour with optional example data, and an "Add to Home Screen" tip on phones.

All data (tasks and journal entries) is stored in the browser's localStorage. There is no database and no authentication yet, so data is per-browser.

## Layout

- `index.html` – App shell. Before first paint it applies the theme and today's mood colour (same rules as `useTheme` and `useMoodTheme`). Also holds the favicon and the `theme-color` meta tag (both aqua), and loads the Inter font.
- `src/main.jsx` – Entry point. Mounts `<App>` inside `BrowserRouter`.
- `src/App.jsx` – Sidebar, mobile top bar (with a quick light/dark flip) and drawer, welcome tour, and all routes:
  - `/journal`, `/journal/new`, `/journal/:id`
  - `/tasks`, `/tasks/history`
  - `/` and unknown paths redirect to `/journal`; `/todo` redirects to `/tasks`.
- `src/pages/journal/` – `JournalLayout` (Evernote-style split: list plus pane), `JournalHome` (overview), `JournalEditor` (create and edit).
- `src/pages/tasks/` – `TasksLayout` (page header with the **Tasks | History** tabs), `Tasks` (the main list), `TaskHistory` (timeline, records and CSV export). History is reached only through these tabs; the sidebar has just Journal and Tasks, and Tasks stays highlighted on `/tasks/history`.
- `src/components/` – Shared UI: `Sidebar` (navigation, plus a **Settings** button bottom-left that opens a panel with Light/Dark/Auto, Mood colours and Welcome tour; on phones, tapping the logo closes the drawer), `Flash` (toast), `Icon` (inline SVG paths), `MoodPicker`, `EnergyPicker`, `MoodStrip`, `TagInput`, `Welcome` (first-run tour), `InstallTip` ("Add to Home Screen" card on phones).
- `src/components/todo/` – Task UI: `TaskItem`, `TaskComposer`, `DuePicker`, `ProgressCard`, `Segmented`, `Confetti`, `GifCard`.
- `src/hooks/` – `useLocalStorage` (shared store), `useJournal`, `useTodos`, `useTheme` (theme preference, see below), `useOnboarding` (decides when to show the welcome tour), `useMoodTheme` (mood colours, see below).
- `src/lib/` – Pure helpers, no React:
  - `journal.js`: moods, date keys, streaks
  - `todos.js`: task model, sorting, due dates
  - `history.js`: events, records, CSV
  - `gifs.js`: GIPHY ids
  - `id.js`: `uid()`
  - `samples.js`: example tasks and entries offered in the welcome tour
- `src/styles.css` – All styles in one file. Design tokens live on `:root`, with dark mode under `:root[data-theme='dark']`.
- `vercel.json` – Sends every path to `index.html` so client-side routes survive a page reload.

## Commands

```bash
npm install
npm run dev        # Vite dev server (add `-- --host` to open it from a phone on the same Wi-Fi)
npm run build      # production build into dist/
npm run preview    # serve the built dist/
npx vercel --prod  # deploy (Vercel project "task-manager-project")
```

There is no test, lint or format setup.

## Patterns to keep

- **Storage:**
  - Read and write data only through `useLocalStorage(key, initial)`. It is a shared, synchronous store built on `useSyncExternalStore`, so every component using the same key stays in sync, including across browser tabs.
  - Current keys: `journal-entries`, `journal-draft`, `todos`, `todo-history`, `theme` (`'system'` by default, or `'light'` / `'dark'`), `todo-sort`, `todo-show-completed`, `todo-gifs`, `history-range`, `history-view`, `welcome` (`null` → tour not seen, `'done'`, or `'open'` to replay), `install-tip-dismissed`, `mood-colors` (on/off, default on).
- **Data access:** pages call the domain hooks (`useJournal`, `useTodos`) instead of reading the `todos` or `journal-entries` keys directly.
- **Old data:** stored data may come from older versions of the app, so always pass it through `normalizeTask` or `normalizeEntry` before use. When you add a field, give it a default there.
- **Task history:** `useTodos` logs an event (`created`, `started`, `paused`, `completed`, `reopened`, `deleted`) for every task change. New task actions should log events too.
- **IDs:** use `uid()` from `src/lib/id.js`, never `crypto.randomUUID()` directly, because `randomUUID` fails over plain HTTP (for example, a phone on the LAN).
- **Dates:** due dates and journal dates are local-time `YYYY-MM-DD` strings (`toDateKey`); timestamps are epoch milliseconds.
- **Code organization:** keep logic in `src/lib/` as pure functions and keep components thin. One default-exported component per `.jsx` file.
- **Styling:** use the CSS variables from `styles.css`, not hard-coded colours. Plain class names; no CSS modules or UI library.
  - Brand colour comes only from the `--accent*` variables (`--accent`, `--accent-hover`, `--accent-text`, `--accent-soft`, `--accent-ink`), so it follows mood colours. Text on an accent background uses `--accent-text`, never `#fff`; the default aqua (`#27e5e2`) needs dark text. Links and highlights use `--accent-ink`.
  - The sidebar has its own `--sb-*` variables in both themes (it is light in light mode).
  - The `--mood-1`…`--mood-5` colours (red → green) are for mood/energy indicators only: the mood picker, mood strip and energy bars (`.energy-1`…`.energy-5`).
- **Theme:** `useTheme()` returns `{ theme, preference, setPreference, toggle }`. The stored `theme` key is the preference (`'system'`, `'light'` or `'dark'`); `'system'` follows `prefers-color-scheme` live. `toggle` flips light/dark and goes back to `'system'` when it lands on the device's theme. The resolved theme is `<html data-theme>`.
- **Mood colours:** `useMoodTheme` sets `<html data-mood="1–5">` from today's latest journal mood (or a live preview from the editor via `setMoodPreview`). The "Mood colours" section of `styles.css` swaps the `--accent*` variables per mood and theme, and tints the backgrounds. Palette: 1 Awful indigo, 2 Low blue, 3 Okay green, 4 Good = default aqua (no override), 5 Great amber. `index.html` repeats the rule before first paint, so keep the two in sync. Users can turn it off in Settings (`mood-colors`).
- **Toasts:** pass `navigate(path, { state: { flash } })` and `<Flash>` displays it.
- **Touch screens:** hover-only effects must have a fallback under `@media (hover: none)`, because phones can't hover and a tapped item would otherwise keep its hover highlight.

## Known issues and next steps

- There are no TODO or FIXME comments in the code.
- Data doesn't sync between devices; a database is planned but not started.
- The git repo has no remote yet. Planned for later:
  - Create a GitHub repo and push the full history (`git remote add origin …`, then `git push -u origin main`).
  - Optionally connect it to the Vercel project so pushes to `main` deploy automatically.
- Celebration GIFs are loaded from GIPHY (`media.giphy.com`), so they need a network connection.
- No web app manifest or home-screen icon yet, so "Add to Home Screen" uses the browser's default icon.
- Planned, not built: **repeating tasks** (Daily / Weekdays / chosen days / every N days). Ticking one logs a `completed` event and rolls the same task to its next date, with a 🔥 streak per task.
- In light mode the bright aqua is low-contrast against white for thin elements (progress bars, toggles). A deeper aqua such as `#12b5c9` would help if that becomes a problem.

## Working notes

- **Checking UI changes:** there are no tests. UI changes are checked with headless Chrome against the dev server:
  - Put a temporary test page in `public/` (it can seed `localStorage`, embed the app in an `<iframe>`, click things and write results to `document.title`).
  - Run `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot` or `--dump-dom`. `--blink-settings=preferredColorScheme=0|1` forces dark or light.
  - Use frames at least 769px wide to get the desktop layout.
  - Delete the test page afterwards.
  - Headless virtual time freezes CSS transitions, so read CSS variables instead of colours that are mid-transition.
- **Deleting files:** `rm` is aliased in this shell and fails with `rm -r`; use `/bin/rm`.
- **Stale dev server:** if `localhost:5173` returns 404 for everything, an old dev server is probably holding the port. Find it with `lsof -nP -iTCP:5173 -sTCP:LISTEN`, stop it, and restart from this folder.

## Open questions

- `package.json` is named `Notebook`. npm package names must be lowercase, which only matters if the package is ever published.
- There is no README.

## Project history and intent

How the app came to be, so future changes fit the original goals. Where this conflicts with the sections above, the sections above are current.

### Original requests (in order)
1. **Scaffold** (`58bae13`): "a journal and todo list web app" with a clean, minimal design and navigation between a Journal section and a Todo section. Built with React and Vite, saving to localStorage. The existing `package.json` (which included `@anthropic-ai/sdk`) was kept and extended.
2. **Richer journal** (also in `58bae13`): "log entries, track a mood, and other related info". This added mood (5 levels), energy (5 levels), tags, a date that can be backdated, autosaved drafts, search and filters, a streak, and the 14-day mood strip.
3. **Richer todo list** (`4599376`): filters, status and progress bars, a distinct look for completed tasks, and "cool gifs to attract the users retention". This added status, priority, due dates, subtasks with their own progress, notes, Smart sort, the progress card, confetti and GIPHY GIFs.
4. **Redesign** (`8130a15`): "a similar look and feel to Evernote", a light/dark toggle, a more modern look, better typography and spacing, fully responsive, plus **task history** with the date and time each task was created and finished. This gave the app its current shell (sidebar, two-pane journal, Tasks | History tabs).

### Design decisions and why
- **Evernote-inspired, not a copy:** the layout and feel follow Evernote (sidebar, "+ New" button, note list beside the editor, labelled field rows in the editor), but none of Evernote's branding, logo or name is used. Keep it that way.
- **Celebration GIFs are for motivation, not decoration:** they appear only at moments that mean something. That's the halfway milestone (with 4 or more tasks), clearing the whole list, and the empty state. Every single completion gets confetti plus a short cheer message instead. Users can switch GIFs off (`todo-gifs`). Don't add GIFs to everyday screens.
- **GIF choices were checked by eye:** every GIPHY id in `gifs.js` was opened to confirm it shows what its `alt` text says. Do the same before adding new ones; never guess at GIPHY ids. They use the `200.webp` version to keep them light. Some feature copyrighted characters, which is fine for personal use but worth revisiting before a public launch.
- **Completed tasks must look clearly different** from active ones: a collapsible Completed section, faded, dashed border, filled check, strikethrough, and the completion date.
- **Smart sort order:** in progress first, then by urgency (overdue → due today → due within 7 days), then by priority, then by due date. A high-priority task with no due date should not sink below a low-priority task due far in the future.
- **History is an event log, not a snapshot:** it records events as they happen, so a task deleted from the list keeps its row in History. When history tracking first ran, it backfilled events from each task's own `createdAt` / `completedAt`. Tasks deleted before then can't be recovered.
- **Old data keeps working:** each data format change so far came with a migration through `normalizeTask` / `normalizeEntry`, e.g. old `{ id, text, createdAt }` entries and `{ id, title, done }` tasks.

### Lessons from building it
- **Class-name collisions:** History's `.status-todo/.status-doing/.status-done` pill styles once also matched task rows, which share those class names, and tinted them. Scope styles for shared state names (e.g. `.status-pill.status-done`).
- **Panes must share state:** the two-pane journal needs every component to see the same data, which is why `useLocalStorage` is a shared store. An earlier per-component version made the entry list go out of date after saving in the editor.
- **Save before navigating:** saving then navigating away in the same click used to lose the write. Storage writes now happen synchronously; keep it that way.
- **Use local dates:** a date picker's `max` once used `toISOString()` (UTC) and was off by a day. Always use `toDateKey`.
- **Check the UI visually:** UI changes were checked by taking headless Chrome screenshots with sample data, at desktop (1440px) and phone (390px) widths, in both themes. This is how the bugs above were caught. Keep doing it for visual changes.

### How the user likes to work
- Commit only when asked; the user says "commit this" after reviewing. Commit messages are a short summary line plus bullet points.
- After each change, report what changed, the localhost URL to check it at, and any known limitations.
- When asked for the app's address, give `http://localhost:5173` plus links to the main routes.
