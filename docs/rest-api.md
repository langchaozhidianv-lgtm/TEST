# REST API

## Response Format

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

Paginated response:

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [],
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
}
```

## Projects

### `GET /api/projects`

Query:

- `viewType`
- `keyword`
- `ownerId`
- `creatorId`
- `status`
- `tag`
- `startDateFrom`
- `startDateTo`
- `sortBy`
- `sortOrder`
- `page`
- `pageSize`

### `POST /api/projects`

Create a project.

### `GET /api/projects/{id}`

Get project detail.

### `PUT /api/projects/{id}`

Update project fields.

### `DELETE /api/projects/{id}`

Delete a project and related records.

### `POST /api/projects/{id}/close`

Close the project.

### `POST /api/projects/{id}/reopen`

Reopen the project.

### `GET /api/projects/{id}/stats`

Get single-project stats.

### `GET /api/projects/stats/team`

Get team-level project stats.

## Members And Shares

### `POST /api/projects/{id}/members`

Add participants.

### `DELETE /api/projects/{id}/members/{userId}`

Remove a participant.

### `POST /api/projects/{id}/shares`

Add viewers.

### `DELETE /api/projects/{id}/shares/{userId}`

Remove a viewer.

## Task Groups

### `GET /api/projects/{id}/task-groups`

Get task groups and tasks.

### `POST /api/projects/{id}/task-groups`

Create a task group.

### `PUT /api/task-groups/{groupId}`

Rename or update a task group.

### `DELETE /api/task-groups/{groupId}`

Delete a task group.

## Tasks

### `GET /api/projects/{id}/tasks`

Get project tasks.

### `POST /api/projects/{id}/tasks`

Create a task.

### `GET /api/tasks/{taskId}`

Get task detail.

### `PUT /api/tasks/{taskId}`

Update a task.

### `DELETE /api/tasks/{taskId}`

Delete a task.

### `POST /api/tasks/{taskId}/move`

Move task to another group.

### `POST /api/tasks/{taskId}/complete`

Mark task as complete.

### `GET /api/tasks/{taskId}/comments`

Get task comments.

### `POST /api/tasks/{taskId}/comments`

Add task comment.

### `POST /api/projects/{id}/tasks/batch-schedule`

Batch update task schedule values.

## Dependencies

### `GET /api/projects/{id}/gantt`

Get gantt data, tasks, and dependencies.

### `POST /api/projects/{id}/task-dependencies`

Create a dependency.

### `DELETE /api/projects/{id}/task-dependencies/{dependencyId}`

Delete a dependency.

### `POST /api/projects/{id}/task-dependencies/batch`

Batch update dependencies.

## Relations

### `GET /api/projects/{id}/relations`

Get related records.

### `POST /api/projects/{id}/relations`

Create a related record.

### `DELETE /api/projects/{id}/relations/{relationId}`

Delete a related record.

## Activity And Logs

### `GET /api/projects/{id}/activities`

Get activity feed.

### `GET /api/projects/{id}/read-logs`

Get read logs.

### `GET /api/projects/{id}/audit-logs`

Get audit logs.

## Collaboration

### `POST /api/projects/{id}/urge`

Send an urge.

### `POST /api/projects/{id}/forward`

Forward a project.

### `POST /api/projects/{id}/share-link`

Generate or refresh a share link.
