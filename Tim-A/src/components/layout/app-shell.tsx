import type { ReactNode } from "react";

import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({
  children,
  languageCode,
}: {
  children: ReactNode;
  languageCode?: string;
}) {
  return (
    <div
      lang={languageCode}
      className="min-h-[calc(100vh/var(--app-zoom))] bg-[#fbf6f1] text-[#1d1c16]"
    >
      <Sidebar />
      <main className="min-h-[calc(100vh/var(--app-zoom))] pb-24 xl:ml-[338px] xl:w-[calc((100vw/var(--app-zoom))-338px)] xl:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
