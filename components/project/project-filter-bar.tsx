const viewTypes = [
  "我负责的项目",
  "我参与的项目",
  "我关注的项目",
  "下属的项目",
  "共享给我的项目",
  "我创建的项目",
  "全部项目",
  "已关闭项目"
];

export function ProjectFilterBar() {
  return (
    <div className="filter-bar">
      <div>
        <p className="eyebrow">项目视图</p>
        <h2>围绕角色切换项目池</h2>
      </div>
      <div className="chip-row">
        {viewTypes.map((viewType) => (
          <span className="chip" key={viewType}>
            {viewType}
          </span>
        ))}
      </div>
    </div>
  );
}
