"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionDb, holdingDb } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Minus } from "lucide-react";
import type { TransactionType } from "@/types";

interface TransactionFormProps {
  fundId: string;
  fundName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 交易记录表单
 * 
 * Agent: ui-architect
 */
export function TransactionForm({
  fundId,
  fundName,
  onSuccess,
  onCancel
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("BUY");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = shares && price ? parseFloat(shares) * parseFloat(price) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shares || !price) return;

    setIsSubmitting(true);
    try {
      // 获取持仓
      const holdings = await holdingDb.getByFundId(fundId);
      let holdingId = holdings[0]?.id;

      // 如果没有持仓，创建新持仓
      if (!holdingId && type === "BUY") {
        holdingId = await holdingDb.create({
          fundId,
          fundName,
          totalShares: 0,
          avgCost: 0,
          totalCost: 0
        });
      }

      if (!holdingId) {
        throw new Error("未找到持仓记录");
      }

      // 创建交易记录
      await transactionDb.create({
        holdingId,
        fundId,
        fundName,
        type,
        date,
        shares: parseFloat(shares),
        price: parseFloat(price),
        amount,
        fee: fee ? parseFloat(fee) : 0,
        notes
      });

      // 更新持仓信息
      const allTransactions = await transactionDb.getByHoldingId(holdingId);
      const totalShares = allTransactions.reduce((sum, tx) => {
        return tx.type === "BUY" ? sum + tx.shares : sum - tx.shares;
      }, 0);

      const totalCost = allTransactions
        .filter(tx => tx.type === "BUY")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

      await holdingDb.update(holdingId, {
        totalShares,
        avgCost,
        totalCost
      });

      onSuccess?.();
    } catch (error) {
      console.error("添加交易失败:", error);
      alert("添加交易失败: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加交易记录 - {fundName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 交易类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              交易类型
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("BUY")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2",
                  type === "BUY"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "hover:bg-gray-50"
                )}
              >
                <Plus className="w-4 h-4" />
                买入
              </button>
              <button
                type="button"
                onClick={() => setType("SELL")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2",
                  type === "SELL"
                    ? "bg-orange-50 border-orange-500 text-orange-700"
                    : "hover:bg-gray-50"
                )}
              >
                <Minus className="w-4 h-4" />
                卖出
              </button>
            </div>
          </div>

          {/* 交易日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              交易日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 份额和价格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                份额 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                单价 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.0000"
                step="0.0001"
                min="0.0001"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 手续费和备注 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手续费
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="选填"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 金额预览 */}
          {amount > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">交易金额:</span>
                <span className="font-medium">
                  {type === "BUY" ? "-" : "+"}¥{amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !shares || !price}
              className={cn(
                "flex-1",
                type === "SELL" && "bg-orange-600 hover:bg-orange-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认添加"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
