# Acceptance Checklist

## Environment

- [ ] MySQL is running on `localhost:3306`
- [ ] `DATABASE_URL` is configured in `.env`
- [ ] `npm install` completed successfully
- [ ] `npm run prisma:generate` completed successfully
- [ ] `npm run db:push` completed successfully
- [ ] `npm run db:seed` completed successfully
- [ ] `npm run dev` starts the app

## Project Management

- [ ] Create a project from `/projects`
- [ ] Edit project name, owner, dates, and tags
- [ ] Delete a project
- [ ] Close a project
- [ ] Reopen a project
- [ ] Search projects by keyword
- [ ] Filter projects by status and owner
- [ ] Sort projects by update time, create time, end date, and name

## Members And Sharing

- [ ] Add a participant
- [ ] Remove a participant
- [ ] Add a viewer
- [ ] Remove a viewer

## Tasks

- [ ] Create a task
- [ ] Edit a task
- [ ] Delete a task
- [ ] Create a task group
- [ ] Rename a task group
- [ ] Delete a non-default task group
- [ ] Move a task to another group

## Scheduling And Dependencies

- [ ] Edit task schedule from the gantt section
- [ ] Create a dependency
- [ ] Delete a dependency
- [ ] Verify updated dates sync back to the task board

## Collaboration

- [ ] Add a related record
- [ ] Delete a related record
- [ ] Send an urge
- [ ] Forward a project
- [ ] Confirm share link is visible

## Logs And Reporting

- [ ] Activity feed shows recent operations
- [ ] Audit log shows key mutations
- [ ] Team stats page loads correctly
- [ ] Project stats render correctly on detail page
