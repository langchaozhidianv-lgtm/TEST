"use client";

import { useLanguage } from "@/components/language-provider";

const viewTypes = {
  zh: ["我负责的项目", "我参与的项目", "我关注的项目", "下属的项目", "共享给我的项目", "我创建的项目", "全部项目", "已关闭项目"],
  en: ["Owned by me", "Participating", "Following", "Subordinates", "Shared with me", "Created by me", "All projects", "Closed projects"]
};

export function ProjectFilterBar() {
  const { locale } = useLanguage();

  return (
    <div className="filter-bar">
      <div>
        <p className="eyebrow">{locale === "zh" ? "项目视图" : "Project Views"}</p>
        <h2>{locale === "zh" ? "围绕角色切换项目池" : "Switch project pools by role"}</h2>
      </div>
      <div className="chip-row">
        {viewTypes[locale].map((viewType) => (
          <span className="chip" key={viewType}>
            {viewType}
          </span>
        ))}
      </div>
    </div>
  );
}
