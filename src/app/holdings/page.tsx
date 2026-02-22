"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FundCard } from "@/components/fund-card";
import { usePortfolioStore } from "@/stores/portfolio";
import { getBatchEstimates, calculateEstimateProfit } from "@/services/fund";
import { formatNumber } from "@/lib/utils";
import { 
  Wallet, 
  Plus, 
  Search,
  ArrowUpDown,
  Filter
} from "lucide-react";
import Link from "next/link";
import type { FundEstimate, HoldingWithEstimate } from "@/types";

type SortOption = "marketValue" | "profitRate" | "todayProfit" | "fundName";

export default function HoldingsPage() {
  const { holdings, isLoading, error, fetchHoldings } = usePortfolioStore();
  const [mounted, setMounted] = useState(false);
  const [estimates, setEstimates] = useState<Map<string, FundEstimate>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("marketValue");
  const [sortDesc, setSortDesc] = useState(true);

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

  const filteredHoldings = holdingsWithEstimates
    .filter(h => 
      h.fundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.fundId.includes(searchQuery)
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "marketValue":
          comparison = a.marketValue - b.marketValue;
          break;
        case "profitRate":
          comparison = a.profitRate - b.profitRate;
          break;
        case "todayProfit":
          comparison = a.todayProfit - b.todayProfit;
          break;
        case "fundName":
          comparison = a.fundName.localeCompare(b.fundName);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });

  const summary = {
    totalAssets: holdingsWithEstimates.reduce((sum, h) => sum + h.marketValue, 0),
    holdingCount: holdings.length
  };

  useEffect(() => { 
    setMounted(true); 
    fetchHoldings(); 
  }, [fetchHoldings]);

  const loadEstimates = useCallback(async () => {
    if (holdings.length === 0) return;
    try {
      const fundCodes = holdings.map(h => h.fundId);
      const estimatesMap = await getBatchEstimates(fundCodes);
      setEstimates(estimatesMap);
    } catch (error) {
      console.error("加载估值失败:", error);
    }
  }, [holdings]);

  useEffect(() => { loadEstimates(); }, [loadEstimates]);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">持仓明细</h1>
              <p className="text-sm text-slate-500">
                {summary.holdingCount} 只基金 · 总资产 ¥{formatNumber(summary.totalAssets)}
              </p>
            </div>
          </div>
          <Link
            href="/import"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            添加基金
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索基金名称或代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="marketValue">按市值</option>
              <option value="profitRate">按收益率</option>
              <option value="todayProfit">按今日涨跌</option>
              <option value="fundName">按名称</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDesc(!sortDesc)}
              className="shrink-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50/80 border-red-200 mb-6">
            <CardContent className="py-6">
              <p className="text-red-600">加载失败: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : holdings.length === 0 ? (
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
              <Link
                href="/import"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加持仓
              </Link>
            </CardContent>
          </Card>
        ) : filteredHoldings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">没有找到匹配的基金</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredHoldings.map((holding) => (
              <FundCard key={holding.id} holding={holding} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
