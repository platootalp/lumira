"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useCreateHolding } from "@/hooks/use-holdings";
import type { FundType } from "@/types";
import { useToast } from "@/components/ui/toast";

interface ManualTabProps {
  onSuccess?: () => void;
}

const FUND_TYPES: { value: FundType; label: string }[] = [
  { value: "STOCK", label: "股票型" },
  { value: "BOND", label: "债券型" },
  { value: "MIX", label: "混合型" },
  { value: "INDEX", label: "指数型" },
  { value: "QDII", label: "QDII" },
  { value: "FOF", label: "FOF" },
  { value: "MONEY", label: "货币型" },
];

const CHANNELS = [
  { value: "蚂蚁财富", label: "蚂蚁财富" },
  { value: "天天基金", label: "天天基金" },
  { value: "且慢", label: "且慢" },
  { value: "招商银行", label: "招商银行" },
  { value: "其他", label: "其他" },
];

interface FormData {
  fundCode: string;
  fundName: string;
  fundType: FundType;
  shares: string;
  avgCost: string;
  channel: string;
  group: string;
}

const initialFormData: FormData = {
  fundCode: "",
  fundName: "",
  fundType: "STOCK",
  shares: "",
  avgCost: "",
  channel: "蚂蚁财富",
  group: "",
};

export function ManualTab({ onSuccess }: ManualTabProps) {
  const { showToast } = useToast();
  const createHolding = useCreateHolding();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const totalCost = useMemo(() => {
    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avgCost);
    if (isNaN(shares) || isNaN(avgCost)) return 0;
    return shares * avgCost;
  }, [formData.shares, formData.avgCost]);

  const validateFundCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fundCode.trim()) {
      newErrors.fundCode = "请输入基金代码";
    } else if (!validateFundCode(formData.fundCode)) {
      newErrors.fundCode = "基金代码必须是6位数字";
    }

    if (!formData.fundName.trim()) {
      newErrors.fundName = "请输入基金名称";
    }

    if (!formData.shares.trim()) {
      newErrors.shares = "请输入持有份额";
    } else if (isNaN(parseFloat(formData.shares)) || parseFloat(formData.shares) <= 0) {
      newErrors.shares = "持有份额必须大于0";
    }

    if (!formData.avgCost.trim()) {
      newErrors.avgCost = "请输入成本单价";
    } else if (isNaN(parseFloat(formData.avgCost)) || parseFloat(formData.avgCost) <= 0) {
      newErrors.avgCost = "成本单价必须大于0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const shares = parseFloat(formData.shares);
      const avgCost = parseFloat(formData.avgCost);
      const calculatedTotalCost = shares * avgCost;

      await createHolding.mutateAsync({
        fundId: formData.fundCode,
        fundName: formData.fundName,
        fundType: formData.fundType,
        totalShares: shares,
        avgCost: avgCost,
        totalCost: calculatedTotalCost,
        channel: formData.channel,
        ...(formData.group.trim() ? { group: formData.group.trim() } : {}),
      });

      showToast({
        type: "success",
        title: "添加成功",
        message: "基金添加成功！",
      });

      // Reset form
      setFormData(initialFormData);

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("保存基金失败:", error);
      showToast({
        type: "error",
        title: "保存失败",
        message: "保存失败，请重试",
      });
    }
  };

  const inputClassName =
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基金代码 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          基金代码 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fundCode}
          onChange={(e) => handleInputChange("fundCode", e.target.value)}
          placeholder="请输入6位基金代码"
          maxLength={6}
          className={`${inputClassName} ${errors.fundCode ? "border-red-500" : "border-slate-300"}`}
        />
        {errors.fundCode && (
          <p className="mt-1 text-sm text-red-500">{errors.fundCode}</p>
        )}
      </div>

      {/* 基金名称 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          基金名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fundName}
          onChange={(e) => handleInputChange("fundName", e.target.value)}
          placeholder="请输入基金名称"
          className={`${inputClassName} ${errors.fundName ? "border-red-500" : "border-slate-300"}`}
        />
        {errors.fundName && (
          <p className="mt-1 text-sm text-red-500">{errors.fundName}</p>
        )}
      </div>

      {/* 基金类型 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          基金类型 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.fundType}
          onChange={(e) => handleInputChange("fundType", e.target.value as FundType)}
          className={`${inputClassName} border-slate-300 bg-white`}
        >
          {FUND_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 持有份额 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          持有份额 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.shares}
          onChange={(e) => handleInputChange("shares", e.target.value)}
          placeholder="请输入持有份额"
          className={`${inputClassName} ${errors.shares ? "border-red-500" : "border-slate-300"}`}
        />
        {errors.shares && (
          <p className="mt-1 text-sm text-red-500">{errors.shares}</p>
        )}
      </div>

      {/* 成本单价 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          成本单价 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.0001"
          min="0"
          value={formData.avgCost}
          onChange={(e) => handleInputChange("avgCost", e.target.value)}
          placeholder="请输入成本单价"
          className={`${inputClassName} ${errors.avgCost ? "border-red-500" : "border-slate-300"}`}
        />
        {errors.avgCost && (
          <p className="mt-1 text-sm text-red-500">{errors.avgCost}</p>
        )}
      </div>

      {/* 总成本（自动计算） */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          总成本
        </label>
        <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600">
          {totalCost > 0 ? `¥${totalCost.toFixed(2)}` : "--"}
        </div>
      </div>

      {/* 购买渠道 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          购买渠道
        </label>
        <select
          value={formData.channel}
          onChange={(e) => handleInputChange("channel", e.target.value)}
          className={`${inputClassName} border-slate-300 bg-white`}
        >
          {CHANNELS.map((channel) => (
            <option key={channel.value} value={channel.value}>
              {channel.label}
            </option>
          ))}
        </select>
      </div>

      {/* 分组 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          分组
        </label>
        <input
          type="text"
          value={formData.group}
          onChange={(e) => handleInputChange("group", e.target.value)}
          placeholder="请输入分组（可选）"
          className={`${inputClassName} border-slate-300`}
        />
      </div>

      {/* 提交按钮 */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={createHolding.isPending}
          className="w-full"
        >
          {createHolding.isPending ? "保存中..." : "添加基金"}
        </Button>
      </div>
    </form>
  );
}
