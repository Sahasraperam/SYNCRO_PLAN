# SYNCRO_PLAN

SYNCRO_PLAN is a calendar-first task manager that keeps your schedule and tasks in one place. It is designed for quick planning, clear priorities, and a focused daily view.

## Key features

- Calendar views (day, week, month) with task context
- Task list with priority and due date tracking
- Subtasks and completion status
- Responsive layout for desktop and mobile

## Screenshots or demo

Add a few screenshots or a short GIF demo here.

## Local setup

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

Package manager: this project uses npm. The lockfile is `package-lock.json`.

Configure environment variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Run the app:

```sh
npm run dev
```

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

Build the app:

```sh
npm run build
```

Then deploy the `dist` folder to a static host such as Netlify, Vercel, or Cloudflare Pages. Make sure your environment variables are configured in the hosting provider.

## License

MIT
