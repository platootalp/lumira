"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FundCard } from "@/components/fund-card";
import { AddHoldingModal } from "@/components/add-holding-modal";
import { PortfolioChart } from "@/components/portfolio-chart";
import { DataImportExport } from "@/components/data-import-export";
import { SIPCalculator } from "@/components/sip-calculator";
import { usePortfolioStore } from "@/stores/portfolio";
import { holdingDb } from "@/lib/db";
import { getBatchEstimates, calculateEstimateProfit } from "@/services/fund";
import { formatNumber, cn } from "@/lib/utils";
import { 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Settings, 
  GitCompare, 
  Trophy,
  PieChart,
  Activity,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FundEstimate, HoldingWithEstimate } from "@/types";

export default function HomePage() {
  const { holdings, isLoading, error, fetchHoldings } = usePortfolioStore();
  const [mounted, setMounted] = useState(false);
  const [estimates, setEstimates] = useState<Map<string, FundEstimate>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const holdingsWithEstimates: HoldingWithEstimate[] = holdings.map(holding => {
    const estimate = estimates.get(holding.fundId);
    const estimateNav = estimate?.lastNav || holding.avgCost;
    const profit = calculateEstimateProfit(holding.totalShares, holding.avgCost, estimateNav);
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

  const summary = {
    totalAssets: holdingsWithEstimates.reduce((sum, h) => sum + h.marketValue, 0),
    totalCost: holdingsWithEstimates.reduce((sum, h) => sum + h.totalCost, 0),
    totalProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.profit, 0),
    todayProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.todayProfit, 0),
    holdingCount: holdings.length
  };
  
  const totalProfitRate = summary.totalCost > 0 ? (summary.totalProfit / summary.totalCost) * 100 : 0;
  const isProfit = summary.totalProfit >= 0;
  const isTodayProfit = summary.todayProfit >= 0;

  useEffect(() => { setMounted(true); fetchHoldings(); }, [fetchHoldings]);

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

  useEffect(() => { loadEstimates(); }, [loadEstimates]);

  const handleAddHolding = async (data: any) => {
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
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Lumira
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/rankings">
                <Button variant="outline" size="sm">
                  <Trophy className="w-4 h-4 mr-1.5 text-amber-500" />
                  排行
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" size="sm">
                  <GitCompare className="w-4 h-4 mr-1.5 text-blue-500" />
                  对比
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-1.5 text-slate-500" />
                设置
              </Button>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                添加
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">资产总览</h2>
          <p className="text-slate-500">实时跟踪您的投资组合表现</p>
        </div>

        {/* 收益卡片 - skills.sh 风格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 总资产 */}
          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-blue-500" />
                </div>
                总资产
              </CardDescription>
              <CardTitle className="text-3xl font-bold amount-display text-slate-900">
                ¥{formatNumber(summary.totalAssets)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {summary.holdingCount} 只基金
                </span>
              </p>
            </CardContent>
          </Card>

          {/* 累计收益 */}
          <Card className={cn("group relative overflow-hidden", isProfit ? "border-red-100/50" : "border-emerald-100/50")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", isProfit ? "bg-gradient-to-br from-red-500/5 to-orange-500/5" : "bg-gradient-to-br from-emerald-500/5 to-teal-500/5")} />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isProfit ? "bg-red-50" : "bg-emerald-50")}>
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                累计收益
              </CardDescription>
              <CardTitle className={cn("text-3xl font-bold amount-display", isProfit ? "profit-up" : "profit-down")}>
                {isProfit ? "+" : ""}¥{formatNumber(summary.totalProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold", isProfit ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                {isProfit ? "+" : ""}{formatNumber(totalProfitRate)}%
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          {/* 今日收益 */}
          <Card className={cn("group relative overflow-hidden", isTodayProfit ? "border-red-100/50" : "border-emerald-100/50")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", isTodayProfit ? "bg-gradient-to-br from-red-500/5 to-orange-500/5" : "bg-gradient-to-br from-emerald-500/5 to-teal-500/5")} />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isTodayProfit ? "bg-red-50" : "bg-emerald-50")}>
                  <Activity className={cn("w-4 h-4", isTodayProfit ? "text-red-500" : "text-emerald-500")} />
                </div>
                今日预估收益
              </CardDescription>
              <CardTitle className={cn("text-3xl font-bold amount-display", isTodayProfit ? "profit-up" : "profit-down")}>
                {isTodayProfit ? "+" : ""}¥{formatNumber(summary.todayProfit)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">基于实时估值计算</p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        {holdings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">图表分析</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadEstimates}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "更新中" : "刷新"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="allocation">
                <TabsList className="mb-6 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="allocation" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    资产配置
                  </TabsTrigger>
                  <TabsTrigger value="profit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    收益分布
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    收益走势
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="allocation">
                  <PortfolioChart holdings={holdingsWithEstimates} type="allocation" />
                </TabsContent>
                <TabsContent value="profit">
                  <PortfolioChart holdings={holdingsWithEstimates} type="profit" />
                </TabsContent>
                <TabsContent value="trend">
                  <PortfolioChart holdings={holdingsWithEstimates} type="trend" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* 定投计算器 */}
        <SIPCalculator className="mb-8" />

        {/* 持仓列表 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">我的持仓</h2>
              <p className="text-sm text-slate-500 mt-1">
                共 {holdings.length} 只基金
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              添加持仓
            </Button>
          </div>

          {error && (
            <Card className="bg-red-50/80 border-red-200">
              <CardContent className="py-6">
                <p className="text-red-600">加载失败: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {holdings.length === 0 && !isLoading ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  暂无持仓
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  添加您的第一只基金持仓，开始跟踪投资收益
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  添加持仓
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {holdingsWithEstimates.map((holding) => (
                <FundCard key={holding.id} holding={holding} />
              ))}
            </div>
          )}
        </div>

        {/* 风险提示 */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-xl">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">风险提示</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                本页面展示的基金估值数据仅供参考，实际净值以基金公司官方披露为准。市场有风险，投资需谨慎。过往业绩不代表未来表现。
              </p>
            </div>
          </div>