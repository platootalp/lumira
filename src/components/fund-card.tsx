"use client";

import React, { memo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { HoldingWithEstimate } from "@/types";
import { formatNumber, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowRight, Building2 } from "lucide-react";

interface FundCardProps {
  holding: HoldingWithEstimate;
  className?: string;
}

export const FundCard = memo(function FundCard({
  holding,
  className
}: FundCardProps) {
  const isProfit = holding.profit >= 0;
  const isTodayProfit = (holding.todayProfit || 0) >= 0;

  return (
    <Link href={`/fund/${holding.fundId}`} className="block group">
      <Card className={cn(
        "h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl",
        "border-slate-100/50 bg-white/80",
        className
      )}>
        <CardContent className="p-5">
          {/* 顶部：基金信息和收益 */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {holding.fundName}
                </h3>
                {holding.group && (
                  <span className="tag tag-primary flex-shrink-0">{holding.group}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-mono font-medium">{holding.fundId}</span>
                {holding.channel && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {holding.channel}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 收益率 */}
            <div className={cn(
              "flex flex-col items-end ml-4 p-3 rounded-xl",
              isProfit ? "bg-gradient-to-br from-red-50 to-red-100/50" : "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
            )}>
              <div className="flex items-center gap-1 mb-1">
                {isProfit ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-5 text-emerald-500" />
                )}
                <span className={cn("text-sm font-medium", isProfit ? "text-red-600" : "text-emerald-600")}>
                  {isProfit ? "+" : ""}{formatNumber(holding.profitRate)}%
                </span>
              </div>
              <span className={cn("text-xs", isProfit ? "text-red-400" : "text-emerald-400")}>收益率</span>
            </div>
          </div>

          {/* 中部：市值和收益金额 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">市值</p>
              <p className="text-lg font-bold amount-display text-slate-900">
                ¥{formatNumber(holding.marketValue)}
              </p>
            </div>
            <div className={cn("p-3 rounded-xl", isProfit ? "bg-red-50" : "bg-emerald-50")}>
              <p className={cn("text-xs mb-1", isProfit ? "text-red-400" : "text-emerald-400")}>盈亏</p>
              <p className={cn("text-lg font-bold amount-display", isProfit ? "text-red-600" : "text-emerald-600")}>
                {isProfit ? "+" : ""}¥{formatNumber(Math.abs(holding.profit))}
              </p>
            </div>
          </div>

          {/* 底部：持仓详情 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>
                <span className="text-slate-400">份额</span>{" "}
                <span className="font-medium text-slate-700">{formatNumber(holding.totalShares, 2)}</span>
              </span>
              <span className="text-slate-200">|</span>
              <span>
                <span className="text-slate-400">成本</span>{" "}
                <span className="font-mono font-medium text-slate-700">¥{formatNumber(holding.avgCost, 4)}</span>
              </span>
            </div>

            {/* 今日预估 */}
            {holding.todayProfit !== 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                isTodayProfit ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
              )}>
                今日{isTodayProfit ? "+" : "-"}¥{formatNumber(Math.abs(holding.todayProfit))}
              </div>
            )}
          </div>

          {/* 估值信息 */}
          {holding.estimateNav && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">估值</span>
                <span className="font-mono font-medium text-slate-700">{formatNumber(holding.estimateNav, 4)}</span>
                <span className="text-xs text-slate-400">{holding.estimateTime}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});
