# JX PMS 可演示原型

常州晶雪节能项目管理系统原型，技术栈为 `MySQL + Node.js + Express + React`。

## 当前本地状态

- MySQL 已验证：`root / Seeyon*123 / pms_prototype`
- 后端健康检查：`http://localhost:5000/api/health`
- 前端开发地址：`http://localhost:3000`
- 前端构建入口：`frontend/build/index.html`

## 已实现模块

- 项目管理：项目台账、项目详情、文件校验、基础 CRUD
- 合同管理：销售、采购、劳务、变更合同台账与维护
- 成本管理：签约 / 预算 / 实际三版本成本对比、剩余材料
- 财务管理：收付款计划、付款申请、预付款提示、风险预警
- 材料与采购管理：采购、发运、材料动态
- 现场与劳务管理：劳务、安全、验收、现场记录
- 报表中心：项目经营总览、三版本成本、发运回款风险、文件完备率

## 关键业务规则

1. 所有付款或报销事项必须关联 `project_id`
2. 付款或报销超过预算时自动阻断，并生成 `budget_adjustments` 记录
3. 提交付款时校验历史预付款，并返回优先核销提醒
4. 当 `shipped_amount - collected_amount` 超过阈值时，Dashboard 显示红色预警
5. 项目结算或进入下一流程前，必须校验 `CONTRACT / SAFETY_DISCLOSURE / ACCEPTANCE_FORM`

## 项目结构

```text
pms-prototype/
├── backend/
├── frontend/
├── database/
└── README.md
```

## 数据库初始化

PowerShell:

```powershell
Get-Content -Raw database\schema.sql | & "D:\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u root --password="Seeyon*123"
Get-Content -Raw -Encoding UTF8 database\seed.sql | & "D:\MySQL\MySQL Server 8.0\bin\mysql.exe" --default-character-set=utf8mb4 -u root --password="Seeyon*123" pms_prototype
```

说明：

- `database/schema.sql` 会重建 `pms_prototype`
- `database/seed.sql` 已包含正式中文样例数据

## 后端启动

```powershell
cd backend
npm install
npm run dev
```

环境变量位于 [backend/.env](D:\AI\codex\OPCSOHO\pms-prototype\backend\.env)：

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Seeyon*123
DB_NAME=pms_prototype
PAYMENT_RISK_THRESHOLD=1000000
```

后端基础地址：

```text
http://localhost:5000/api
```

## 前端启动

```powershell
cd frontend
npm install
npm start
```

前端地址：

```text
http://localhost:3000
```

如果需要自定义接口地址，可配置：

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 新增独立页面入口

- 项目详情页：`/projects/:id/detail`
- 文件校验页：`/projects/:id/files`
- 报表页：`/reports`

浏览器示例：

- [http://localhost:3000/projects/1/detail](http://localhost:3000/projects/1/detail)
- [http://localhost:3000/projects/1/files](http://localhost:3000/projects/1/files)
- [http://localhost:3000/reports](http://localhost:3000/reports)

## 样例数据内容

- 2 个项目
- 每个项目至少 2 个合同
- 三版本成本数据
- 收款计划、收款、预付款、付款申请、工资代发
- 采购、发运、劳务、安全、验收记录
- 剩余材料记录
- Dashboard 风险预警数据

## 接口示例

健康检查：

```bash
curl http://localhost:5000/api/health
```

Dashboard：

```bash
curl http://localhost:5000/api/projects/dashboard
```

项目列表：

```bash
curl http://localhost:5000/api/projects
```

项目聚合详情：

```bash
curl http://localhost:5000/api/projects/1/detail
```

文件校验：

```bash
curl http://localhost:5000/api/projects/1/validate-documents
```

成本对比：

```bash
curl http://localhost:5000/api/costs/comparison/1
```

付款风险预警：

```bash
curl "http://localhost:5000/api/finance/alerts/payment-risk?threshold=1000000"
```

创建项目：

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"project_code":"XM-2026-030","name":"常州冷链三期项目","project_type":"COLD_STORAGE","business_type":"EPC","customer_name":"常州冷链集团","division_name":"工程事业部","project_manager":"王磊","status":"PLANNING","contract_amount":8500000}'
```

创建付款申请：

```bash
curl -X POST http://localhost:5000/api/finance \
  -H "Content-Type: application/json" \
  -d '{"project_id":1,"contract_id":2,"transaction_type":"PAYMENT_REQUEST","direction":"EXPENSE","amount":1200000,"due_date":"2026-04-05","vendor_name":"常州冷机设备有限公司","applicant":"采购经理","notes":"第二笔付款申请"}'
```

## 本轮已验证

- 后端 `http://localhost:5000/api/health` 返回 200
- 后端 `http://localhost:5000/api/projects/1/detail` 返回 200
- 前端 `npm run build` 已通过
- 中文种子数据已导入并通过 Node 连接池查询验证

## 后续可继续扩展

- 审批流与消息中心
- 真实文件上传
- 权限与角色控制
- 更丰富的 BI 图表
- 供应商与价格库管理
