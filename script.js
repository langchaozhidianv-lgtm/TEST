const tasks = [
  { title: "移动端 UI 设计评审", owner: "王雪", due: "2026-03-10", status: "todo" },
  { title: "支付接口联调", owner: "赵凯", due: "2026-03-09", status: "progress" },
  { title: "里程碑 M2 测试", owner: "李航", due: "2026-03-08", status: "todo" },
  { title: "需求文档更新", owner: "陈晨", due: "2026-03-07", status: "done" },
  { title: "数据库性能优化", owner: "刘鹏", due: "2026-03-11", status: "progress" },
];

const labels = {
  todo: "待处理",
  progress: "进行中",
  done: "已完成",
};

const taskList = document.getElementById("taskList");
const taskTemplate = document.getElementById("taskTemplate");
const statusFilter = document.getElementById("statusFilter");
const newTaskBtn = document.getElementById("newTaskBtn");

function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  const filtered = tasks.filter((task) => filter === "all" || task.status === filter);

  filtered.forEach((task) => {
    const clone = taskTemplate.content.cloneNode(true);
    clone.querySelector(".task-title").textContent = task.title;
    clone.querySelector(".task-meta").textContent = `负责人：${task.owner} · 截止日期：${task.due}`;

    const statusNode = clone.querySelector(".task-status");
    statusNode.textContent = labels[task.status];
    statusNode.classList.add(`status-${task.status}`);

    taskList.appendChild(clone);
  });
}

statusFilter.addEventListener("change", (event) => {
  renderTasks(event.target.value);
});

newTaskBtn.addEventListener("click", () => {
  alert("可在此接入任务创建弹窗/表单。");
});

renderTasks();
