# REST API 详细文档

## 通用返回格式

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

分页返回：

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

## 项目接口

### `GET /api/projects`

- 用途：获取项目列表
- Query：
- `viewType`: `owned | participated | followed | subordinate | shared | created | all | closed`
- `keyword`: 项目名称关键字
- `ownerId`
- `creatorId`
- `status`
- `tag`
- `startDateFrom`
- `startDateTo`
- `sortBy`: `updatedAt | createdAt | endDate | feedbackAt | name | owner`
- `sortOrder`: `asc | desc`
- `page`
- `pageSize`

### `POST /api/projects`

- 用途：创建项目
- Body 样例：

```json
{
  "name": "CRM 二期项目",
  "description": "升级客户管理流程",
  "ownerId": "user_1",
  "startDate": "2026-03-16T00:00:00.000Z",
  "endDate": "2026-04-30T23:59:59.000Z",
  "participantIds": ["user_2", "user_3"],
  "shareUserIds": ["user_4"],
  "tags": ["重点项目", "销售"],
  "visibilityScope": "TEAM"
}
```

### `GET /api/projects/{id}`

- 用途：获取项目详情
- 返回：项目基础信息、任务分组、任务、依赖关系

### `PUT /api/projects/{id}`

- 用途：更新项目基础字段

### `POST /api/projects/{id}/close`

- 用途：关闭项目

### `POST /api/projects/{id}/reopen`

- 用途：重开项目

### `GET /api/projects/{id}/stats`

- 用途：获取单项目统计
- Query：
- `from`
- `to`
- `memberId`
- `groupBy`: `member | status | date`

### `GET /api/projects/stats/team`

- 用途：获取团队项目统计

## 任务接口

### `GET /api/projects/{id}/tasks`

- 用途：获取项目任务列表
- Query：
- `groupId`
- `assigneeId`
- `status`
- `keyword`

### `POST /api/projects/{id}/tasks`

- 用途：创建任务
- Body 样例：

```json
{
  "groupId": "group_1",
  "title": "设计数据库表结构",
  "description": "输出项目管理系统数据库设计",
  "assigneeId": "user_2",
  "reporterId": "user_1",
  "priority": "HIGH",
  "status": "READY",
  "progressPercent": 0,
  "startAt": "2026-03-16T00:00:00.000Z",
  "endAt": "2026-03-18T23:59:59.000Z",
  "dueAt": "2026-03-18T23:59:59.000Z",
  "sortOrder": 1
}
```

### `GET /api/tasks/{taskId}`

- 用途：获取任务详情

### `PUT /api/tasks/{taskId}`

- 用途：更新任务标题、负责人、优先级、状态、开始时间、结束时间、进度

### `POST /api/tasks/{taskId}/complete`

- 用途：完成任务
- Body：

```json
{
  "completedAt": "2026-03-18T10:20:00.000Z"
}
```

### `GET /api/tasks/{taskId}/comments`

- 用途：获取任务评论

### `POST /api/tasks/{taskId}/comments`

- 用途：新增任务评论

## 甘特图与依赖接口

### `GET /api/projects/{id}/gantt`

- 用途：获取甘特图数据
- Query：
- `viewMode`: `day | week | month`
- `groupBy`: `group | assignee`

### `POST /api/projects/{id}/task-dependencies`

- 用途：创建任务依赖
- Body：

```json
{
  "predecessorTaskId": "task_1",
  "successorTaskId": "task_2",
  "dependencyType": "FS",
  "lagDays": 0
}
```

## 动态、关联与日志接口

### `GET /api/projects/{id}/activities`

- 用途：获取项目动态流

### `GET /api/projects/{id}/relations`

- 用途：获取项目关联对象

### `POST /api/projects/{id}/relations`

- 用途：新增项目关联对象

### `GET /api/projects/{id}/read-logs`

- 用途：获取查阅记录

### `GET /api/projects/{id}/audit-logs`

- 用途：获取操作日志

## 成员与协作接口

### `GET /api/projects/{id}/members`

- 用途：获取项目参与成员

### `POST /api/projects/{id}/members`

- 用途：批量新增项目成员

### `GET /api/projects/{id}/shares`

- 用途：获取项目共享人

### `POST /api/projects/{id}/shares`

- 用途：批量新增共享人

### `GET /api/projects/{id}/task-groups`

- 用途：获取任务分组与组内任务

### `POST /api/projects/{id}/task-groups`

- 用途：新建任务分组

### `POST /api/projects/{id}/share-link`

- 用途：生成临时分享链接

### `POST /api/projects/{id}/urge`

- 用途：向项目成员发起催办

### `POST /api/projects/{id}/forward`

- 用途：转发项目给指定同事

## 当前实现说明

- 代码中已提供以上核心接口的 route handlers。
- 当前返回基于 `lib/mock-data.ts` 的示例数据，不做持久化。
- 下一步接 Prisma 时，可将 route handlers 中的 mock 查询替换成 service + repository 调用。
