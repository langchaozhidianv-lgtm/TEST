import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Project Management MVP",
  description: "复刻项目管理系统的可运行最小版本"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <Link className="brand" href="/projects">
            Atlas Projects
          </Link>
          <nav className="site-nav">
          <Link href="/projects">项目列表</Link>
          <Link href="/projects/stats/team">团队统计</Link>
        </nav>
      </header>
        {children}
      </body>
    </html>
  );
}
