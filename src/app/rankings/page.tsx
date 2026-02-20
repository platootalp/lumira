"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Flame, Clock, GitCompare } from "lucide-react";
import Link from "next/link";
import type { FundEstimate } from "@/types";

// 模拟排行榜数据
const mockRankings = {
  daily: [
    { code: "519674", name: "银河创新成长混合A", change: 5.23, nav: 5.2345 },
    { code: "161725", name: "招商白酒指数A", change: 4.56, nav: 1.2345 },
    { code: "005827", name: "易方达蓝筹精选", change: 3.89, nav: 2.4567 },
    { code: "000083", name: "汇添富消费行业", change: 3.45, nav: 3.5678 },
    { code: "001632", name: "天弘中证食品饮料", change: 2.98, nav: 1.8765 },
  ],
  decline: [
    { code: "007464", name: "交银中证海外互联", change: -4.56, nav: 1.1234 },
    { code: "002803", name: "广发中证基建工程", change: -3.78, nav: 0.9876 },
    { code: "003096", name: "中欧医疗健康混合A", change: -3.23, nav: 2.3456 },
    { code: "000478", name: "广发中证500ETF联接", change: -2.89, nav: 1.4567 },
    { code: "110022", name: "易方达消费行业", change: -2.45, nav: 3.2345 },
  ],
  hot: [
    { code: "005827", name: "易方达蓝筹精选", views: 125432 },
    { code: "161725", name: "招商白酒指数A", views: 98765 },
    { code: "519674", name: "银河创新成长混合A", views: 87654 },
    { code: "003096", name: "中欧医疗健康混合A", views: 76543 },
    { code: "000083", name: "汇添富消费行业", views: 65432 },
  ]
};

type TabType = "daily" | "decline" | "hot";

/**
 * 基金排行榜页
 * 
 * Agent: ui-architect
 */
export default function RankingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { key: "daily" as TabType, label: "涨幅榜", icon: TrendingUp },
    { key: "decline" as TabType, label: "跌幅榜", icon: TrendingDown },
    { key: "hot" as TabType, label: "热门榜", icon: Flame },
  ];

  const currentData = mockRankings[activeTab];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                基金排行榜
              </h1>
            </div>
            <Link href="/compare">
              <Button variant="outline" size="sm">
                <GitCompare className="w-4 h-4 mr-1" />
                对比
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 排行榜列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{tabs.find(t => t.key === activeTab)?.label}</span>
              <span className="text-sm font-normal text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                实时更新
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTab === "hot" ? (
                // 热门榜
                currentData.map((item: any, index: number) => (
                  <div
                    key={item.code}
                    onClick={() => router.push(`/fund/${item.code}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">关注人数</div>
                      <div className="font-medium">{(item.views / 10000).toFixed(1)}万</div>
                    </div>
                  </div>
                ))
              ) : (
                // 涨跌幅榜
                currentData.map((item: any, index: number) => {
                  const isUp = item.change >= 0;
                  return (
                    <div
                      key={item.code}
                      onClick={() => router.push(`/fund/${item.code}`)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-mono font-medium text-lg",
                          isUp ? "text-red-500" : "text-green-500"
                        )}>
                          {isUp ? "+" : ""}{item.change.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          净值 {item.nav.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* 提示 */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-medium">⚠️ 免责声明：</span>
            排行榜数据仅供参考，不构成投资建议。过往业绩不代表未来表现，市场有风险，投资需谨慎。
          </p>
        </div>
      </div>
    </main>
  );
}
