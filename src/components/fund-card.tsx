"use client";

import React, { memo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { HoldingWithEstimate } from "@/types";
import { formatNumber, cn } from "@/lib/utils";

interface FundCardProps {
  holding: HoldingWithEstimate;
  onClick?: () => void;
  className?: string;
}

/**
 * 基金持仓卡片组件
 * 
 * Agent: ui-architect
 * 展示持仓基金的基本信息和收益情况
 */
export const FundCard = memo(function FundCard({
  holding,
  onClick,
  className
}: FundCardProps) {
  const isProfit = holding.profit >= 0;
  const isTodayProfit = (holding.todayProfit || 0) >= 0;
  
  return (
    <Link 
      href={`/fund/${holding.fundId}`}
      className={cn(
        "block cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          {/* 基金信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {holding.fundName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {holding.fundId}
              {holding.group && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                  {holding.group}
                </span>
              )}
            </p>
          </div>
          
          {/* 收益信息 */}
          <div className="text-right ml-4">
            <p className={cn(
              "font-semibold",
              isProfit ? "text-red-500" : "text-green-500"
            )}>
              {isProfit ? "+" : ""}{formatNumber(holding.profitRate)}%
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              ¥{formatNumber(holding.marketValue)}
            </p>
          </div>
        </div>
        
        {/* 详情行 */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
          <div className="text-gray-500">
            <span>持仓: {formatNumber(holding.totalShares, 2)}份</span>
            <span className="ml-3">成本: ¥{formatNumber(holding.avgCost, 4)}</span>
          </div>
          {holding.todayProfit !== undefined && (
            <div className={cn(
              isTodayProfit ? "text-red-500" : "text-green-500"
            )}>
              今日{isTodayProfit ? "+" : ""}¥{formatNumber(holding.todayProfit)}
            </div>
          )}
        </div>
        
        {/* 估值提示 */}
        {holding.estimateNav && (
          <p className="mt-2 text-xs text-gray-400">
            估值 {formatNumber(holding.estimateNav, 4)} · {holding.estimateTime}
          </p>
        )}
      </CardContent>
    </Card>
    </Link>
  );
});
