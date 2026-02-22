"use client";

import React, { useState, useRef, useCallback } from "react";
import { searchFunds } from "@/services/fund";
import { useCreateHolding } from "@/hooks/use-holdings";
import type { Fund } from "@/types";
import { debounce } from "@/lib/utils";
import { Search, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface SearchTabProps {
  onSuccess?: () => void;
}

const CHANNEL_OPTIONS = [
  "蚂蚁财富",
  "天天基金",
  "且慢",
  "招商银行",
  "其他"
];

/**
 * 搜索导入标签页组件
 *
 * 两步流程：搜索基金 → 填写持仓详情
 */
export function SearchTab({ onSuccess }: SearchTabProps) {
  const { showToast } = useToast();
  const createHolding = useCreateHolding();
  const [step, setStep] = useState<"search" | "form">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [channel, setChannel] = useState("");

  // 防抖搜索
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchFunds(query);
        setSearchResults(results);
      } catch (error) {
        console.error("搜索失败:", error);
        showToast({
          type: "error",
          title: "搜索失败",
          message: "搜索基金失败，请稍后重试",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSelectFund = (fund: Fund) => {
    setSelectedFund(fund);
    setStep("form");
    // 自动填充当前净值作为成本
    setAvgCost(fund.nav.toString());
  };

  const calculateTotalInvestment = useCallback(() => {
    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);
    if (isNaN(sharesNum) || isNaN(avgCostNum) || sharesNum <= 0 || avgCostNum <= 0) {
      return null;
    }
    return sharesNum * avgCostNum;
  }, [shares, avgCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund) return;

    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      showToast({
        type: "warning",
        title: "输入错误",
        message: "请输入有效的持有份额",
      });
      return;
    }

    if (isNaN(avgCostNum) || avgCostNum <= 0) {
      showToast({
        type: "warning",
        title: "输入错误",
        message: "请输入有效的成本单价",
      });
      return;
    }

    try {
      await createHolding.mutateAsync({
        fundId: selectedFund.id,
        fundName: selectedFund.name,
        fundType: selectedFund.type,
        totalShares: sharesNum,
        avgCost: avgCostNum,
        totalCost: sharesNum * avgCostNum,
        ...(channel ? { channel } : {}),
      });

      showToast({
        type: "success",
        title: "添加成功",
        message: `成功添加持仓：${selectedFund.name}`,
      });

      // 重置表单
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFund(null);
      setShares("");
      setAvgCost("");
      setChannel("");
      setStep("search");

      // 调用成功回调
      onSuccess?.();
    } catch (error) {
      console.error("保存持仓失败:", error);
      showToast({
        type: "error",
        title: "保存失败",
        message: "保存持仓失败: " + (error as Error).message,
      });
    }
  };

  const handleBack = () => {
    setStep("search");
    setSelectedFund(null);
    setShares("");
    setAvgCost("");
    setChannel("");
  };

  const totalInvestment = calculateTotalInvestment();

  return (
    <div className="space-y-4">
      {step === "search" ? (
        <div className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="输入基金名称或代码搜索"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* 搜索结果 */}
          <div className="h-[300px] overflow-y-auto border rounded-lg">
            {isSearching ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                搜索中...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => handleSelectFund(fund)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{fund.name}</div>
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>{fund.id}</span>
                      <span>{fund.company}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                未找到相关基金
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-12 h-12 mb-2 opacity-50" />
                <p>输入基金名称或6位基金代码</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 已选基金 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">{selectedFund?.name}</div>
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>{selectedFund?.id}</span>
              <span>最新净值: {selectedFund?.nav}</span>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-blue-600 mt-2 hover:underline"
            >
              重新选择
            </button>
          </div>

          {/* 份额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              持有份额 <span className="text-red-500">*</span>
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

          {/* 成本价 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              成本单价 (元) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="0.0000"
              step="0.0001"
              min="0.0001"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              已自动填充最新净值，请根据实际成本修改
            </p>
          </div>

          {/* 购买渠道 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              购买渠道
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择</option>
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* 投入金额预览 */}
          {totalInvestment !== null && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">投入金额:</span>
                <span className="font-medium text-blue-700">
                  ¥{totalInvestment.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            <button
              type="submit"
              disabled={createHolding.isPending || !shares || !avgCost}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {createHolding.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  确认添加
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
