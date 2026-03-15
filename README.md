# 项目管理系统 MVP

一个从空仓库搭起的可继续开发版本，目标是承接“项目 CRUD + 任务看板 + 甘特图 + 依赖关系 + 动态流 + 统计”这条主线。

## 已落地内容

- Next.js + TypeScript 工程骨架
- `prisma/schema.prisma`
- MySQL 初始化 SQL：`prisma/migrations/0001_init/migration.sql`
- REST API 详细文档：`docs/rest-api.md`
- 页面路由与核心组件骨架
- 本地 mock 数据驱动的最小展示版
- 团队统计页、成员/共享面板、催办/转发/分享链接 API

## 页面路由

- `/projects`
- `/projects/[projectId]`
- `/projects/stats/team`
- `/api/projects`
- `/api/projects/[projectId]`
- `/api/projects/[projectId]/members`
- `/api/projects/[projectId]/shares`
- `/api/projects/[projectId]/task-groups`
- `/api/projects/[projectId]/share-link`
- `/api/projects/[projectId]/urge`
- `/api/projects/[projectId]/forward`
- `/api/projects/[projectId]/tasks`
- `/api/projects/[projectId]/gantt`
- `/api/projects/[projectId]/stats`
- `/api/projects/[projectId]/task-dependencies`
- `/api/tasks/[taskId]`
- `/api/tasks/[taskId]/complete`
- `/api/tasks/[taskId]/comments`

## 本地运行

1. 安装依赖：`npm install`
2. 启动开发环境：`npm run dev`
3. 打开 [http://localhost:3000/projects](http://localhost:3000/projects)

也可以直接访问 [http://localhost:3000](http://localhost:3000)，系统会自动跳转到项目列表。

当前启动脚本已监听 `0.0.0.0:3000`，如果你在局域网内调试，也可以用这台机器的局域网 IP 访问。

## 下一步建议

- 把 mock 数据存储替换成 Prisma + MySQL
- 补齐真实鉴权、权限校验、循环依赖校验和拖拽交互
- 基于 `docs/rest-api.md` 继续补 OpenAPI 3.0 YAML
- 把催办、转发、分享链接接入真实通知通道与权限策略
