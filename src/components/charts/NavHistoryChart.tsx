"use client";

import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavHistoryItem {
  date: string;
  nav: number;
  accumNav: number;
  change?: number;
  changePercent?: number;
}

interface NavHistoryChartProps {
  data: NavHistoryItem[];
  estimateNav?: number;
  estimateTime?: string;
  timeRange?: "1m" | "3m" | "6m" | "1y" | "all";
}

type TimeRangeOption = "1m" | "3m" | "6m" | "1y" | "all";

const TIME_RANGE_OPTIONS: { value: TimeRangeOption; label: string }[] = [
  { value: "1m", label: "1月" },
  { value: "3m", label: "3月" },
  { value: "6m", label: "6月" },
  { value: "1y", label: "1年" },
  { value: "all", label: "全部" },
];

function filterDataByTimeRange(
  data: NavHistoryItem[],
  range: TimeRangeOption
): NavHistoryItem[] {
  if (range === "all" || data.length === 0) {
    return data;
  }

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "1m":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

export function NavHistoryChart({
  data,
  estimateNav,
  estimateTime,
  timeRange: initialTimeRange = "3m",
}: NavHistoryChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>(initialTimeRange);

  const filteredData = useMemo(() => {
    return filterDataByTimeRange(data, selectedRange);
  }, [data, selectedRange]);

  const chartData = useMemo(() => {
    const dates: string[] = [];
    const navs: number[] = [];
    const changes: number[] = [];

    filteredData.forEach((item) => {
      dates.push(item.date);
      navs.push(item.nav);
      changes.push(item.changePercent || 0);
    });

    // Add estimate point if available and it's today
    if (estimateNav && estimateTime) {
      const today = new Date().toISOString().split("T")[0];
      const lastDataDate = dates[dates.length - 1];
      
      // Only add if estimate is for today and not already in data
      if (estimateTime.startsWith(today) && lastDataDate !== today) {
        dates.push(today);
        navs.push(estimateNav);
        changes.push(0); // Estimate doesn't have change percent
      }
    }

    return { dates, navs, changes };
  }, [filteredData, estimateNav, estimateTime]);

  const option = useMemo(() => {
    const isPositive =
      chartData.navs.length > 1
        ? chartData.navs[chartData.navs.length - 1] >= chartData.navs[0]
        : true;

    const lineColor = isPositive ? "#ef4444" : "#22c55e";
    const areaColorStart = isPositive
      ? "rgba(239, 68, 68, 0.3)"
      : "rgba(34, 197, 94, 0.3)";
    const areaColorEnd = isPositive
      ? "rgba(239, 68, 68, 0.05)"
      : "rgba(34, 197, 94, 0.05)";

    return {
      backgroundColor: "transparent",
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "#1e293b",
          fontSize: 13,
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const date = chartData.dates[dataIndex];
          const nav = chartData.navs[dataIndex];
          const change = chartData.changes[dataIndex];
          const isEstimate = estimateTime?.startsWith(date) && dataIndex === chartData.dates.length - 1;

          let html = `<div style="font-weight: 600; margin-bottom: 8px; color: #334155;">${date}</div>`;
          html += `<div style="display: flex; align-items: center; gap: 8px;">`;
          html += `<span style="color: #64748b;">净值:</span>`;
          html += `<span style="font-weight: 600; font-family: monospace; font-size: 14px;">${nav.toFixed(4)}</span>`;
          if (isEstimate) {
            html += `<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">估值</span>`;
          }
          html += `</div>`;

          if (change !== undefined && change !== 0 && !isEstimate) {
            const changeColor = change >= 0 ? "#ef4444" : "#22c55e";
            const changeSign = change >= 0 ? "+" : "";
            html += `<div style="margin-top: 6px; color: ${changeColor}; font-weight: 500;">`;
            html += `涨跌: ${changeSign}${change.toFixed(2)}%`;
            html += `</div>`;
          }

          return html;
        },
      },
      xAxis: {
        type: "category",
        data: chartData.dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: "#e2e8f0",
          },
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: (value: string) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: (value: number) => value.toFixed(3),
        },
        splitLine: {
          lineStyle: {
            color: "#f1f5f9",
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "净值",
          type: "line",
          data: chartData.navs,
          smooth: true,
          symbol: "circle",
          symbolSize: (_value: number, params: any) => {
            // Highlight estimate point
            const isEstimate =
              estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
              params.dataIndex === chartData.dates.length - 1;
            return isEstimate ? 10 : 4;
          },
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          itemStyle: {
            color: (params: any) => {
              const isEstimate =
                estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
                params.dataIndex === chartData.dates.length - 1;
              return isEstimate ? "#3b82f6" : lineColor;
            },
            borderWidth: (params: any) => {
              const isEstimate =
                estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
                params.dataIndex === chartData.dates.length - 1;
              return isEstimate ? 3 : 2;
            },
            borderColor: "#fff",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: areaColorStart },
                { offset: 1, color: areaColorEnd },
              ],
            },
          },
          markPoint: estimateNav
            ? {
                data: [
                  {
                    coord: [
                      chartData.dates[chartData.dates.length - 1],
                      chartData.navs[chartData.navs.length - 1],
                    ],
                    value: "估值",
                    itemStyle: {
                      color: "#3b82f6",
                    },
                    label: {
                      show: true,
                      position: "top",
                      formatter: "估值",
                      fontSize: 10,
                      color: "#3b82f6",
                    },
                  },
                ],
                symbolSize: 0,
              }
            : undefined,
        },
      ],
      animation: true,
      animationDuration: 800,
      animationEasing: "cubicOut",
    };
  }, [chartData, estimateTime]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
        <p>暂无净值历史数据</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TIME_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedRange === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(option.value)}
              className={cn(
                "text-xs px-3 py-1 h-7",
                selectedRange === option.value
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {estimateNav && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></span>
            <span className="text-slate-600">实时估值: </span>
            <span className="font-mono font-semibold text-slate-900">
              {estimateNav.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500 rounded-full"></div>
          <span className="text-xs text-slate-600">上涨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-500 rounded-full"></div>
          <span className="text-xs text-slate-600">下跌</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
          <span className="text-xs text-slate-600">实时估值</span>
        </div>
      </div>
    </div>
  );
}
