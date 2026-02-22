import { env } from '../../config/env';
import { redis, CACHE_TTL } from '../../config/redis';
import { logger } from '../../utils/logger';

export interface FundSearchResult {
  code: string;
  name: string;
  type: string;
}

export interface FundEstimate {
  fundId: string;
  fundName: string;
  estimateNav: number;
  estimateTime: string;
  estimateChange: number;
  estimateChangePercent: number;
  lastNav: number;
  lastNavDate: string;
}

export interface FundDetail {
  code: string;
  name: string;
  type: string;
  riskLevel: string;
  company: string;
  managerName?: string;
  nav: number;
  accumNav: number;
  navDate: string;
  feeRateBuy: number;
  feeRateSell: number;
  feeRateMgmt: number;
  feeRateCustody?: number;
  scale?: number;
  establishDate?: string;
}

export class EastmoneyService {
  private baseUrl = env.EASTMONEY_API_BASE;

  async searchFunds(query: string, limit: number = 10): Promise<FundSearchResult[]> {
    const cacheKey = `fund:search:${query}:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(query)}&_=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.Datas || [];

      const funds = results.slice(0, limit).map((item: any) => ({
        code: item.CODE,
        name: item.NAME,
        type: item.FundBaseType || 'UNKNOWN',
      }));

      await redis.setex(cacheKey, CACHE_TTL.FUND_SEARCH, JSON.stringify(funds));

      return funds;
    } catch (error) {
      logger.error('Error searching funds from Eastmoney:', error);
      throw new Error('Failed to search funds');
    }
  }

  async getFundEstimate(fundId: string): Promise<FundEstimate | null> {
    const cacheKey = `fund:estimate:${fundId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/FundEstimateNew/FundEstimateDetails?fc=${fundId}&_=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.Data) {
        return null;
      }

      const estimate: FundEstimate = {
        fundId,
        fundName: data.Data.Name,
        estimateNav: parseFloat(data.Data.EstimateNav),
        estimateTime: data.Data.EstimateTime,
        estimateChange: parseFloat(data.Data.EstimateChange),
        estimateChangePercent: parseFloat(data.Data.EstimateChangePercent),
        lastNav: parseFloat(data.Data.LastNav),
        lastNavDate: data.Data.LastNavDate,
      };

      await redis.setex(cacheKey, CACHE_TTL.FUND_ESTIMATE, JSON.stringify(estimate));

      return estimate;
    } catch (error) {
      logger.error(`Error getting fund estimate for ${fundId}:`, error);
      return null;
    }
  }

  async getFundDetail(fundId: string): Promise<FundDetail | null> {
    const cacheKey = `fund:detail:${fundId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/FundDetailNew/FundDetails?fc=${fundId}&_=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.Data) {
        return null;
      }

      const detail: FundDetail = {
        code: fundId,
        name: data.Data.Name,
        type: data.Data.FundType,
        riskLevel: data.Data.RiskLevel,
        company: data.Data.Company,
        managerName: data.Data.ManagerName,
        nav: parseFloat(data.Data.NAV),
        accumNav: parseFloat(data.Data.AccumNAV),
        navDate: data.Data.NAVDate,
        feeRateBuy: parseFloat(data.Data.BuyRate) / 100,
        feeRateSell: parseFloat(data.Data.SellRate) / 100,
        feeRateMgmt: parseFloat(data.Data.ManageRate) / 100,
        feeRateCustody: data.Data.CustodyRate ? parseFloat(data.Data.CustodyRate) / 100 : undefined,
        scale: data.Data.Scale ? parseFloat(data.Data.Scale) : undefined,
        establishDate: data.Data.EstablishDate,
      };

      await redis.setex(cacheKey, CACHE_TTL.FUND_DETAIL, JSON.stringify(detail));

      return detail;
    } catch (error) {
      logger.error(`Error getting fund detail for ${fundId}:`, error);
      return null;
    }
  }

  async getFundNavHistory(fundId: string, timeRange: string): Promise<Array<{ date: string; nav: number; accumNav: number }>> {
    const cacheKey = `fund:history:${fundId}:${timeRange}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/FundNavHistory?fc=${fundId}&range=${timeRange}&_=${Date.now()}`
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const data = await response.json();
      const history = (data.Data || []).map((item: any) => ({
        date: item.Date,
        nav: parseFloat(item.NAV),
        accumNav: parseFloat(item.AccumNAV),
      }));

      await redis.setex(cacheKey, CACHE_TTL.FUND_DETAIL, JSON.stringify(history));

      return history;
    } catch (error) {
      logger.error(`Error getting fund history for ${fundId}:`, error);
      return [];
    }
  }
}

export const eastmoneyService = new EastmoneyService();
