"use client";

import { usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";

const publicRoutes = ["/", "/login", "/register"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileSidebar />
      <div className="flex-1 lg:ml-60 flex flex-col overflow-hidden">
        <TopNavigation />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
