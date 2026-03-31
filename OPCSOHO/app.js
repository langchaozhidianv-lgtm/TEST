const views = {
  dashboard: {
    title: "经营驾驶舱",
    description: "从项目、合同、成本、回款、采购和风险六个维度汇总项目健康度，适合管理层和项目负责人做晨会、周会审视。",
    metrics: [
      { label: "进行中项目", value: "42", note: "其中 8 个处于重点监控" },
      { label: "合同总额", value: "1.86 亿", note: "含增补订单 1320 万" },
      { label: "综合回款率", value: "68%", note: "本月到账 2140 万" },
      { label: "预警事项", value: "17", note: "延期 6 / 超支 4 / 风险 7" }
    ],
    panels: [
      {
        span: "wide",
        title: "核心经营指标",
        subtitle: "第一版原型聚焦项目主线、成本主线、回款主线和风险主线。",
        type: "bars",
        items: [
          { name: "项目进度按计划推进率", value: 74, text: "74%" },
          { name: "预算执行健康度", value: 81, text: "81%" },
          { name: "采购到货及时率", value: 67, text: "67%" },
          { name: "收款节点按期达成率", value: 59, text: "59%" }
        ]
      },
      {
        title: "重点延期项目",
        subtitle: "延期项目需要同时查看里程碑、采购到货和回款风险，不建议孤立看进度。",
        type: "list",
        items: [
          ["XM-2026-018", "南京医药冷库二期", "土建收尾延迟 9 天", "danger"],
          ["XM-2026-021", "苏州食品园区", "设备到货晚于计划 6 天", "warning"],
          ["XM-2026-015", "上海门体改造", "验收整改未闭环", "warning"]
        ]
      },
      {
        title: "待跟进回款",
        subtitle: "回款节点建议与合同条款、项目里程碑和发票状态一起查看。",
        type: "list",
        items: [
          ["华东冷链集团", "结算款 680 万", "逾期 12 天", "danger"],
          ["苏州晶源食品", "进度款 320 万", "本周到期", "warning"],
          ["成都生鲜仓储", "预付款 150 万", "资料待补齐", "warning"]
        ]
      },
      {
        title: "消息通知中心",
        subtitle: "将延期预警、预算超支、审批通知、到款提醒汇到一个入口。",
        type: "timeline",
        items: [
          ["09:20", "XM-2026-018 采购到货超期，已通知采购负责人和项目经理"],
          ["10:10", "南京医药冷库二期结算款逾期提醒已发送财务和销售内勤"],
          ["11:45", "苏州食品园区材料增补申请进入部门负责人审批"],
          ["14:05", "成都生鲜仓储质保金将在 30 天后到期"]
        ]
      }
    ]
  },
  projects: {
    title: "项目台账",
    description: "以项目唯一编号为主索引，统一查看项目、客户、合同、进度、成本、回款和当前风险状态。",
    metrics: [
      { label: "项目总数", value: "126", note: "冷库 / 建筑 / 门类全口径" },
      { label: "本月新建", value: "9", note: "含 OA 同步立项 6 个" },
      { label: "延期项目", value: "11", note: "已触发分级预警" },
      { label: "验收中", value: "7", note: "其中 3 个关联结算款" }
    ],
    panels: [
      {
        span: "wide",
        title: "项目列表",
        subtitle: "原型中先体现项目台账最关键的经营字段，后续可继续扩展角色视图。",
        type: "table",
        headers: ["项目", "项目经理", "成本状态", "项目状态"],
        rows: [
          ["XM-2026-018 / 南京医药冷库二期", "周海波", "预算执行 93%", '<span class="badge danger">延期中</span>'],
          ["XM-2026-021 / 苏州食品园区", "顾云飞", "预算执行 79%", '<span class="badge warning">进行中</span>'],
          ["XM-2026-015 / 上海门体改造", "李晓晨", "毛利偏低", '<span class="badge warning">验收整改</span>'],
          ["XM-2026-009 / 成都生鲜仓储", "宋佳宁", "成本正常", '<span class="badge">质保期</span>']
        ]
      },
      {
        title: "项目详情卡片",
        subtitle: "建议把详情页作为系统核心页面，所有业务都能回到同一项目视图。",
        type: "kv",
        items: [
          ["客户", "南京医药冷链有限公司"],
          ["项目类型", "冷库类 / 安装类"],
          ["合同额", "2,460 万"],
          ["计划完工", "2026-05-18"],
          ["当前节点", "设备安装 78%"],
          ["风险等级", "高"]
        ]
      },
      {
        title: "详情页结构",
        subtitle: "这部分决定后续数据库和接口是否容易扩展。",
        type: "timeline",
        items: [
          ["01", "基本信息 + 合同信息 + 客户信息"],
          ["02", "三版成本 + 收款/付款计划 + 发票状态"],
          ["03", "里程碑进度 + 采购到货 + 现场材料"],
          ["04", "变更签证 + 风险问题 + 文档档案 + 操作日志"]
        ]
      }
    ]
  },
  cost: {
    title: "成本中心",
    description: "成本模块最关键的是把签约成本、预算成本、实际成本三版数据放到同一项目和同一成本科目下对比。",
    metrics: [
      { label: "签约毛利率", value: "18.6%", note: "按签约成本基准" },
      { label: "预算毛利率", value: "15.2%", note: "预算编制后下修" },
      { label: "实际毛利率", value: "12.4%", note: "受人工及外采影响" },
      { label: "超预算项目", value: "4", note: "需触发专项审批" }
    ],
    panels: [
      {
        title: "三版成本对比",
        subtitle: "第一版只做可视化和差异提示，后续再接 ERP/OA 自动归集。",
        type: "bars",
        items: [
          { name: "主材", value: 88, text: "实际较预算 +8%" },
          { name: "辅材", value: 71, text: "实际较预算 +1%" },
          { name: "人工", value: 96, text: "实际较预算 +12%" },
          { name: "费用", value: 64, text: "实际较预算 -3%" }
        ]
      },
      {
        title: "成本异常穿透",
        subtitle: "异常不能停在报表层，要能落到采购单、报销单、劳务费用单据。",
        type: "list",
        items: [
          ["主材采购", "冷风机采购单 PO-8821", "单价高于价格库 6.5%", "danger"],
          ["安装劳务", "三标段安装班组", "工时超预算 14%", "danger"],
          ["现场增补", "保温辅材追加", "已进入专项审批", "warning"]
        ]
      },
      {
        title: "成本规则建议",
        subtitle: "这里也是后续系统规则引擎的基础。",
        type: "timeline",
        items: [
          ["规则 1", "无项目号单据不可提交审批"],
          ["规则 2", "超预算采购自动阻断并触发预算调整审批"],
          ["规则 3", "财务可按项目、科目、时间穿透到原始单据"],
          ["规则 4", "剩余材料处置结果回写实际成本"]
        ]
      }
    ]
  },
  finance: {
    title: "收付款与应收",
    description: "回款计划要和合同条款、项目里程碑、验收结算和发票状态联动，付款计划则要和采购合同、预算与验收凭证联动。",
    metrics: [
      { label: "计划应收", value: "5,480 万", note: "未来 90 天" },
      { label: "逾期应收", value: "920 万", note: "9 个项目" },
      { label: "待付款", value: "2,160 万", note: "含劳务与采购" },
      { label: "质保金台账", value: "760 万", note: "31 个节点" }
    ],
    panels: [
      {
        span: "wide",
        title: "收款计划台账",
        subtitle: "建议在同一列表看到项目、客户、节点类型、金额、进度条件和逾期状态。",
        type: "table",
        headers: ["节点", "条件", "金额", "状态"],
        rows: [
          ["南京医药冷库二期 / 结算款", "验收报告待归档", "680 万", '<span class="badge danger">逾期 12 天</span>'],
          ["苏州食品园区 / 进度款", "安装完成 80%", "320 万", '<span class="badge warning">本周到期</span>'],
          ["上海门体改造 / 质保金", "质保期结束后 30 天", "95 万", '<span class="badge">正常</span>']
        ]
      },
      {
        title: "付款申请前校验",
        subtitle: "付款不是单独流程，必须校验合同、预算、发票、验收和项目号。",
        type: "timeline",
        items: [
          ["校验 1", "是否关联采购合同和项目编号"],
          ["校验 2", "是否满足付款条件和验收节点"],
          ["校验 3", "是否超项目科目预算"],
          ["校验 4", "发票与附件是否齐全"]
        ]
      },
      {
        title: "业财联动价值",
        subtitle: "这是原型评审时最容易打动业务的一块。",
        type: "list",
        items: [
          ["回款认领", "同一客户多项目到账可在线拆分认领", "减少线下对账", "warning"],
          ["应收分析", "自动区分已开票未收、未开票、逾期", "支持月底报表", "warning"],
          ["质保金管理", "到期自动预警并回写应收台账", "闭环回收", "warning"]
        ]
      }
    ]
  },
  procurement: {
    title: "采购与现场",
    description: "采购模块不是只看下单，而是围绕项目施工计划、物料价格库、到货签收和现场材料消耗形成闭环。",
    metrics: [
      { label: "采购申请", value: "28", note: "本周新增" },
      { label: "在途订单", value: "46", note: "含主材和服务采购" },
      { label: "超期未到货", value: "5", note: "已触发分级预警" },
      { label: "现场增补", value: "7", note: "其中 2 个超预算" }
    ],
    panels: [
      {
        title: "采购执行进度",
        subtitle: "建议用一眼能看懂的节点链路展示下单、生产、发运、到货、签收。",
        type: "timeline",
        items: [
          ["PO-8821", "冷风机已下单，供应商排产中"],
          ["PO-8804", "保温板已发运，预计 3 月 31 日到场"],
          ["PO-8762", "阀件已到货待现场签收上传照片"],
          ["PO-8710", "安装辅材超期未到货，风险升级"]
        ]
      },
      {
        title: "价格库与预算联动",
        subtitle: "这是销售报价、预算编制和采购执行共用的数据底座。",
        type: "bars",
        items: [
          { name: "冷风机月度价格更新率", value: 92, text: "92%" },
          { name: "主材价格同步到预算", value: 86, text: "86%" },
          { name: "超预算采购阻断命中率", value: 78, text: "78%" }
        ]
      },
      {
        title: "现场材料管理",
        subtitle: "原型先体现计划、到货、盘点、领用四个最核心动作。",
        type: "list",
        items: [
          ["需求计划", "按月/周提报，与施工计划联动", "保障备料", "warning"],
          ["签收闭环", "到货后上传签收人与现场照片", "避免账实不符", "warning"],
          ["库存消耗", "领用与盘点在线留痕", "减少浪费", "warning"]
        ]
      }
    ]
  },
  risk: {
    title: "风险、问题与变更",
    description: "把风险识别、安全质量、客户投诉、设计变更、现场签证都统一放到问题闭环机制里，方便项目全过程留痕。",
    metrics: [
      { label: "高风险事项", value: "7", note: "需管理层关注" },
      { label: "整改处理中", value: "14", note: "安全 / 质量 / 客诉" },
      { label: "变更审批中", value: "6", note: "含增补与设计变更" },
      { label: "已闭环", value: "31", note: "本季度累计" }
    ],
    panels: [
      {
        title: "问题闭环流程",
        subtitle: "问题上报后要能自动派单、定责、整改、验收、归档。",
        type: "timeline",
        items: [
          ["上报", "支持照片、视频、现场说明"],
          ["派单", "自动同步责任人和处理时限"],
          ["整改", "过程照片与进度实时回传"],
          ["验收", "通过后归档，不通过重新触发整改"]
        ]
      },
      {
        title: "变更与签证",
        subtitle: "建议变更页直接体现对成本、工期、收付款的联动影响。",
        type: "list",
        items: [
          ["设计变更 VC-221", "新增冷库保温层加厚", "成本影响 +42 万", "danger"],
          ["现场签证 SG-108", "吊装条件受限增加机械费", "待财务复核", "warning"],
          ["增补订单 AD-032", "客户追加缓冲间门体", "已进入审批", "warning"]
        ]
      },
      {
        title: "安全质量档案",
        subtitle: "安全交底、技术交底、隐患整改、质量验收建议沉淀到统一项目档案。",
        type: "kv",
        items: [
          ["安全交底记录", "128 份"],
          ["技术交底记录", "93 份"],
          ["质量问题整改", "21 条"],
          ["客户投诉闭环", "5 条"],
          ["风险评估表", "42 份"],
          ["归档完整率", "89%"]
        ]
      }
    ]
  },
  docs: {
    title: "文档与报表",
    description: "文档库和报表中心负责承接项目全生命周期资料，并为管理层、财务和业务部门提供统一口径的输出。",
    metrics: [
      { label: "项目文档数", value: "3,286", note: "图纸/合同/验收/票据等" },
      { label: "敏感文档", value: "186", note: "财务加密权限" },
      { label: "自动报表", value: "12", note: "日报/周报/月报模板" },
      { label: "版本冲突", value: "3", note: "待管理员处理" }
    ],
    panels: [
      {
        title: "文档库分类",
        subtitle: "第一版原型建议先按业务最常用的分类做入口，不急着把所有文件树做满。",
        type: "list",
        items: [
          ["合同文件", "销售合同、采购合同、增补单", "角色权限控制", "warning"],
          ["工程资料", "图纸、技术协议、施工日志、验收报告", "支持版本管理", "warning"],
          ["财务凭证", "发票、回单、付款审批单、对账函", "加密访问", "danger"]
        ]
      },
      {
        title: "报表中心",
        subtitle: "建议报表按经营口径和财务口径双视图展示，避免双方各做一套台账。",
        type: "timeline",
        items: [
          ["进度报表", "里程碑完成率 / 延期项目清单"],
          ["成本报表", "三版成本差异 / 毛利分析"],
          ["收款报表", "计划应收 / 到期应收 / 逾期应收"],
          ["综合经营报表", "项目利润、回款、风险联动分析"]
        ]
      },
      {
        title: "系统底座建议",
        subtitle: "文档、日志、主数据和权限是后续可持续扩展的基础。",
        type: "kv",
        items: [
          ["主数据管理", "项目、客户、供应商、物料、成本科目"],
          ["权限模型", "查看 / 编辑 / 审批 / 导出分层控制"],
          ["操作日志", "登录、修改、审批、导出全留痕"],
          ["通知中心", "站内消息 + 邮件规则"],
          ["系统集成", "OA / ERP / CRM 数据同步"]
        ]
      }
    ]
  }
};

const navItems = [
  ["dashboard", "驾驶舱"],
  ["projects", "项目台账"],
  ["cost", "成本中心"],
  ["finance", "收付款"],
  ["procurement", "采购与现场"],
  ["risk", "风险与变更"],
  ["docs", "文档与报表"]
];

const navEl = document.getElementById("nav");
const titleEl = document.getElementById("page-title");
const descEl = document.getElementById("page-description");
const metricsEl = document.getElementById("metrics");
const contentEl = document.getElementById("content");

let currentView = "dashboard";

function renderNav() {
  navEl.innerHTML = navItems.map(([id, label]) => `
    <button class="${id === currentView ? "active" : ""}" data-view="${id}">
      ${label}
    </button>
  `).join("");

  navEl.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      render();
    });
  });
}

function renderMetrics(metrics) {
  metricsEl.innerHTML = metrics.map((item) => `
    <article class="metric">
      <p class="eyebrow">${item.label}</p>
      <strong>${item.value}</strong>
      <span>${item.note}</span>
    </article>
  `).join("");
}

function renderPanel(panel) {
  const spanClass = panel.span ? ` ${panel.span}` : "";
  let body = "";

  if (panel.type === "list") {
    body = `<div class="list">${panel.items.map(([title, meta, tail, tone]) => `
      <div class="list-item">
        <div class="row-title">${title}</div>
        <div class="meta">${meta}</div>
        <span class="badge ${tone === "danger" ? "danger" : tone === "warning" ? "warning" : ""}">${tail}</span>
      </div>
    `).join("")}</div>`;
  }

  if (panel.type === "timeline") {
    body = `<div class="timeline">${panel.items.map(([step, text]) => `
      <div class="timeline-item">
        <div class="timeline-title">${step}</div>
        <div class="meta">${text}</div>
      </div>
    `).join("")}</div>`;
  }

  if (panel.type === "bars") {
    body = `<div class="bars">${panel.items.map((item) => `
      <div>
        <div class="bar-label"><span>${item.name}</span><strong>${item.text}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${item.value}%"></div></div>
      </div>
    `).join("")}</div>`;
  }

  if (panel.type === "table") {
    body = `
      <div class="table">
        <div class="table-row table-head">${panel.headers.map((header) => `<div>${header}</div>`).join("")}</div>
        ${panel.rows.map((row) => `<div class="table-row">${row.map((col) => `<div>${col}</div>`).join("")}</div>`).join("")}
      </div>
    `;
  }

  if (panel.type === "kv") {
    body = `<div class="two-col">${panel.items.map(([label, value]) => `
      <div class="list-item">
        <div class="meta">${label}</div>
        <div class="row-title">${value}</div>
      </div>
    `).join("")}</div>`;
  }

  return `
    <article class="panel${spanClass}">
      <h3>${panel.title}</h3>
      <p class="subtle">${panel.subtitle}</p>
      ${body}
    </article>
  `;
}

function render() {
  const view = views[currentView];
  titleEl.textContent = view.title;
  descEl.textContent = view.description;
  renderNav();
  renderMetrics(view.metrics);
  contentEl.innerHTML = view.panels.map(renderPanel).join("");
}

render();
