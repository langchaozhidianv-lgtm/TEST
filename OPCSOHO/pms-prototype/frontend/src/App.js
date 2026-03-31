import React from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import ProjectList from "./pages/ProjectManagement/ProjectList";
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
  { path: "/projects", label: "项目空间首页", hint: "项目台账、空间首页与文件校验" },
  { path: "/workspace/collaboration", label: "组织协同", hint: "协同事项、责任人与截止计划" },
  { path: "/procurement", label: "采购执行", hint: "采购、发运与材料动态维护" },
  { path: "/contracts", label: "合同履约", hint: "销售、采购、劳务与变更合同" },
  { path: "/costs", label: "成本管理", hint: "三版本成本与剩余材料管理" },
  { path: "/finance", label: "财务管理", hint: "收付款计划、报销与工资代发" },
  { path: "/sites", label: "现场与劳务管理", hint: "劳务、安全、验收与现场记录" },
  { path: "/reports", label: "报表中心", hint: "经营分析、风险预警与文件完备率" }
];

const topTabItems = [
  { path: "/", label: "经营总览" },
  { path: "/projects", label: "项目空间首页" },
  { path: "/workspace/collaboration", label: "组织协同" },
  { path: "/procurement", label: "采购执行" },
  { path: "/contracts", label: "合同履约" }
];

function getActiveItem(pathname) {
  if (pathname === "/") return navItems[0];
  return navItems.find((item) => pathname.startsWith(item.path) && item.path !== "/") || navItems[1];
}

function AppChrome({ children }) {
  const location = useLocation();
  const activeItem = getActiveItem(location.pathname);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-mark">JX</div>
          <div className="brand-block">
            <h1 className="brand-title">晶雪项目管理系统</h1>
            <p className="brand-subtitle">JX PMS Prototype for Construction Materials and Engineering</p>
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
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-item__dot" />
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </div>
              </NavLink>
            ))}
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
      <Route path="/workspace/collaboration" element={<AppChrome><CollaborationWorkspace /></AppChrome>} />
      <Route path="/projects" element={<AppChrome><ProjectList /></AppChrome>} />
      <Route path="/projects/:id/detail" element={<AppChrome><ProjectDetail /></AppChrome>} />
      <Route path="/projects/:id/files" element={<AppChrome><ProjectFiles /></AppChrome>} />
      <Route path="/contracts" element={<AppChrome><ContractList /></AppChrome>} />
      <Route path="/costs" element={<AppChrome><CostList /></AppChrome>} />
      <Route path="/finance" element={<AppChrome><FinanceList /></AppChrome>} />
      <Route path="/procurement" element={<AppChrome><ProcurementList /></AppChrome>} />
      <Route path="/sites" element={<AppChrome><SiteList /></AppChrome>} />
      <Route path="/reports" element={<AppChrome><ReportsDashboard /></AppChrome>} />
    </Routes>
  );
}
