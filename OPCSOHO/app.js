const projects = [
  {
    id: "XM-2026-018",
    name: "南京医药冷库二期",
    manager: "周海波",
    customer: "南京医药冷链有限公司",
    plannedFinish: "2026-05-18",
    phases: [
      {
        name: "深化设计",
        weight: 15,
        deliverablesReady: true,
        tasks: [
          { id: "T-101", name: "现场踏勘确认", owner: "工程部", progress: 100, milestone: true, status: "done", due: "2026-03-05" },
          { id: "T-102", name: "施工图深化", owner: "设计部", progress: 100, milestone: false, status: "done", due: "2026-03-08" },
          { id: "T-103", name: "客户图纸确认", owner: "销售部", progress: 100, milestone: true, status: "done", due: "2026-03-10" }
        ]
      },
      {
        name: "采购到货",
        weight: 30,
        deliverablesReady: false,
        tasks: [
          { id: "T-201", name: "主设备下单", owner: "采购部", progress: 100, milestone: true, status: "done", due: "2026-03-18" },
          { id: "T-202", name: "冷风机到货", owner: "采购部", progress: 60, milestone: true, status: "delayed", due: "2026-03-26" },
          { id: "T-203", name: "阀件到场签收", owner: "仓储组", progress: 80, milestone: false, status: "in_progress", due: "2026-03-28" }
        ]
      },
      {
        name: "现场安装",
        weight: 35,
        deliverablesReady: false,
        tasks: [
          { id: "T-301", name: "基础复核", owner: "工程部", progress: 100, milestone: false, status: "done", due: "2026-03-22" },
          { id: "T-302", name: "设备安装", owner: "工程部", progress: 78, milestone: true, status: "in_progress", due: "2026-04-08" },
          { id: "T-303", name: "保温收口整改", owner: "施工班组", progress: 45, milestone: false, status: "blocked", due: "2026-04-02" }
        ]
      },
      {
        name: "验收结算",
        weight: 20,
        deliverablesReady: false,
        tasks: [
          { id: "T-401", name: "联调测试", owner: "工程部", progress: 0, milestone: true, status: "todo", due: "2026-04-20" },
          { id: "T-402", name: "验收资料归档", owner: "资料员", progress: 0, milestone: true, status: "todo", due: "2026-04-24" }
        ]
      }
    ]
  },
  {
    id: "XM-2026-021",
    name: "苏州食品园区",
    manager: "顾云飞",
    customer: "苏州晶源食品",
    plannedFinish: "2026-06-02",
    phases: [
      {
        name: "深化设计",
        weight: 20,
        deliverablesReady: true,
        tasks: [
          { id: "T-501", name: "方案确认", owner: "设计部", progress: 100, milestone: true, status: "done", due: "2026-03-03" },
          { id: "T-502", name: "施工图会签", owner: "设计部", progress: 100, milestone: true, status: "done", due: "2026-03-09" }
        ]
      },
      {
        name: "采购到货",
        weight: 35,
        deliverablesReady: true,
        tasks: [
          { id: "T-601", name: "主材下单", owner: "采购部", progress: 100, milestone: true, status: "done", due: "2026-03-15" },
          { id: "T-602", name: "主材到货", owner: "采购部", progress: 90, milestone: true, status: "in_progress", due: "2026-03-30" },
          { id: "T-603", name: "签收回单上传", owner: "仓储组", progress: 100, milestone: false, status: "done", due: "2026-03-31" }
        ]
      },
      {
        name: "现场安装",
        weight: 30,
        deliverablesReady: false,
        tasks: [
          { id: "T-701", name: "现场放线", owner: "工程部", progress: 100, milestone: false, status: "done", due: "2026-03-24" },
          { id: "T-702", name: "设备安装", owner: "工程部", progress: 55, milestone: true, status: "in_progress", due: "2026-04-10" }
        ]
      },
      {
        name: "验收结算",
        weight: 15,
        deliverablesReady: false,
        tasks: [
          { id: "T-801", name: "验收计划排定", owner: "项目经理", progress: 20, milestone: false, status: "todo", due: "2026-04-18" }
        ]
      }
    ]
  },
  {
    id: "XM-2026-015",
    name: "上海门体改造",
    manager: "李晓晴",
    customer: "华东物流园",
    plannedFinish: "2026-04-20",
    phases: [
      {
        name: "方案确认",
        weight: 20,
        deliverablesReady: true,
        tasks: [
          { id: "T-901", name: "改造方案确认", owner: "销售部", progress: 100, milestone: true, status: "done", due: "2026-02-28" }
        ]
      },
      {
        name: "施工整改",
        weight: 50,
        deliverablesReady: true,
        tasks: [
          { id: "T-902", name: "门体拆改", owner: "工程部", progress: 100, milestone: false, status: "done", due: "2026-03-12" },
          { id: "T-903", name: "密封整改", owner: "施工班组", progress: 100, milestone: true, status: "done", due: "2026-03-20" }
        ]
      },
      {
        name: "验收整改",
        weight: 30,
        deliverablesReady: false,
        tasks: [
          { id: "T-904", name: "客户复验", owner: "项目经理", progress: 65, milestone: true, status: "in_progress", due: "2026-04-04" },
          { id: "T-905", name: "结算资料提交", owner: "资料员", progress: 30, milestone: true, status: "blocked", due: "2026-04-06" }
        ]
      }
    ]
  }
];

const phaseTemplates = [
  {
    projectType: "冷库项目模板",
    applyTo: "南京医药冷库二期 / 苏州食品园区",
    stages: ["深化设计", "采购到货", "现场安装", "验收结算"],
    rule: "按冷链工程标准阶段预置，立项后自动带出"
  },
  {
    projectType: "门体改造模板",
    applyTo: "上海门体改造",
    stages: ["方案确认", "施工整改", "验收整改"],
    rule: "按改造类短周期项目预置，可减少不必要阶段"
  }
];

function phaseProgress(phase) {
  return Math.round(phase.tasks.reduce((sum, task) => sum + task.progress, 0) / phase.tasks.length);
}

function phaseStatus(phase) {
  const hasBlocked = phase.tasks.some((task) => task.status === "blocked");
  const hasDelayedMilestone = phase.tasks.some((task) => task.milestone && task.status === "delayed");
  const allDone = phase.tasks.every((task) => task.status === "done");

  if (allDone && phase.deliverablesReady) return "done";
  if (hasBlocked || hasDelayedMilestone) return "risk";
  if (phaseProgress(phase) > 0) return "active";
  return "todo";
}

function summarizeProject(project) {
  const phases = project.phases.map((phase) => ({
    ...phase,
    progress: phaseProgress(phase),
    state: phaseStatus(phase)
  }));
  const tasks = phases.flatMap((phase) =>
    phase.tasks.map((task) => ({
      ...task,
      phaseName: phase.name
    }))
  );
  const progress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress * phase.weight, 0) /
    phases.reduce((sum, phase) => sum + phase.weight, 0)
  );
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const delayedTasks = tasks.filter((task) => task.status === "delayed").length;
  const openTasks = tasks.filter((task) => task.status !== "done").length;

  return {
    ...project,
    phases,
    tasks,
    progress,
    blockedTasks,
    delayedTasks,
    openTasks,
    state: blockedTasks || delayedTasks ? "风险" : openTasks ? "进行中" : "已完成"
  };
}

const projectSummaries = projects.map(summarizeProject);
let currentProjectId = projectSummaries[0].id;
let currentView = "tasks";
const collaborationDraft = {
  projectId: currentProjectId,
  taskId: projectSummaries[0].tasks[1].id,
  files: []
};

const navItems = [
  ["dashboard", "驾驶舱"],
  ["projects", "项目台账"],
  ["phaseConfig", "阶段配置"],
  ["tasks", "任务与里程碑"],
  ["collaboration", "组织协同"]
];

const navEl = document.getElementById("nav");
const titleEl = document.getElementById("page-title");
const descEl = document.getElementById("page-description");
const metricsEl = document.getElementById("metrics");
const contentEl = document.getElementById("content");

function getCurrentProject() {
  return projectSummaries.find((project) => project.id === currentProjectId);
}

function currentTaskOptions() {
  return getCurrentProject().tasks.map((task) => ({
    value: task.id,
    label: `${task.id} / ${task.phaseName} / ${task.name}`
  }));
}

function currentTaskLabel() {
  const task = getCurrentProject().tasks.find((item) => item.id === collaborationDraft.taskId);
  return task ? `${task.id} / ${task.phaseName} / ${task.name}` : "未选择任务";
}

function phaseStateText(state) {
  if (state === "done") return "已完成";
  if (state === "risk") return "有风险";
  if (state === "active") return "推进中";
  return "待启动";
}

function taskStateText(state) {
  if (state === "done") return "已完成";
  if (state === "delayed") return "延期";
  if (state === "blocked") return "阻塞";
  if (state === "in_progress") return "进行中";
  return "待启动";
}

function statusBadge(status) {
  if (status === "风险") return '<span class="badge danger">风险</span>';
  if (status === "进行中") return '<span class="badge warning">进行中</span>';
  return '<span class="badge">已完成</span>';
}

function buildViews(project) {
  return {
    dashboard: {
      title: "经营驾驶舱",
      description: "项目推进来自阶段与任务汇总，不再手工维护单一进度值。",
      metrics: [
        { label: "项目总体进展", value: `${project.progress}%`, note: "阶段权重 × 任务完成度" },
        { label: "关键里程碑延期", value: String(project.delayedTasks), note: "优先影响阶段状态" },
        { label: "阻塞任务", value: String(project.blockedTasks), note: "会直接打红阶段" },
        { label: "待完成任务", value: String(project.openTasks), note: "项目经理需持续跟进" }
      ],
      panels: [
        {
          span: "wide",
          title: "阶段推进逻辑",
          subtitle: "推荐口径是阶段看任务，项目看阶段，驾驶舱看项目。",
          type: "formula",
          items: [
            ["阶段进度", "阶段内任务完成比例汇总"],
            ["阶段状态", "任务进展 + 阻塞 + 关键里程碑延期 + 交付物齐全情况"],
            ["项目进度", "各阶段进度按权重汇总"],
            ["驾驶舱指标", "统一从项目、阶段、任务反算"]
          ]
        },
        {
          title: "当前阶段推进",
          subtitle: `${project.id} / ${project.name}`,
          type: "bars",
          items: project.phases.map((phase) => ({
            name: `${phase.name} · ${phaseStateText(phase.state)}`,
            value: phase.progress,
            text: `${phase.progress}%`
          }))
        },
        {
          title: "推进偏差来源",
          subtitle: "风险和延期必须能穿透到具体任务。",
          type: "list",
          items: project.tasks
            .filter((task) => task.status === "blocked" || task.status === "delayed")
            .slice(0, 3)
            .map((task) => [
              `${task.id} / ${task.name}`,
              `${task.phaseName} · ${task.milestone ? "关键里程碑" : "普通任务"}`,
              task.status === "blocked" ? "当前阻塞，阶段转风险" : "当前延期，阶段转风险",
              "danger"
            ])
        }
      ]
    },
    projects: {
      title: "项目台账",
      description: "切换不同项目后，项目汇总、阶段与任务视图会同步切换。",
      metrics: [
        { label: "项目数量", value: String(projectSummaries.length), note: "当前原型示例项目" },
        { label: "当前项目", value: project.id, note: project.name },
        { label: "项目经理", value: project.manager, note: `客户：${project.customer}` },
        { label: "状态", value: project.state, note: "根据任务自动判断" }
      ],
      panels: [
        {
          span: "wide",
          title: "项目切换总览",
          subtitle: "各项目都由自己的阶段和任务数据推导状态。",
          type: "table",
          headers: ["项目", "项目经理", "总体进展", "状态"],
          rows: projectSummaries.map((item) => [
            `${item.id} / ${item.name}`,
            item.manager,
            `阶段汇总 ${item.progress}%`,
            statusBadge(item.state)
          ])
        },
        {
          title: "当前项目",
          subtitle: "右上角切换项目后，这里会同步变化。",
          type: "timeline",
          items: [
            ["客户", project.customer],
            ["计划完工", project.plannedFinish],
            ["阶段数", `${project.phases.length} 个`],
            ["未完成任务", `${project.openTasks} 个`]
          ]
        }
      ]
    },
    phaseConfig: {
      title: "项目阶段配置",
      description: "这个页面用来演示阶段是怎么维护出来的：先选模板，再落到项目实际阶段，并配置权重、关闭条件和任务来源。",
      metrics: [
        { label: "当前项目", value: project.id, note: project.name },
        { label: "阶段模板", value: phaseTemplates.find((item) => item.applyTo.includes(project.name))?.projectType || "自定义模板", note: "项目创建时默认带出" },
        { label: "实际阶段数", value: String(project.phases.length), note: "项目实例阶段配置" },
        { label: "阶段总权重", value: `${project.phases.reduce((sum, phase) => sum + phase.weight, 0)}%`, note: "建议控制为 100%" }
      ],
      panels: [
        {
          span: "wide",
          title: "阶段维护逻辑",
          subtitle: "正式系统里，阶段不应该手写在结果页，而应在配置页维护后再供项目和任务页引用。",
          type: "formula",
          items: [
            ["模板层", "按项目类型维护标准阶段模板"],
            ["项目层", "项目创建时带出模板，并允许按项目实际调整"],
            ["任务层", "每个阶段下维护任务、里程碑和交付物"],
            ["结果层", "项目进度、风险、协同再统一从阶段和任务反算"]
          ]
        },
        {
          title: "阶段模板库",
          subtitle: "这里演示不同项目类型可以维护不同的默认阶段。",
          type: "table",
          headers: ["模板", "适用项目", "默认阶段", "维护规则"],
          rows: phaseTemplates.map((item) => [
            item.projectType,
            item.applyTo,
            item.stages.join(" / "),
            item.rule
          ])
        },
        {
          span: "wide",
          title: "当前项目阶段配置",
          subtitle: "切换项目后，这里展示该项目实际采用的阶段配置，而不是模板原样照搬。",
          type: "configTable",
          items: project.phases.map((phase) => ({
            name: phase.name,
            weight: `${phase.weight}%`,
            taskCount: `${phase.tasks.length} 个任务`,
            deliverableRule: phase.deliverablesReady ? "交付物已满足关闭条件" : "需补齐交付物后才能关闭",
            taskRule: `自动关联 ${phase.tasks.filter((task) => task.milestone).length} 个里程碑 / ${phase.tasks.length} 个任务`
          }))
        },
        {
          title: "配置后如何生效",
          subtitle: "这一步把“维护页面”和“业务结果页面”串起来。",
          type: "timeline",
          items: [
            ["步骤 1", "创建项目时选择项目类型模板"],
            ["步骤 2", "系统带出默认阶段、权重和阶段关闭规则"],
            ["步骤 3", "项目经理按实际情况增删阶段或调整权重"],
            ["步骤 4", "任务、协同、驾驶舱统一读取该项目阶段配置"]
          ]
        }
      ]
    },
    tasks: {
      title: "任务与里程碑",
      description: "这是项目阶段推进的真实来源，支持切换不同项目查看各自明细。",
      metrics: [
        { label: "当前项目", value: project.id, note: project.name },
        { label: "阶段数", value: String(project.phases.length), note: "项目阶段定义" },
        { label: "任务总数", value: String(project.tasks.length), note: "含普通任务与里程碑" },
        { label: "任务风险数", value: String(project.blockedTasks + project.delayedTasks), note: "阻塞 + 延期" }
      ],
      panels: [
        {
          span: "wide",
          title: "阶段推进明细",
          subtitle: "每个阶段的进展都由任务实时汇总。",
          type: "phaseTable",
          items: project.phases
        },
        {
          title: "任务规则",
          subtitle: "建议把这些规则直接变成系统判定逻辑。",
          type: "timeline",
          items: [
            ["普通任务进行中", "计入阶段进度，但不代表阶段关闭"],
            ["关键里程碑延期", "优先把阶段打成风险"],
            ["任务阻塞", "即使进度不低，也要把阶段标红"],
            ["交付物缺失", "任务完成后阶段仍不能关闭"]
          ]
        },
        {
          title: "推荐数据对象",
          subtitle: "后续正式建模建议至少落这几类对象。",
          type: "list",
          items: [
            ["项目阶段", "定义权重、关闭条件", "用于项目汇总", "warning"],
            ["项目任务", "定义负责人、时间、进度、是否里程碑", "用于真实推进", "warning"],
            ["进度日志", "记录延期原因、备注和补救动作", "用于追溯", "warning"],
            ["阶段交付物", "验收单、照片、签收单、函件", "用于阶段关闭", "warning"]
          ]
        }
      ]
    },
    collaboration: {
      title: "组织协同",
      description: "协同单不仅关联项目，也可随着项目切换绑定到该项目的具体任务。",
      metrics: [
        { label: "当前项目", value: project.id, note: project.name },
        { label: "协同事项", value: "28", note: "本周新增 7 条" },
        { label: "已关联任务", value: "82%", note: "建议提升到 100%" },
        { label: "附件归档率", value: "86%", note: "缺附件项自动提醒" }
      ],
      panels: [
        {
          span: "wide",
          title: "新建协同事项",
          subtitle: "切换项目后，任务下拉自动切换为当前项目的任务列表。",
          type: "composer"
        },
        {
          title: "协同联动逻辑",
          subtitle: "协同不是消息流转，而是能反向影响任务状态。",
          type: "timeline",
          items: [
            ["关联任务", "例如挂到当前项目的关键任务或里程碑"],
            ["附件归档", "签收单、现场照片、函件写入任务交付物"],
            ["处理结果", "协同结论回写任务日志"],
            ["状态联动", "协同逾期可把任务升级为风险或阻塞"]
          ]
        },
        {
          title: "协同台账",
          subtitle: "当前项目视角下展示更符合业务使用习惯。",
          type: "table",
          headers: ["协同事项", "关联项目", "关联任务", "状态"],
          rows: [
            ["设备到货偏差确认 / 附件 3 份", `${project.id} / ${project.name}`, currentTaskLabel(), '<span class="badge warning">待回复</span>'],
            ["资料补齐提醒 / 附件 2 份", `${project.id} / ${project.name}`, `${project.tasks[project.tasks.length - 1].id} / ${project.tasks[project.tasks.length - 1].phaseName} / ${project.tasks[project.tasks.length - 1].name}`, '<span class="badge danger">逾期</span>']
          ]
        }
      ]
    }
  };
}

function renderProjectSwitcher(project) {
  return `
    <section class="project-switcher panel wide">
      <div class="project-switcher-head">
        <div>
          <h3>项目切换</h3>
          <p class="subtle">切换后，当前页的阶段、任务、协同任务下拉都会联动刷新。</p>
        </div>
        <div class="switcher-grid">
          <label class="field">
            <span>当前项目</span>
            <select id="global-project-switch">
              ${projectSummaries.map((item) => `
                <option value="${item.id}" ${item.id === project.id ? "selected" : ""}>${item.id} / ${item.name}</option>
              `).join("")}
            </select>
          </label>
        </div>
      </div>
    </section>
  `;
}

function renderNav() {
  navEl.innerHTML = navItems.map(([id, label]) => `
    <button class="${id === currentView ? "active" : ""}" data-view="${id}">${label}</button>
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

function renderComposer() {
  const project = getCurrentProject();
  const taskOptions = currentTaskOptions();
  const filesMarkup = collaborationDraft.files.length
    ? collaborationDraft.files.map((file) => `
      <div class="upload-file"><strong>${file.name}</strong><span>${formatSize(file.size)}</span></div>
    `).join("")
    : `<div class="upload-empty">暂未上传附件，可选择多份文件演示归档效果。</div>`;

  return `
    <div class="composer">
      <div class="form-grid form-grid-three">
        <label class="field">
          <span>协同主题</span>
          <input type="text" value="设备到货偏差跨部门确认" />
        </label>
        <label class="field">
          <span>关联项目</span>
          <select id="collab-project">
            ${projectSummaries.map((item) => `
              <option value="${item.id}" ${item.id === project.id ? "selected" : ""}>${item.id} / ${item.name}</option>
            `).join("")}
          </select>
        </label>
        <label class="field">
          <span>关联任务</span>
          <select id="collab-task">
            ${taskOptions.map((task) => `
              <option value="${task.value}" ${task.value === collaborationDraft.taskId ? "selected" : ""}>${task.label}</option>
            `).join("")}
          </select>
        </label>
        <label class="field">
          <span>协同部门</span>
          <input type="text" value="采购部、工程部、财务部" />
        </label>
        <label class="field">
          <span>截止时间</span>
          <input type="date" value="2026-04-03" />
        </label>
        <label class="field">
          <span>联动动作</span>
          <input type="text" value="处理完成后回写任务进度与交付物" />
        </label>
      </div>

      <label class="field">
        <span>协同说明</span>
        <textarea rows="5">到货清单与现场签收数量存在差异，请相关部门核对数量、物流回单与供应商确认函。协同完成后，同步更新当前任务状态与附件归档。</textarea>
      </label>

      <div class="upload-panel">
        <div>
          <p class="upload-title">附件上传</p>
          <p class="meta">支持多附件选择，用于演示照片、函件、签收单和审批表归档。</p>
        </div>
        <label class="upload-trigger">
          <input id="collab-files" type="file" multiple />
          <span>选择附件</span>
        </label>
      </div>

      <div class="upload-list">${filesMarkup}</div>

      <div class="composer-summary">
        <div class="summary-chip">已关联项目：${project.id} / ${project.name}</div>
        <div class="summary-chip">已关联任务：${currentTaskLabel()}</div>
        <div class="summary-chip">附件数：${collaborationDraft.files.length} 份</div>
      </div>
    </div>
  `;
}

function renderFormula(items) {
  return `<div class="formula-grid">${items.map(([label, value]) => `
    <div class="formula-item">
      <div class="formula-label">${label}</div>
      <div class="row-title">${value}</div>
    </div>
  `).join("")}</div>`;
}

function renderPhaseTable(items) {
  return `<div class="phase-table">${items.map((phase) => `
    <article class="phase-card">
      <div class="phase-head">
        <div>
          <h4>${phase.name}</h4>
          <p class="meta">阶段权重 ${phase.weight}% · ${phaseStateText(phase.state)}</p>
        </div>
        <span class="badge ${phase.state === "risk" ? "danger" : phase.state === "active" ? "warning" : ""}">${phase.progress}%</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${phase.progress}%"></div></div>
      <div class="task-list">
        ${phase.tasks.map((task) => `
          <div class="task-item">
            <div>
              <div class="row-title">${task.id} / ${task.name}</div>
              <div class="meta">${task.owner} · 截止 ${task.due}${task.milestone ? " · 关键里程碑" : ""}</div>
            </div>
            <div class="task-meta">
              <span class="task-progress">${task.progress}%</span>
              <span class="badge ${task.status === "blocked" || task.status === "delayed" ? "danger" : task.status === "done" ? "" : "warning"}">${taskStateText(task.status)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("")}</div>`;
}

function renderConfigTable(items) {
  return `<div class="table config-table">
    <div class="table-row table-head">
      <div>阶段名称</div>
      <div>权重</div>
      <div>任务数量</div>
      <div>关闭条件</div>
      <div>任务生成逻辑</div>
    </div>
    ${items.map((item) => `
      <div class="table-row config-row">
        <div>${item.name}</div>
        <div>${item.weight}</div>
        <div>${item.taskCount}</div>
        <div>${item.deliverableRule}</div>
        <div>${item.taskRule}</div>
      </div>
    `).join("")}
  </div>`;
}

function renderPanel(panel) {
  let body = "";
  const spanClass = panel.span ? ` ${panel.span}` : "";

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
    body = `<div class="table">
      <div class="table-row table-head">${panel.headers.map((header) => `<div>${header}</div>`).join("")}</div>
      ${panel.rows.map((row) => `<div class="table-row">${row.map((col) => `<div>${col}</div>`).join("")}</div>`).join("")}
    </div>`;
  }

  if (panel.type === "formula") body = renderFormula(panel.items);
  if (panel.type === "phaseTable") body = renderPhaseTable(panel.items);
  if (panel.type === "configTable") body = renderConfigTable(panel.items);
  if (panel.type === "composer") body = renderComposer();

  return `<article class="panel${spanClass}">
    <h3>${panel.title}</h3>
    <p class="subtle">${panel.subtitle}</p>
    ${body}
  </article>`;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function syncProject(projectId) {
  currentProjectId = projectId;
  collaborationDraft.projectId = projectId;
  const firstTask = getCurrentProject().tasks[0];
  collaborationDraft.taskId = firstTask ? firstTask.id : "";
}

function bindGlobalEvents() {
  const globalSwitch = document.getElementById("global-project-switch");
  if (globalSwitch) {
    globalSwitch.addEventListener("change", (event) => {
      syncProject(event.target.value);
      render();
    });
  }

  const collabProject = document.getElementById("collab-project");
  const collabTask = document.getElementById("collab-task");
  const fileInput = document.getElementById("collab-files");

  if (collabProject) {
    collabProject.addEventListener("change", (event) => {
      syncProject(event.target.value);
      render();
    });
  }

  if (collabTask) {
    collabTask.addEventListener("change", (event) => {
      collaborationDraft.taskId = event.target.value;
      render();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      collaborationDraft.files = Array.from(event.target.files || []);
      render();
    });
  }
}

function render() {
  const project = getCurrentProject();
  const view = buildViews(project)[currentView];
  titleEl.textContent = view.title;
  descEl.textContent = view.description;
  renderNav();
  renderMetrics(view.metrics);
  contentEl.innerHTML = `${renderProjectSwitcher(project)}${view.panels.map(renderPanel).join("")}`;
  bindGlobalEvents();
}

render();
