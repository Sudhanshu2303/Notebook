# Notebook

Notebook is a personal journal and task manager built with React 19 and Vite. It has no backend.
- **Journal:** entries with a title, body, mood, energy level, tags and date, plus a streak count and a mood strip.
- **Tasks:** a to-do list with status (to do, in progress, done), priority, due dates and subtasks. Finishing tasks shows confetti and celebration GIFs.
- **Task history:** a log of task events that can be exported as CSV.

All data (tasks and journal entries) is stored in the browser's localStorage. There is no database and no authentication yet, so data is per-browser.

## Layout

- `index.html` – App shell. Applies the saved or system theme before first paint and loads the Inter font.
- `src/main.jsx` – Entry point. Mounts `<App>` inside `BrowserRouter`.
- `src/App.jsx` – Sidebar, mobile top bar and drawer, theme toggle and all routes:
  - `/journal`, `/journal/new`, `/journal/:id`
  - `/tasks`, `/tasks/history`
  - `/` and unknown paths redirect to `/journal`; `/todo` redirects to `/tasks`.
- `src/pages/journal/` – `JournalLayout` (Evernote-style split: list plus pane), `JournalHome` (overview), `JournalEditor` (create and edit).
- `src/pages/tasks/` – `TasksLayout`, `Tasks` (the main list), `TaskHistory` (timeline, records and CSV export).
- `src/components/` – Shared UI: `Sidebar`, `Flash` (toast), `Icon` (inline SVG paths), `MoodPicker`, `EnergyPicker`, `MoodStrip`, `TagInput`, `Welcome` (first-run tour), `InstallTip` ("Add to Home Screen" card on phones).
- `src/components/todo/` – Task UI: `TaskItem`, `TaskComposer`, `DuePicker`, `ProgressCard`, `Segmented`, `Confetti`, `GifCard`.
- `src/hooks/` – `useLocalStorage` (shared store), `useJournal`, `useTodos`, `useTheme`, `useOnboarding` (decides when to show the welcome tour).
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
  - Current keys: `journal-entries`, `journal-draft`, `todos`, `todo-history`, `theme`, `todo-sort`, `todo-show-completed`, `todo-gifs`, `history-range`, `history-view`, `welcome` (`null` → tour not seen, `'done'`, or `'open'` to replay), `install-tip-dismissed`.
- **Data access:** pages call the domain hooks (`useJournal`, `useTodos`) instead of reading the `todos` or `journal-entries` keys directly.
- **Old data:** stored data may come from older versions of the app, so always pass it through `normalizeTask` or `normalizeEntry` before use. When you add a field, give it a default there.
- **Task history:** `useTodos` logs an event (`created`, `started`, `paused`, `completed`, `reopened`, `deleted`) for every task change. New task actions should log events too.
- **IDs:** use `uid()` from `src/lib/id.js`, never `crypto.randomUUID()` directly, because `randomUUID` fails over plain HTTP (for example, a phone on the LAN).
- **Dates:** due dates and journal dates are local-time `YYYY-MM-DD` strings (`toDateKey`); timestamps are epoch milliseconds.
- **Code organization:** keep logic in `src/lib/` as pure functions and keep components thin. One default-exported component per `.jsx` file.
- **Styling:** use the CSS variables from `styles.css`, not hard-coded colours. Plain class names; no CSS modules or UI library.
- **Toasts:** pass `navigate(path, { state: { flash } })` and `<Flash>` displays it.

## Known issues and next steps

- There are no TODO or FIXME comments in the code.
- Data doesn't sync between devices; a database is planned but not started.
- The git repo has no remote yet. Planned for later:
  - Create a GitHub repo and push the full history (`git remote add origin …`, then `git push -u origin main`).
  - Optionally connect it to the Vercel project so pushes to `main` deploy automatically.
- Celebration GIFs are loaded from GIPHY (`media.giphy.com`), so they need a network connection.

## Open questions

- `package.json` still says `task_manager_project`, while the app is titled "Notebook" and the folder is `Notebook`.
- There is no README.
