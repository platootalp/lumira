"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, Search, FileSpreadsheet, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchTab } from "@/components/import/SearchTab";
import { ManualTab } from "@/components/import/ManualTab";
import { ExcelTab } from "@/components/import/ExcelTab";
import { OcrTab } from "@/components/import/OcrTab";

type ImportTab = "search" | "manual" | "excel" | "ocr";

interface TabItem {
  key: ImportTab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabItem[] = [
  { key: "search", label: "搜索添加", icon: Search },
  { key: "manual", label: "手动输入", icon: Upload },
  { key: "excel", label: "Excel导入", icon: FileSpreadsheet },
  { key: "ocr", label: "截图识别", icon: Camera },
];

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>("search");

  const handleSuccess = () => {
    console.log("Import successful");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据导入</h1>
            <p className="text-sm text-slate-500">多种方式添加基金持仓</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === tab.key
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "search" && <SearchTab onSuccess={handleSuccess} />}
            {activeTab === "manual" && <ManualTab onSuccess={handleSuccess} />}
            {activeTab === "excel" && <ExcelTab onSuccess={handleSuccess} />}
            {activeTab === "ocr" && <OcrTab onSuccess={handleSuccess} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
