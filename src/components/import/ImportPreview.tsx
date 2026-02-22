"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CHANNEL_OPTIONS } from "@/types/import";
import type { ImportPreviewItem } from "@/types/import";
import { AlertCircle, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportPreviewProps {
  items: ImportPreviewItem[];
  onUpdate: (id: string, updates: Partial<ImportPreviewItem>) => void;
  onRemove: (id: string) => void;
  onImport: () => void;
  isImporting: boolean;
}

export function ImportPreview({
  items,
  onUpdate,
  onRemove,
  onImport,
  isImporting,
}: ImportPreviewProps) {
  const validItems = items.filter((item) => item.valid);
  const invalidItems = items.filter((item) => !item.valid);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium">{validItems.length}</span> 条有效
          {invalidItems.length > 0 && (
            <span className="text-red-500 ml-2">
              ({invalidItems.length} 条有误)
            </span>
          )}
        </div>
        <Button
          onClick={onImport}
          disabled={validItems.length === 0 || isImporting}
        >
          {isImporting ? (
            <>导入中...</>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              导入 {validItems.length} 条记录
            </>
          )}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                基金
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700 w-24">
                份额
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700 w-24">
                成本
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700 w-32">
                渠道
              </th>
              <th className="px-3 py-2 text-center font-medium text-slate-700 w-10">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "hover:bg-slate-50",
                  !item.valid && "bg-red-50"
                )}
              >
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={item.fundName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(item.id, { fundName: e.target.value })
                      }
                      className="w-full h-7 text-sm px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="基金名称"
                    />
                    <input
                      type="text"
                      value={item.fundId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(item.id, { fundId: e.target.value })
                      }
                      className="w-24 h-7 text-sm px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="代码"
                    />
                    {!item.valid && item.errors.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {item.errors.join(", ")}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.totalShares || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(item.id, {
                        totalShares: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-7 text-sm px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.avgCost || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(item.id, {
                        avgCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-7 text-sm px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.channel || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      onUpdate(item.id, { channel: e.target.value })
                    }
                    className="w-full h-7 text-sm px-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CHANNEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
