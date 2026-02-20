/**
 * 基金数据服务
 * 
 * Skills: fund-data-fetch
 * Agent: backend-engineer
 */

import type { Fund, FundEstimate, FundNavHistory } from "@/types";
import { fundDb } from "@/lib/db";

const EAST_MONEY_API = "https://fundmobapi.eastmoney.com/FundMApi";

/**
 * 搜索基金
 */
export async function searchFunds(query: string): Promise<Fund[]> {
  const response = await fetch(`/api/funds/search?q=${encodeURIComponent(query)}`);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.error?.message || "搜索失败");
}

/**
 * 获取基金实时估值
 */
export async function getFundEstimate(fundCode: string): Promise<FundEstimate> {
  // 先检查缓存
  const cached = await fundDb.get(fundCode);
  if (cached && cached.estimateNav && cached.updatedAt) {
    const cacheAge = Date.now() - cached.updatedAt.getTime();
    // 30秒内返回缓存
    if (cacheAge < 30000) {
      return {
        fundId: cached.id,
        fundName: cached.name,
        estimateNav: cached.estimateNav,
        estimateTime: cached.estimateTime || "",
        estimateChange: cached.estimateChange || 0,
        estimateChangePercent: cached.estimateChangePercent || 0,
        lastNav: cached.nav,
        lastNavDate: cached.navDate,
        source: "cache",
        cached: true
      };
    }
  }

  // 获取实时数据
  const response = await fetch(`/api/funds/${fundCode}/estimate`);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
  
  throw new Error(result.error?.message || "获取估值失败");
}

/**
 * 批量获取基金估值
 */
export async function getBatchEstimates(fundCodes: string[]): Promise<Map<string, FundEstimate>> {
  const estimates = new Map<string, FundEstimate>();
  
  // 批量请求（限制并发）
  const batchSize = 5;
  for (let i = 0; i < fundCodes.length; i += batchSize) {
    const batch = fundCodes.slice(i, i + batchSize);
    const promises = batch.map(code => 
      getFundEstimate(code).catch(() => null)
    );
    
    const results = await Promise.all(promises);
    
    results.forEach((estimate, index) => {
      if (estimate) {
        estimates.set(batch[index], estimate);
      }
    });
    
    // 延迟避免请求过快
    if (i + batchSize < fundCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return estimates;
}

/**
 * 获取基金净值历史
 */
export async function getNavHistory(
  fundCode: string,
  days = 365
): Promise<FundNavHistory> {
  // TODO: 集成净值历史 API
  return {
    fundId: fundCode,
    history: []
  };
}

/**
 * 解析天天基金响应
 */
function parseEastMoneyResponse(data: string): Partial<FundEstimate> {
  // 解析天天基金 API 响应
  try {
    const json = JSON.parse(data.replace(/^var\s+\w+=/, ''));
    return {
      estimateNav: parseFloat(json.gz),
      estimateTime: json.gztime,
      estimateChange: parseFloat(json.gszzl) / 100
    };
  } catch {
    throw new Error("解析响应失败");
  }
}
