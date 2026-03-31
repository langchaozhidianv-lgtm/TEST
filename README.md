# Atlas Projects

A runnable bilingual project management system built with Next.js, Prisma, and MySQL.

## Included Scope

- Project list with search, filter, and sort
- Project detail page
- Task board with groups and cross-group move
- Gantt view with schedule editing and dependency management
- Activity feed and audit logs
- Single-project stats and team stats
- Members, viewers, relations, urge, and forward workflows
- Chinese and English UI toggle
- Prisma + MySQL persistence

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Prisma
- MySQL

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example`

```env
DATABASE_URL="mysql://root:password@localhost:3306/project_management"
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Push schema to MySQL

```bash
npm run db:push
```

5. Seed demo data

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

7. Open the browser

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/projects](http://localhost:3000/projects)

## Main Routes

- `/projects`
- `/projects/[projectId]`
- `/projects/stats/team`

## API Highlights

- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/[projectId]`
- `POST /api/projects/[projectId]/close`
- `POST /api/projects/[projectId]/reopen`
- `GET/POST /api/projects/[projectId]/tasks`
- `PUT/DELETE /api/tasks/[taskId]`
- `POST /api/tasks/[taskId]/move`
- `POST /api/projects/[projectId]/tasks/batch-schedule`
- `GET/POST /api/projects/[projectId]/task-dependencies`

## Project Docs

- [REST API](./docs/rest-api.md)
- [Final Handoff](./docs/final-handoff.md)
- [Acceptance Checklist](./docs/acceptance-checklist.md)

## Current Status

The app is in a deliverable MVP-plus state:

- Core CRUD is backed by MySQL
- Major collaboration flows are available in the UI
- Logging and activity tracking are enabled
- Remaining work is mainly polish and advanced scheduling UX
