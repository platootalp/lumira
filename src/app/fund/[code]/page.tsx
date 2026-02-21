"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { holdingDb, transactionDb } from "@/lib/db";
import { getFundEstimate, fetchNavHistory } from "@/services/fund";
import { formatNumber, cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Plus } from "lucide-react";
import { TransactionForm } from "@/components/transaction-form";
import { NavHistoryChart } from "@/components/charts/NavHistoryChart";

import type { Holding, Transaction, FundEstimate } from "@/types";

/**
 * 基金详情页
 * 
 * Agent: ui-architect
 */
export default function FundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fundCode = params.code as string;
  
  const [holding, setHolding] = useState<Holding | null>(null);
  const [estimate, setEstimate] = useState<FundEstimate | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [navHistory, setNavHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 获取持仓
      const holdings = await holdingDb.getByFundId(fundCode);
      if (holdings.length > 0) {
        setHolding(holdings[0]);

        // 获取交易记录
        const txs = await transactionDb.getByFundId(fundCode);
        setTransactions(txs);
      }

      // 获取估值
      const est = await getFundEstimate(fundCode);
      setEstimate(est);

      // 获取净值历史
      const history = await fetchNavHistory(fundCode, 90);
      setNavHistory(history.history || []);
    } catch (error) {
      console.error("加载基金详情失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fundCode) {
      loadData();
    }
  }, [fundCode]);

  // 计算收益
  const calculateProfit = () => {
    if (!holding || !estimate) return null;
    
    const marketValue = holding.totalShares * estimate.estimateNav;
    const profit = marketValue - holding.totalCost;
    const profitRate = (profit / holding.totalCost) * 100;
    
    return {
      marketValue,
      profit,
      profitRate,
      estimateNav: estimate.estimateNav
    };
  };

  const profit = calculateProfit();
  const isProfit = profit ? profit.profit >= 0 : true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">无法获取基金信息</p>
          <Button onClick={() => router.push("/")}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {estimate.fundName}
              </h1>
              <p className="text-sm text-gray-500">{fundCode}</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowTransactionForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加交易
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 估值卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>最新净值</CardDescription>
              <CardTitle className="text-2xl font-mono">
                {estimate.lastNav.toFixed(4)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{estimate.lastNavDate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>实时估值</CardDescription>
              <CardTitle className={cn(
                "text-2xl font-mono",
                estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"
              )}>
                {estimate.estimateNav.toFixed(4)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm font-medium",
                estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"
              )}>
                {estimate.estimateChangePercent >= 0 ? "+" : ""}
                {estimate.estimateChangePercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          {profit && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>持仓市值</CardDescription>
                  <CardTitle className="text-2xl font-mono">
                    ¥{formatNumber(profit.marketValue)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {holding?.totalShares.toFixed(2)} 份
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    持仓收益
                    {isProfit ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                  </CardDescription>
                  <CardTitle className={cn(
                    "text-2xl font-mono",
                    isProfit ? "text-red-500" : "text-green-500"
                  )}>
                    {isProfit ? "+" : ""}¥{formatNumber(profit.profit)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "text-sm font-medium",
                    isProfit ? "text-red-500" : "text-green-500"
                  )}>
                    {isProfit ? "+" : ""}{profit.profitRate.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 详情标签页 */}
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">净值走势</TabsTrigger>
            <TabsTrigger value="transactions">交易记录</TabsTrigger>
            <TabsTrigger value="analysis">收益分析</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>净值走势</CardTitle>
              </CardHeader>
              <CardContent>
                {navHistory.length > 0 ? (
                  <NavHistoryChart
                    data={navHistory}
                    estimateNav={estimate?.estimateNav}
                    estimateTime={estimate?.estimateTime}
                  />
                ) : (
                  <p className="text-gray-500">暂无净值历史数据</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>交易记录</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            tx.type === "BUY" ? "bg-blue-100" : "bg-orange-100"
                          )}>
                            {tx.type === "BUY" ? (
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            ) : (
                              <span className="text-orange-600 font-medium">赎</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.type === "BUY" ? "买入" : "卖出"}
                            </p>
                            <p className="text-sm text-gray-500">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {tx.type === "BUY" ? "-" : "+"}¥{formatNumber(tx.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {tx.shares.toFixed(2)} 份 @ {tx.price.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无交易记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>收益分析</CardTitle>
              </CardHeader>
              <CardContent>
                {holding ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">总成本</p>
                        <p className="text-xl font-mono font-medium">
                          ¥{formatNumber(holding.totalCost)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">平均成本</p>
                        <p className="text-xl font-mono font-medium">
                          ¥{holding.avgCost.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    
                    {profit && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">当前市值</p>
                          <p className="text-xl font-mono font-medium">
                            ¥{formatNumber(profit.marketValue)}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">盈亏金额</p>
                          <p className={cn(
                            "text-xl font-mono font-medium",
                            isProfit ? "text-red-500" : "text-green-500"
                          )}>
                            {isProfit ? "+" : ""}¥{formatNumber(profit.profit)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {holding.channel && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">购买渠道</p>
                        <p className="font-medium">{holding.channel}</p>
                      </div>
                    )}
                    
                    {holding.group && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">分组</p>
                        <p className="font-medium">{holding.group}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">您尚未持有该基金</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加交易弹窗 */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TransactionForm
            fundId={fundCode}
            fundName={estimate.fundName}
            onSuccess={() => {
              loadData();
              setShowTransactionForm(false);
            }}
            onCancel={() => setShowTransactionForm(false)}
          />
        </div>
      )}
    </main>
  );
}

// CardDescription 兼容组件
function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
}
