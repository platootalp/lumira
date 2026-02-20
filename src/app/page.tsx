"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundCard } from "@/components/fund-card";
import { AddHoldingModal } from "@/components/add-holding-modal";
import { PortfolioChart } from "@/components/portfolio-chart";
import { DataImportExport } from "@/components/data-import-export";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolioStore } from "@/stores/portfolio";
import { holdingDb } from "@/lib/db";
import { getBatchEstimates, calculateEstimateProfit } from "@/services/fund";
import { formatNumber, cn } from "@/lib/utils";
import { Plus, RefreshCw, TrendingUp, TrendingDown, Wallet, Settings } from "lucide-react";

import type { Holding, HoldingWithEstimate, FundEstimate } from "@/types";

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
  } = usePortfolioStore();

  const [mounted, setMounted] = useState(false);
  const [estimates, setEstimates] = useState<Map<string, FundEstimate>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 计算带估值的持仓
  const holdingsWithEstimates: HoldingWithEstimate[] = holdings.map(holding => {
    const estimate = estimates.get(holding.fundId);
    const estimateNav = estimate?.lastNav || holding.avgCost;
    
    const profit = calculateEstimateProfit(
      holding.totalShares,
      holding.avgCost,
      estimateNav
    );
    
    return {
      ...holding,
      estimateNav: estimate?.estimateNav,
      estimateTime: estimate?.estimateTime,
      marketValue: profit.marketValue,
      profit: profit.profit,
      profitRate: profit.profitRate,
      todayProfit: profit.todayProfit
    };
  });

  // 计算汇总数据
  const summary = {
    totalAssets: holdingsWithEstimates.reduce((sum, h) => sum + h.marketValue, 0),
    totalCost: holdingsWithEstimates.reduce((sum, h) => sum + h.totalCost, 0),
    totalProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.profit, 0),
    todayProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.todayProfit, 0),
    holdingCount: holdings.length
  };
  
  const totalProfitRate = summary.totalCost > 0 
    ? (summary.totalProfit / summary.totalCost) * 100 
    : 0;

  const isProfit = summary.totalProfit >= 0;
  const isTodayProfit = summary.todayProfit >= 0;

  // 初始加载
  useEffect(() => {
    setMounted(true);
    fetchHoldings();
  }, [fetchHoldings]);

  // 加载估值数据
  const loadEstimates = useCallback(async () => {
    if (holdings.length === 0) return;
    
    setIsRefreshing(true);
    try {
      const fundCodes = holdings.map(h => h.fundId);
      const estimatesMap = await getBatchEstimates(fundCodes);
      setEstimates(estimatesMap);
    } catch (error) {
      console.error("加载估值失败:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings]);

  // 加载估值
  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  // 添加持仓
  const handleAddHolding = async (data: {
    fundId: string;
    fundName: string;
    shares: number;
    avgCost: number;
    channel?: string;
  }) => {
    await holdingDb.create({
      fundId: data.fundId,
      fundName: data.fundName,
      totalShares: data.shares,
      avgCost: data.avgCost,
      totalCost: data.shares * data.avgCost,
      channel: data.channel,
      version: 1
    });
    await fetchHoldings();
  };

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
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-4 h-4 mr-1" />
                设置
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadEstimates}
                disabled={isRefreshing || holdings.length === 0}
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
                {isRefreshing ? "更新中" : "刷新估值"}
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
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
                {isProfit ? "+" : ""}{formatNumber(totalProfitRate)}%
              </p>
            </CardContent>
          </Card>

          {/* 今日收益 */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日预估收益</CardDescription>
              <CardTitle className={cn(
                "text-3xl font-mono",
                isTodayProfit ? "text-red-500" : "text-green-500"
              )}>
                {isTodayProfit ? "+" : ""}¥{formatNumber(summary.todayProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                基于实时估值
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        {holdings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>图表分析</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="allocation">
                <TabsList className="mb-4">
                  <TabsTrigger value="allocation">资产配置</TabsTrigger>
                  <TabsTrigger value="profit">收益分布</TabsTrigger>
                  <TabsTrigger value="trend">收益走势</TabsTrigger>
                </TabsList>
                <TabsContent value="allocation">
                  <PortfolioChart
                    holdings={holdingsWithEstimates}
                    type="allocation"
                  />
                </TabsContent>
                <TabsContent value="profit">
                  <PortfolioChart
                    holdings={holdingsWithEstimates}
                    type="profit"
                  />
                </TabsContent>
                <TabsContent value="trend">
                  <PortfolioChart
                    holdings={holdingsWithEstimates}
                    type="trend"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* 持仓列表 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">我的持仓</h2>
            {holdings.length > 0 && (
              <span className="text-sm text-gray-500">
                持有 {holdings.length} 只基金
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
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加持仓
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {holdingsWithEstimates.map((holding) => (
                <FundCard
                  key={holding.id}
                  holding={holding}
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
            市场有风险，投资需谨慎。
          </p>
        </div>
      </div>

      {/* 添加持仓弹窗 */}
      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHolding}
      />

      {/* 设置弹窗 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <DataImportExport
            onImportSuccess={() => {
              fetchHoldings();
              setIsSettingsOpen(false);
            }}
          />
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}

// shadcn Card 样式兼容
function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
}
