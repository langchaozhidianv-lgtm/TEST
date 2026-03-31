# JX PMS 设计系统说明

## 1. 文档目的

本文档用于说明当前 `常州晶雪节能 PMS` 原型前端已经落地的设计系统规则，便于你核对视觉方向、页面结构、组件语义和后续扩展边界。

当前设计系统服务对象：

- 项目经营驾驶舱
- 项目空间首页
- 组织协同工作区
- 采购执行
- 合同履约
- 成本管理
- 财务管理
- 现场与劳务管理
- 报表中心

## 2. 设计定位

### 2.1 视觉基调

- 风格定位：蓝色企业级项目驾驶舱
- 业务气质：稳重、清晰、偏经营管理，不做花哨营销风
- 视觉目标：让用户一眼看到“导航层级、经营指标、工作区入口、可执行动作”
- 使用场景：桌面端优先，兼顾常规笔记本和大屏演示

### 2.2 设计原则

- 顶部导航、左侧导航、主内容区三段式结构保持稳定
- 以布局和层级表达系统复杂度，不依赖大量装饰卡片
- 关键区域优先服务“看数、判断、操作”
- 模块文案以 JX PMS 业务语义为准，不借用外部系统术语
- 交互反馈尽量轻量，不使用遮挡全局的报错覆盖层

## 3. 页面结构规范

### 3.1 全局布局

全局采用三层结构：

1. 顶部蓝色总导航
2. 左侧功能导航
3. 右侧主工作区

当前布局规则：

- 顶栏高度：`72px`
- 左侧导航宽度：`200px`
- 主工作区背景：浅蓝灰渐变底
- 主内容区内以模块卡片、表格、区块栅格为主

### 3.2 顶部导航

顶部承担两件事：

- 品牌识别
- 工作区快速切换

当前顶部一级工作区：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约

顶部导航设计规则：

- 主背景使用高饱和品牌蓝渐变
- 激活项用更深的蓝底高亮
- 搜索框与用户信息放在右侧

### 3.3 左侧导航

左侧导航承担系统级模块切换。

当前模块分组：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约
- 成本管理
- 财务管理
- 现场与劳务管理
- 报表中心

左侧导航规范：

- 深蓝色背景
- 当前页使用半透明高亮底
- 每个导航项包含：
  - 模块名称
  - 一句辅助说明

## 4. 颜色系统

### 4.1 主色变量

当前在 [App.css](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.css) 中已经落地的颜色变量如下：

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

### 4.2 颜色语义

- `--brand / --brand-deep`
  - 顶部导航、主按钮、核心高亮
- `--sidebar / --sidebar-deep`
  - 左侧导航背景
- `--text`
  - 主标题、主信息文本
- `--muted`
  - 辅助说明、次级文本
- `--danger`
  - 风险、逾期、阻断、红色预警
- `--warning`
  - 待处理、执行中、黄色预警
- `--success`
  - 正常、已审批、已完成、已支付

### 4.3 背景策略

- 页面总背景：浅蓝灰渐变
- 卡片背景：纯白
- 输入框背景：白到浅蓝的轻渐变
- 驾驶舱亮色卡片：仅用于 KPI、阶段、警示类信息，不滥用

## 5. 字体与排版

### 5.1 字体栈

当前全局字体：

```css
font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
```

### 5.2 排版层级

- 系统标题：`22px` 左右
- 页面标题：`30px`
- 分区标题：`18px`
- 重要指标数字：`24px - 38px`
- 辅助说明：`12px - 13px`

### 5.3 排版原则

- 大标题只承担页面识别
- 分区标题用于说明当前区域“看什么 / 做什么”
- 数字优先级高于装饰
- 辅助说明控制在一句话内

## 6. 圆角、边框与阴影

### 6.1 圆角体系

- 主容器 / 面板卡片：`18px`
- 次级区块：`14px - 16px`
- 按钮 / 输入框：`12px`
- 状态标签：`999px`

### 6.2 阴影体系

主阴影：

```css
--shadow: 0 18px 45px rgba(19, 62, 114, 0.10);
```

使用原则：

- 主要用于白底卡片、面板
- 不叠加过重阴影
- 以“浮起层级”而非“华丽装饰”为目标

## 7. 组件规范

### 7.1 按钮

来源文件：

- [ActionButton.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\ActionButton.js)

当前按钮类型：

- `btn-primary`
  - 主要动作，如新建、保存
- `btn-secondary`
  - 次要动作，如刷新、取消
- `btn-danger`
  - 删除类动作

使用原则：

- 一个区域只保留一个主按钮
- 删除按钮只放在编辑动作旁边，不单独突出

### 7.2 表格

来源文件：

- [DataTable.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\DataTable.js)

表格规则：

- 表头统一大写风格的次级标题视觉
- 行操作固定在最后一列
- 支持 `render` 自定义单元格
- 外层使用圆角和描边容器包裹

适用页面：

- 项目台账
- 合同履约
- 采购执行
- 现场记录
- 成本与财务列表
- 协同事项台账

### 7.3 表单卡片

来源文件：

- [FormCard.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\FormCard.js)

表单规范：

- 表单放在白底卡片中
- 顶部包含标题和副标题
- 输入字段使用双列布局
- 大字段如说明、条款、备注使用整行 `textarea`

### 7.4 状态标签

来源文件：

- [StatusBadge.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\StatusBadge.js)

当前状态体系已统一映射为中文，例如：

- `PLANNING` → `计划中`
- `IN_PROGRESS` → `执行中`
- `DELAYED` → `已延期`
- `APPROVED` → `已审批`
- `COMPLETED` → `已完成`
- `PAID` → `已支付`
- `BLOCKED` → `已阻断`
- `OVERDUE` → `已逾期`

颜色规则：

- 成功类：绿色
- 进行中 / 待处理类：黄色
- 风险 / 延期 / 阻断类：红色
- 其他状态：中性灰蓝

## 8. 栅格与响应式规则

当前主要栅格：

- `.grid.two`
- `.grid.three`
- `.grid.four`
- `.workspace-grid`
- `.project-section-grid`
- `.detail-section-grid`

响应式规则：

- `1320px` 以下：
  - 顶部改为多行
  - 左侧导航变为单列下排
  - 主体大区块切成单列
- `820px` 以下：
  - 主内容区统一单列
  - 表单改为单列
  - 顶部标签允许横向滚动

设计含义：

- 桌面端优先
- 平板和小屏保证“能看、能点、能录”
- 不追求手机端复杂运营视图

## 9. 页面模板规范

### 9.1 经营总览

定位：

- 顶部工作区首页
- 既能看经营指标，也能直接维护经营事项

固定结构：

1. 页面头部
2. 指标卡片
3. 左侧经营重点事项编辑与台账
4. 右侧经营周记与财务待跟进事项

编辑数据存储：

- 浏览器本地存储

### 9.2 组织协同

定位：

- 顶部工作区中的跨团队协同台账

固定结构：

1. 页面头部
2. 左侧编辑区
3. 右侧协同事项台账

建议字段：

- 协同团队
- 协同主题
- 责任人
- 截止日期
- 状态

### 9.3 采购执行

定位：

- 面向采购、发运、材料动态的执行台账

固定结构：

1. 页面头部
2. 类型筛选
3. 新建 / 编辑表单
4. 台账表格

当前分类：

- 采购执行
- 发运记录
- 材料动态

### 9.4 合同履约

定位：

- 销售、采购、劳务、变更合同统一管理

固定结构：

1. 页面头部
2. 合同指标概览
3. 新建 / 编辑合同表单
4. 合同履约台账

### 9.5 项目空间首页

定位：

- 项目经营全景页

固定结构：

1. 项目 Hero 区
2. 项目概况指标
3. 风险 / 预警统计
4. 项目节点
5. 合同、成本、财务、文件等子区块

## 10. 交互规范

### 10.1 可编辑原则

当前系统中“真正可编辑”的页面，必须满足：

- 有明显的新建按钮
- 有清晰的编辑入口
- 支持删除或取消
- 编辑后页面状态即时刷新

### 10.2 错误策略

当前原型错误策略：

- 不使用覆盖全屏的前台红色报错层
- 不默认弹全局错误框
- 接口失败时尽量静默或局部降级

### 10.3 ID 映射策略

当前表单体验原则：

- 不让用户手输 `项目 ID / 合同 ID`
- 前端只展示项目名称、合同名称
- 系统提交时自动带真实 ID

## 11. 当前已落地的工作区语义

顶部工作区已统一为以下口径：

- 经营总览
- 项目空间首页
- 组织协同
- 采购执行
- 合同履约

系统模块口径统一为：

- 项目管理
- 合同管理
- 成本管理
- 财务管理
- 材料与采购管理
- 现场与劳务管理
- 报表中心

## 12. 当前设计系统边界

本轮设计系统已经覆盖：

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
- 顶部四个工作区的编辑化口径

本轮尚未扩展到：

- 设计 Tokens 独立文件化
- 组件库文档站
- 深色模式
- 审批流专用组件
- 文件上传预览组件体系
- 图表库标准化规范

## 13. 建议你重点核对的内容

建议你优先核对下面几项是否符合你预期：

1. 顶部工作区命名是否准确
2. 左侧导航模块划分是否符合 JX PMS 业务口径
3. 蓝色驾驶舱视觉是否够稳重、够企业化
4. 经营总览与组织协同采用本地存储是否可接受
5. 采购执行和合同履约的台账布局是否符合实际使用习惯
6. 状态标签中文是否需要再细化
7. 项目空间首页是否需要再靠近你们内部汇报习惯

## 14. 相关实现文件

核心设计实现主要分布在以下文件：

- [App.css](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.css)
- [App.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\App.js)
- [ActionButton.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\ActionButton.js)
- [DataTable.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\DataTable.js)
- [FormCard.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\FormCard.js)
- [StatusBadge.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\components\Common\StatusBadge.js)
- [OperationsOverview.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\Workspace\OperationsOverview.js)
- [CollaborationWorkspace.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\Workspace\CollaborationWorkspace.js)
- [ProcurementList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ProcurementManagement\ProcurementList.js)
- [ContractList.js](D:\AI\codex\OPCSOHO\pms-prototype\frontend\src\pages\ContractManagement\ContractList.js)

