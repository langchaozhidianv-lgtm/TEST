import React from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProjectList from "./pages/ProjectManagement/ProjectList";
import ProjectInitiationList from "./pages/ProjectManagement/ProjectInitiationList";
import ProjectDetail from "./pages/ProjectManagement/ProjectDetail";
import ProjectFiles from "./pages/ProjectManagement/ProjectFiles";
import CostList from "./pages/CostManagement/CostList";
import FinanceList from "./pages/FinanceManagement/FinanceList";
import ContractList from "./pages/ContractManagement/ContractList";
import SiteList from "./pages/SiteManagement/SiteList";
import ProcurementList from "./pages/ProcurementManagement/ProcurementList";
import ReportsDashboard from "./pages/Reports/ReportsDashboard";
import OperationsOverview from "./pages/Workspace/OperationsOverview";
import CollaborationWorkspace from "./pages/Workspace/CollaborationWorkspace";

const navItems = [
  { path: "/", label: "经营总览", hint: "经营指标、重点事项与周记维护" },
  { path: "/projects", label: "项目空间", hint: "项目台账、空间首页与文件校验" },
  { path: "/project-initiation", label: "项目立项", hint: "销售合同签约后触发项目立项与建档" },
  { path: "/workspace/collaboration", label: "组织协同", hint: "协同事项、责任人与截止计划" },
  { path: "/procurement", label: "采购执行", hint: "采购、发运与材料动态维护" },
  {
    path: "/contracts",
    label: "合同履约",
    hint: "销售、采购、劳务与变更合同",
    children: [
      { path: "/contracts/sales", label: "销售合同" },
      { path: "/contracts/procurement", label: "采购合同" },
      { path: "/contracts/labor", label: "劳务合同" },
      { path: "/contracts/change", label: "变更合同" }
    ]
  },
  {
    path: "/costs",
    label: "成本管理",
    hint: "三版本成本、科目与剩余材料",
    children: [
      { path: "/costs/versions", label: "三版本成本" },
      { path: "/costs/categories", label: "成本科目" },
      { path: "/costs/materials", label: "剩余材料" }
    ]
  },
  {
    path: "/finance",
    label: "财务管理",
    hint: "收付款计划、报销与资金风险预警",
    children: [
      { path: "/finance/collections", label: "收款管理" },
      { path: "/finance/payments", label: "付款管理" },
      { path: "/finance/reimbursements", label: "报销管理" },
      { path: "/finance/risks", label: "风险预警" }
    ]
  },
  {
    path: "/sites",
    label: "现场与劳务管理",
    hint: "劳务、安全、验收与现场记录",
    children: [
      { path: "/sites/labor", label: "劳务管理" },
      { path: "/sites/wages", label: "劳务工资发放记录" },
      { path: "/sites/safety", label: "安全管理" },
      { path: "/sites/acceptance", label: "验收管理" },
      { path: "/sites/records", label: "现场记录" }
    ]
  },
  { path: "/reports", label: "报表中心", hint: "经营分析、风险预警与文件完备率" }
];

const topTabItems = [
  { path: "/", label: "经营总览" },
  { path: "/projects", label: "项目空间" },
  { path: "/project-initiation", label: "项目立项" },
  { path: "/workspace/collaboration", label: "组织协同" },
  { path: "/procurement", label: "采购执行" },
  { path: "/contracts/sales", label: "合同履约" }
];

function pathMatches(pathname, itemPath) {
  return itemPath === "/" ? pathname === "/" : pathname.startsWith(itemPath);
}

function getActiveItem(pathname) {
  if (pathname === "/") return navItems[0];
  return navItems.find((item) => pathMatches(pathname, item.path) && item.path !== "/") || navItems[1];
}

function AppChrome({ children }) {
  const location = useLocation();
  const activeItem = getActiveItem(location.pathname);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-mark">晶雪</div>
          <div className="brand-block">
            <h1 className="brand-title">晶雪项目管理系统</h1>
            <p className="brand-subtitle">面向工程材料与项目交付全过程的业务管理平台</p>
          </div>
          <div className="topbar-tabs">
            {topTabItems.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === "/"}
                className={({ isActive }) => `topbar-tab ${isActive ? "active" : ""}`}
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="topbar-right">
          <div className="search-shell">
            <span className="search-prefix">检索</span>
            <input placeholder="搜索项目、合同、客户" />
          </div>
          <div className="user-chip">
            <span className="user-chip__count">99+</span>
            <span>当前用户</span>
          </div>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-header__icon">PM</span>
            <div>
              <strong>{activeItem.label}</strong>
              <p>{activeItem.hint}</p>
            </div>
          </div>

          <nav className="nav-list">
            {navItems.map((item) => {
              const isActive = pathMatches(location.pathname, item.path);
              const to = item.children?.[0]?.path || item.path;

              return (
                <div className={`nav-section ${isActive ? "active" : ""}`} key={item.path}>
                  <NavLink
                    to={to}
                    end={item.path === "/"}
                    className={({ isActive: linkActive }) => `nav-item ${linkActive || isActive ? "active" : ""}`}
                  >
                    <span className="nav-item__dot" />
                    <div>
                      <strong>{item.label}</strong>
                    </div>
                  </NavLink>

                  {item.children && isActive ? (
                    <div className="subnav-list">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive: childActive }) => `subnav-item ${childActive ? "active" : ""}`}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppChrome><OperationsOverview /></AppChrome>} />
      <Route path="/project-initiation" element={<AppChrome><ProjectInitiationList /></AppChrome>} />
      <Route path="/workspace/collaboration" element={<AppChrome><CollaborationWorkspace /></AppChrome>} />
      <Route path="/projects" element={<AppChrome><ProjectList /></AppChrome>} />
      <Route path="/projects/:id/detail" element={<AppChrome><ProjectDetail /></AppChrome>} />
      <Route path="/projects/:id/files" element={<AppChrome><ProjectFiles /></AppChrome>} />

      <Route path="/contracts" element={<Navigate to="/contracts/sales" replace />} />
      <Route path="/contracts/sales" element={<AppChrome><ContractList contractType="SALES" /></AppChrome>} />
      <Route path="/contracts/procurement" element={<AppChrome><ContractList contractType="PROCUREMENT" /></AppChrome>} />
      <Route path="/contracts/labor" element={<AppChrome><ContractList contractType="LABOR" /></AppChrome>} />
      <Route path="/contracts/change" element={<AppChrome><ContractList contractType="CHANGE" /></AppChrome>} />

      <Route path="/costs" element={<Navigate to="/costs/versions" replace />} />
      <Route path="/costs/versions" element={<AppChrome><CostList view="VERSIONS" /></AppChrome>} />
      <Route path="/costs/categories" element={<AppChrome><CostList view="CATEGORIES" /></AppChrome>} />
      <Route path="/costs/materials" element={<AppChrome><CostList view="MATERIALS" /></AppChrome>} />

      <Route path="/finance" element={<Navigate to="/finance/payments" replace />} />
      <Route path="/finance/collections" element={<AppChrome><FinanceList view="COLLECTIONS" /></AppChrome>} />
      <Route path="/finance/payments" element={<AppChrome><FinanceList view="PAYMENTS" /></AppChrome>} />
      <Route path="/finance/reimbursements" element={<AppChrome><FinanceList view="REIMBURSEMENTS" /></AppChrome>} />
      <Route path="/finance/wages" element={<Navigate to="/sites/wages" replace />} />
      <Route path="/finance/risks" element={<AppChrome><FinanceList view="RISKS" /></AppChrome>} />

      <Route path="/procurement" element={<AppChrome><ProcurementList /></AppChrome>} />

      <Route path="/sites" element={<Navigate to="/sites/labor" replace />} />
      <Route path="/sites/labor" element={<AppChrome><SiteList view="LABOR" /></AppChrome>} />
      <Route path="/sites/wages" element={<AppChrome><FinanceList view="WAGES" /></AppChrome>} />
      <Route path="/sites/safety" element={<AppChrome><SiteList view="SAFETY" /></AppChrome>} />
      <Route path="/sites/acceptance" element={<AppChrome><SiteList view="ACCEPTANCE" /></AppChrome>} />
      <Route path="/sites/records" element={<AppChrome><SiteList view="RECORDS" /></AppChrome>} />

      <Route path="/reports" element={<AppChrome><ReportsDashboard /></AppChrome>} />
    </Routes>
  );
}
