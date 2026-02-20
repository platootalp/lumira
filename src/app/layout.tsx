import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
