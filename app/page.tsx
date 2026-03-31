import Link from "next/link";

const modules = [
  {
    id: "A",
    kicker: "OPC 社区",
    title: "把用户沉淀成关系，把内容沉淀成口碑。",
    summary:
      "围绕问答、作品展示、实战话题和成长记录，形成高活跃、高信任的交流场域，让社区自然承担获客与传播。",
    gradientClassName: "module-community",
    highlights: ["问答广场", "作品橱窗", "经验榜单", "口碑裂变"],
    metrics: [
      { label: "日活互动", value: "12k+" },
      { label: "精华作品", value: "3,400" }
    ]
  },
  {
    id: "B",
    kicker: "OPC 课堂 / OPC 直播",
    title: "把围观变成学习，把学习变成陪跑式转化。",
    summary:
      "课程、直播、训练营和答疑机制联动，既做用户教育，也做深度转化，让每一次内容触达都连接到训练结果。",
    gradientClassName: "module-classroom",
    highlights: ["体系课程", "直播答疑", "训练营", "陪跑复盘"],
    metrics: [
      { label: "课程完课率", value: "71%" },
      { label: "直播转化", value: "24%" }
    ]
  },
  {
    id: "C",
    kicker: "开发模型综合平台",
    title: "从看懂到上手，把能力真正放进工作流。",
    summary:
      "用户在平台内直接完成模型调用、流程编排、案例复用和项目交付，从学习阶段无缝进入真实生产使用。",
    gradientClassName: "module-platform",
    highlights: ["模型工作台", "流程搭建", "案例模板", "项目实操"],
    metrics: [
      { label: "可复用流程", value: "280+" },
      { label: "交付效率", value: "+43%" }
    ]
  },
  {
    id: "D",
    kicker: "SKILLS / Agent 市场",
    title: "把使用者升级为创作者，再升级为供给者。",
    summary:
      "支持 Skills、Agent、模板和自动化方案的发布、分发与交易，构建创作者收益机制与平台生态网络效应。",
    gradientClassName: "module-market",
    highlights: ["技能包发布", "Agent 上架", "场景订阅", "收益分成"],
    metrics: [
      { label: "可交易资产", value: "900+" },
      { label: "创作者收入", value: "¥128w" }
    ]
  }
] as const;

const loopSteps = [
  {
    title: "社区获客",
    detail: "问题交流、作品发布、UGC 内容与口碑传播不断带来新用户。"
  },
  {
    title: "课堂转化",
    detail: "通过课程、直播和训练营建立认知、信任和行动动力。"
  },
  {
    title: "平台实操",
    detail: "用户在开发模型综合平台中完成真实任务，进入长期使用。"
  },
  {
    title: "市场变现",
    detail: "优秀用户发布 Skills 与 Agent，形成供给、分发和收益循环。"
  }
] as const;

const operatingSignals = [
  { label: "主业务闭环", value: "4 段串联" },
  { label: "用户路径", value: "学习 -> 使用 -> 分发" },
  { label: "商业结果", value: "获客 + 转化 + 复购 + 变现" }
] as const;

export default function HomePage() {
  return (
    <main className="page-shell business-home">
      <section className="business-hero">
        <div className="business-hero-copy">
          <p className="eyebrow">OPC Business Loop</p>
          <h1>用 4 个系统模块，搭出一个能自增长、可转化、可变现的业务闭环。</h1>
          <p className="hero-copy business-lead">
            A. OPC 社区负责沉淀用户与传播口碑，B. OPC 课堂 / OPC 直播负责教育与转化，C.
            开发模型综合平台负责把观看导向实操，D. SKILLS / Agent 市场负责分发与变现。
          </p>
          <div className="hero-actions">
            <Link className="action-button" href="/projects">
              查看现有系统
            </Link>
            <a className="action-button secondary-button" href="#business-modules">
              浏览四大模块
            </a>
          </div>
        </div>

        <div className="business-orbit-card">
          <div className="orbit-ring orbit-ring-outer" />
          <div className="orbit-ring orbit-ring-middle" />
          <div className="orbit-ring orbit-ring-inner" />
          <div className="orbit-node orbit-node-a">社区</div>
          <div className="orbit-node orbit-node-b">课堂</div>
          <div className="orbit-node orbit-node-c">平台</div>
          <div className="orbit-node orbit-node-d">市场</div>
          <div className="orbit-core">
            <span>OPC</span>
            <strong>增长飞轮</strong>
          </div>
        </div>
      </section>

      <section className="business-strip">
        {operatingSignals.map((signal) => (
          <article key={signal.label} className="signal-card">
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </article>
        ))}
      </section>

      <section className="section-block business-loop-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Closed Loop</p>
            <h2>一条清晰的用户升级路径</h2>
          </div>
        </div>
        <div className="loop-grid">
          {loopSteps.map((step, index) => (
            <article key={step.title} className="loop-card">
              <span className="loop-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="business-modules-section" id="business-modules">
        <div className="section-title">
          <div>
            <p className="eyebrow">System Modules</p>
            <h2>四块主业务模块</h2>
          </div>
        </div>
        <div className="business-module-grid">
          {modules.map((module) => (
            <article
              key={module.id}
              className={`business-module-card ${module.gradientClassName}`}
            >
              <div className="module-topline">
                <span className="module-id">{module.id}</span>
                <span className="tag-pill">{module.kicker}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
              <div className="module-chip-row">
                {module.highlights.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
              <div className="module-metrics">
                {module.metrics.map((metric) => (
                  <div key={metric.label} className="module-metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block business-bottom-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Business Result</p>
            <h2>最终形成的经营能力</h2>
          </div>
        </div>
        <div className="result-grid">
          <article className="result-card">
            <strong>低成本获客</strong>
            <p>社区内容和用户作品承担自然传播，让获客来自真实使用反馈而非单点投放。</p>
          </article>
          <article className="result-card">
            <strong>高信任转化</strong>
            <p>课堂与直播不断降低理解门槛，通过陪跑式机制推动用户从兴趣进入行动。</p>
          </article>
          <article className="result-card">
            <strong>高频复用</strong>
            <p>开发模型综合平台把能力嵌入项目工作流，提升留存、复购和团队协作深度。</p>
          </article>
          <article className="result-card accent-result">
            <strong>生态型变现</strong>
            <p>Skills / Agent 市场释放创作者供给，平台同时获得交易、订阅和服务抽成收益。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
