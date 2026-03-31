import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";

import "./globals.css";

export const metadata: Metadata = {
  title: "Project Management MVP",
  description: "A runnable project management system replica with bilingual UI"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <LanguageProvider>
          <header className="site-header">
            <Link className="brand" href="/projects">
              Atlas Projects
            </Link>
            <nav className="site-nav">
              <Link href="/projects">Projects</Link>
              <Link href="/projects/stats/team">Team Stats</Link>
              <LanguageToggle />
            </nav>
          </header>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
