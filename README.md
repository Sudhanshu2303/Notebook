# Notebook

Notebook is a personal journal and task manager in one responsive web app. It pairs daily reflection with practical planning, while keeping entries and tasks in the browser on the device where they were created.

> **Accomplishment (XYZ):** Brought daily reflection and task planning into one browser workspace, measured by **2 core workflows**, a **14-day mood view**, and **6 task-history event types**, by building a React app with browser-local persistence, task prioritization, progress summaries, and CSV export.
>
> These figures describe shipped product scope, not user outcomes. Notebook does not collect app-wide usage analytics.

## Features

### Journal

- Write and edit dated entries with a title and free-form body.
- Record one of five moods and one of five energy levels; backdate entries when needed.
- Add reusable tags, search entry text, and filter by mood or tag.
- Keep a draft in progress across refreshes and navigation.
- Review entry count, writing streak, total words, top tags, weekly average mood, and a 14-day mood strip.
- Preview the selected mood as the app accent for today's entry.

### Tasks

- Create tasks with notes, due dates, priorities, and subtasks.
- Track each task as To do, In progress, or Done.
- Filter by status, due date, and priority; search task titles, notes, and subtasks.
- Sort by smart urgency, due date, priority, or newest. Smart sort puts in-progress work first, then considers due-date urgency and priority.
- See completion progress, active counts, tasks due today, and overdue tasks.
- Get a brief completion message and confetti when a task is completed. Optional GIPHY celebrations appear at selected milestones and can be switched off.

### Task history

- Keep a timeline of task creation, starting, pausing, completion, reopening, and deletion.
- Review history as a timeline or grouped by task, over 7 days, 30 days, or all time.
- See completion rate and average time to finish for the selected range.
- Search history, remove individual events or a task's history, undo recent removals, and export task records as CSV.

### Appearance and first run

- Choose Light, Dark, or Auto theme; Auto follows the device's color-scheme setting.
- Optionally tint the interface using today's latest journal mood.
- Follow a three-step welcome tour, start with sample entries and tasks, or replay the tour from Settings.
- On phones, see a dismissible tip for adding a browser shortcut to the home screen.
- Use the sidebar on wider screens or a navigation drawer on phones.

## Routes

| Path | Page |
| --- | --- |
| `/journal` | Journal overview and entry list |
| `/journal/new` | Create a journal entry |
| `/journal/:id` | Edit an entry |
| `/tasks` | Task list and progress |
| `/tasks/history` | Task history and export |

`/` redirects to `/journal`; `/todo` redirects to `/tasks`. Unknown paths also return to the journal. The Vercel rewrite in `vercel.json` serves the app shell for these client-side routes on refresh.

## Deployment

- **Vercel project:** `notebook-a-productivity-tracker-application`
- **Production URL:** [notebook-sr.vercel.app](https://notebook-sr.vercel.app)
- The production deployment currently uses the Vercel team's SSO protection, so visitors must be signed in to access it.
- The current deployment was uploaded directly to Vercel. Automatic deployments from GitHub pushes are not connected yet; install the Vercel GitHub integration and connect this repository to enable them.

## Data and privacy

- Notebook has no backend, account system, or database. Journal entries, drafts, tasks, task history, and preferences are stored in the browser's `localStorage`.
- Data is local to the browser profile and device. It does not sync across devices, and the project does not send usage analytics to an app server.
- Clearing browser storage or using a different browser profile can make local data unavailable. Export task history before clearing it if you need a separate copy; journal export is not currently provided.
- Celebration images load from GIPHY, and the Inter typeface loads from Google Fonts. Those assets need an internet connection; the core app data and interactions do not use a remote API.
- The phone home-screen tip is guidance only; the project does not currently include a web app manifest or service worker.

## Tech stack

- React 19
- Vite 8
- React Router 7
- Plain CSS with shared design tokens and responsive layouts
- Browser `localStorage` through a small shared React external store

## Run locally

You need Node.js and npm installed.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal. To expose the dev server to another device on the same network:

```bash
npm run dev -- --host
```

Create and serve a production build locally with:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
  components/       Shared UI and task-specific components
  hooks/            Journal, task, storage, theme, mood, and onboarding state
  lib/              Pure data helpers, sorting, history, samples, and IDs
  pages/journal/    Journal overview, list layout, and editor
  pages/tasks/      Task list, task history, and tab layout
  App.jsx           App shell and client-side routes
  main.jsx          React entry point
  styles.css        Design tokens, themes, component styles, and breakpoints
index.html          HTML shell and pre-paint theme setup
vercel.json         SPA route fallback for Vercel
vite.config.js      Vite and React plugin configuration
```

The app uses domain hooks (`useJournal` and `useTodos`) for data access. `useLocalStorage` shares updates between components and open tabs; normalization helpers keep older stored entry and task shapes readable.

## Current limits

- No cloud backup, cross-device sync, accounts, or authentication.
- No recurring tasks, journal export, test suite, lint configuration, or formatter configuration is included.
- Task and journal history are stored in the same browser as the app; deleting site data can remove them.
