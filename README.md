# SYNCRO_PLAN

SYNCRO_PLAN is a calendar-first task manager that unifies planning and execution. It pairs a full calendar UI with task and subtask tracking so users can plan ahead, prioritize clearly, and execute with daily focus.

## Why it stands out

- Calendar-driven UX: day, week, and month views with contextual task lists.
- Task + subtask workflows: structured breakdown with completion tracking.
- Real-time updates: Supabase-backed changes are reflected immediately.
- Responsive design: optimized layout for desktop and mobile.
- Strong type safety: end-to-end TypeScript across UI, state, and data access.


## Project structure (high level)

- UI and layout: [src/components](src/components)
- State and data access: [src/context/TaskContext.tsx](src/context/TaskContext.tsx)
- Pages and routing: [src/pages](src/pages)
- Supabase client/types: [src/integrations/supabase](src/integrations/supabase)

## Local setup

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

Package manager: this project uses npm. The lockfile is `package-lock.json`.

### Environment variables

Create a `.env` file (copy from `.env.example`) and set:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### Run locally

```sh
npm run dev
```

## Data model (Supabase)

- `tasks`: title, due_date, priority, completed, user_id
- `subtasks`: task_id, title, completed

If RLS is enabled, add policies that match your auth model (anonymous or authenticated).

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

```sh
npm run build
```

Deploy the `dist` folder to a static host (Netlify, Vercel, or Cloudflare Pages) and configure the same environment variables in the hosting provider.

## Roadmap ideas

- Auth UI and user onboarding
- Shared calendars and team views
- Smart filters and recurring tasks

## License

MIT
