# JX PMS 设计系统说明

## 1. 文档目的

本文档用于说明当前“常州晶雪节能 PMS”原型前端已落地的设计系统规则，方便核对视觉方向、页面结构、组件语义与后续扩展边界。

当前设计系统服务于以下工作区与模块：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约
- 成本管理
- 财务管理
- 现场与劳务管理
- 报表中心

## 2. 设计定位

### 2.1 视觉基调

- 风格定位：蓝色企业级项目驾驶舱
- 业务气质：稳重、清晰、偏经营管理
- 视觉目标：让用户一眼看清导航层级、经营指标、工作区入口和可执行动作
- 使用场景：桌面端优先，兼顾常规笔记本与大屏演示

### 2.2 设计原则

- 顶部导航、左侧导航、主内容区三段式结构保持稳定
- 用布局和层级表达系统复杂度，不依赖过度装饰
- 关键区域优先服务“看数、判断、执行”
- 文案统一使用 JX PMS 业务语义，不借用参考系统术语
- 错误反馈以页面内轻提示为主，不使用全局遮罩式报错

## 3. 页面结构规范

### 3.1 全局布局

系统采用三层结构：

1. 顶部蓝色总导航
2. 左侧功能导航
3. 右侧主工作区

当前布局规则：

- 顶栏高度：`72px`
- 左侧导航宽度：`200px`
- 主工作区背景：浅蓝灰渐变
- 主内容区以白底卡片、表格、区块栅格为主

### 3.2 顶部导航

顶部承担两件事：

- 品牌识别
- 高频工作区切换

当前顶部工作区入口：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约

### 3.3 左侧导航

左侧导航承担系统级模块切换。

当前一级模块：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约
- 成本管理
- 财务管理
- 现场与劳务管理
- 报表中心

当前展开二级菜单的模块：

- 合同履约
  - 销售合同
  - 采购合同
  - 劳务合同
  - 变更合同
- 成本管理
  - 三版本成本
  - 成本科目
  - 剩余材料
- 财务管理
  - 收款管理
  - 付款管理
  - 报销管理
  - 工资代发
  - 风险预警
- 现场与劳务管理
  - 劳务管理
  - 安全管理
  - 验收管理
  - 现场记录

说明：

- 采购执行当前仍保留一级入口
- 采购执行内部通过页内模块切换承载“采购执行 / 发运记录 / 材料动态”
- 项目空间首页当前维持一级入口，不做全局二级拆分

## 4. 颜色系统

当前在 [App.css](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.css) 中落地的核心颜色如下：

```css
:root {
  --bg: #eef4fb;
  --card: #ffffff;
  --line: #d7e3f3;
  --line-strong: #c3d5ee;
  --text: #18324f;
  --muted: #6e87a5;
  --brand: #157ae8;
  --brand-deep: #1159c4;
  --sidebar: #164f9c;
  --sidebar-deep: #104583;
  --danger: #f15f6f;
  --warning: #f7ab2f;
  --success: #27c48f;
  --info: #48a9ff;
}
```

颜色语义：

- `--brand / --brand-deep`：顶部导航、主按钮、核心高亮
- `--sidebar / --sidebar-deep`：左侧导航背景
- `--text`：页面主标题和主文本
- `--muted`：副标题、辅助说明、次级文案
- `--danger`：风险、逾期、阻断、红色预警
- `--warning`：待处理、执行中、黄色预警
- `--success`：正常、已完成、已支付、已齐全

## 5. 字体与排版

当前字体栈：

```css
font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
```

排版层级：

- 系统标题：约 `22px`
- 页面标题：`30px`
- 分区标题：`18px`
- 指标数字：`24px - 38px`
- 辅助说明：`12px - 13px`

## 6. 组件规范

### 6.1 按钮

核心文件：

- [ActionButton.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\ActionButton.js)

当前按钮类型：

- `btn-primary`：主动作，如新建、保存
- `btn-secondary`：次动作，如查询、返回、刷新
- `btn-danger`：删除类动作

### 6.2 表格

核心文件：

- [DataTable.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\DataTable.js)

规则：

- 表头使用清晰业务字段名
- 动作列固定放在最后
- 支持 `render` 自定义单元格

### 6.3 表单

核心文件：

- [FormCard.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\FormCard.js)

规则：

- 表单放在白底卡片中
- 顶部包含标题与副标题
- 录入区以双列为主，小屏下自动单列
- 长文本使用整行 `textarea`

### 6.4 必填项规范

当前已落地规则：

- 所有真实必填项在标签后显示红色 `*`
- 必填项定义与后端校验保持一致
- 当前项目表单必填字段：
  - 项目编号
  - 项目名称
  - 项目类型
  - 客户
  - 事业部
  - 项目经理
- 提交失败时优先展示中文字段名，不直接暴露后端字段名

### 6.5 状态标签

核心文件：

- [StatusBadge.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\StatusBadge.js)

当前状态统一映射为中文，例如：

- `PLANNING` -> `计划中`
- `IN_PROGRESS` -> `执行中`
- `DELAYED` -> `已延期`
- `APPROVED` -> `已审批`
- `COMPLETED` -> `已完成`
- `PAID` -> `已支付`
- `BLOCKED` -> `已阻断`
- `OVERDUE` -> `已逾期`

## 7. 页面模板规范

### 7.1 项目空间首页

固定结构：

1. 项目 Hero 区
2. 项目概况指标
3. 项目预警
4. 阶段推进
5. 高风险项目 Top5
6. 项目台账

### 7.2 项目详情页

固定结构：

1. 项目总览头部
2. 当前视角区
3. 合同摘要
4. 成本摘要
5. 收付款与风险
6. 采购与现场动态
7. 剩余材料

说明：

- 支持“项目总览 / 合同维度”联动
- 点击合同后驱动成本和财务区域切换

### 7.3 报表中心

固定结构：

1. 页面头部
2. 筛选区
3. 经营总览卡片
4. 三版本成本摘要
5. 发运回款风险表
6. 文件完备率说明

### 7.4 二级菜单首页

当前二级菜单页采用“轻量首页”方案，每页至少包含：

- 页面标题与中文说明
- 2 到 4 个统计卡片
- 当前业务台账主表
- 一个提醒区或摘要区

适用模块：

- 合同履约
- 成本管理
- 财务管理
- 现场与劳务管理

## 8. 交互规范

### 8.1 可编辑标准

“可编辑页面”必须满足：

- 有明确的新建按钮
- 有清晰的编辑入口
- 支持删除或取消
- 编辑后页面状态即时刷新

### 8.2 错误策略

当前原型采用轻提示策略：

- 不使用前台红色全屏 runtime overlay
- 不弹全局错误遮罩干扰主界面
- 请求失败时优先使用页面内提示或静默降级

### 8.3 ID 映射策略

表单体验规则：

- 不让用户手输 `项目 ID / 合同 ID`
- 前端只展示项目名称、合同名称
- 提交时由系统自动映射真实 ID

## 9. 当前边界

本轮设计系统已覆盖：

- 页面骨架
- 配色体系
- 字体层级
- KPI 卡片
- 白底业务面板
- 表格
- 表单
- 按钮
- 状态标签
- 响应式规则
- 左侧二级菜单
- 顶部高频工作区
- 必填项红色 `*` 规范

本轮尚未扩展到：

- 独立 Design Tokens 文件
- 组件文档站
- 深色模式
- 审批流专用组件
- 文件上传预览组件体系
- 图表库标准化规范

## 10. 建议重点核对

建议优先确认以下几点：

1. 顶部工作区命名是否准确
2. 左侧一级与二级菜单划分是否符合 JX PMS 业务口径
3. 蓝色驾驶舱视觉是否足够稳重、足够企业化
4. 项目空间首页与项目详情页的信息密度是否合适
5. 二级菜单首页的“轻量首页”承载方式是否符合评审预期
6. 必填项红色 `*` 和页面内错误提示是否清楚
7. 报表中心当前结构是否满足演示需要

## 11. 相关实现文件

- [App.css](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.css)
- [App.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.js)
- [ProjectList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ProjectManagement\ProjectList.js)
- [ProjectForm.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ProjectManagement\ProjectForm.js)
- [ProjectDetail.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ProjectManagement\ProjectDetail.js)
- [ReportsDashboard.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\Reports\ReportsDashboard.js)
- [ContractList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ContractManagement\ContractList.js)
- [FinanceList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\FinanceManagement\FinanceList.js)
- [CostList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\CostManagement\CostList.js)
- [SiteList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\SiteManagement\SiteList.js)
