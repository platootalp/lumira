"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundCard } from "@/components/fund-card";
import { usePortfolioStore } from "@/stores/portfolio";
import { formatNumber, cn } from "@/lib/utils";
import { Plus, RefreshCw, TrendingUp, TrendingDown, Wallet } from "lucide-react";

/**
 * 资产总览页 - 首页
 * 
 * Agents:
 * - fund-analyst: 投资组合分析
 * - ui-architect: 页面布局和组件
 */
export default function HomePage() {
  const {
    holdings,
    isLoading,
    error,
    fetchHoldings,
    analysis
  } = usePortfolioStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHoldings();
  }, [fetchHoldings]);

  // 计算汇总数据
  const summary = analysis?.summary || {
    totalAssets: holdings.reduce((sum, h) => sum + (h.totalShares * (h.avgCost || 0)), 0),
    totalCost: holdings.reduce((sum, h) => sum + (h.totalShares * h.avgCost), 0),
    totalProfit: 0,
    totalProfitRate: 0,
    todayProfit: 0,
    holdingCount: holdings.length
  };

  const isProfit = summary.totalProfit >= 0;
  const isTodayProfit = summary.todayProfit >= 0;

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Lumira 基金助手</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchHoldings()}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
                刷新
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                添加持仓
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 收益卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 总资产 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>总资产</CardDescription>
              <CardTitle className="text-3xl font-mono">
                ¥{formatNumber(summary.totalAssets)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {summary.holdingCount} 只基金
              </p>
            </CardContent>
          </Card>

          {/* 累计收益 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                累计收益
                {isProfit ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
              </CardDescription>
              <CardTitle className={cn(
                "text-3xl font-mono",
                isProfit ? "text-red-500" : "text-green-500"
              )}>
                {isProfit ? "+" : ""}¥{formatNumber(summary.totalProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm font-medium",
                isProfit ? "text-red-500" : "text-green-500"
              )}>
                {isProfit ? "+" : ""}{formatNumber(summary.totalProfitRate)}%
              </p>
            </CardContent>
          </Card>

          {/* 今日收益 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日收益</CardDescription>
              <CardTitle className={cn(
                "text-3xl font-mono",
                isTodayProfit ? "text-red-500" : "text-green-500"
              )}>
                {isTodayProfit ? "+" : ""}¥{formatNumber(summary.todayProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                实时估值仅供参考
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 持仓列表 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">我的持仓</h2>
            {holdings.length > 0 && (
              <span className="text-sm text-gray-500">
                共 {holdings.length} 只基金
              </span>
            )}
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <p className="text-red-600">加载失败: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {holdings.length === 0 && !isLoading ? (
            <Card className="text-center py-12">
              <CardContent>
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  暂无持仓
                </h3>
                <p className="text-gray-500 mb-4">
                  添加您的第一只基金持仓，开始跟踪投资收益
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-1" />
                  添加持仓
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {holdings.map((holding) => (
                <FundCard
                  key={holding.id}
                  holding={{
                    ...holding,
                    marketValue: holding.totalShares * (holding.avgCost || 0),
                    profit: 0,
                    profitRate: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 风险提示 */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-medium">⚠️ 风险提示：</span>
            本页面展示的基金估值数据仅供参考，实际净值以基金公司官方披露为准。
            市场有风险，投资需谨慎。过往业绩不代表未来表现。
          </p>
        </div>
      </div>
    </main>
  );
}
