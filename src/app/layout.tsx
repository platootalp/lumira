import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClientProvider } from "@/components/query-client-provider";

export const metadata: Metadata = {
  title: "Lumira - 基金投资助手",
  description: "面向散户投资者的基金持仓管理应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <QueryClientProvider>
          <ToastProvider>
            <ErrorBoundary>
              <div className="flex h-screen">
                <div className="hidden lg:block">
                  <Sidebar />
                </div>
                <MobileSidebar />
                <main className="flex-1 lg:ml-60 overflow-auto">
                  {children}
                </main>
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
