/**
 * 投资组合状态管理 (Zustand)
 * 
 * Skills: portfolio-analysis
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Holding, PortfolioAnalysis } from '@/types';
import { holdingDb } from '@/lib/db';

interface PortfolioState {
  // 状态
  holdings: Holding[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // 分析结果
  analysis: PortfolioAnalysis | null;
  
  // 操作方法
  fetchHoldings: () => Promise<void>;
  addHolding: (holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>;
  removeHolding: (id: string) => Promise<void>;
  updateHolding: (id: string, changes: Partial<Holding>) => Promise<void>;
  refresh: () => Promise<void>;
  
  // 分析
  setAnalysis: (analysis: PortfolioAnalysis) => void;
  clearAnalysis: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // 初始状态
      holdings: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      analysis: null,
      
      // 获取持仓列表
      fetchHoldings: async () => {
        set({ isLoading: true, error: null });
        try {
          const holdings = await holdingDb.getAll();
          set({ 
            holdings, 
            isLoading: false, 
            lastUpdated: new Date() 
          });
        } catch (error) {
          set({ 
            error: error as Error, 
            isLoading: false 
          });
        }
      },
      
      // 添加持仓
      addHolding: async (holding) => {
        const id = await holdingDb.create(holding);
        await get().fetchHoldings();
        return id;
      },
      
      // 删除持仓
      removeHolding: async (id) => {
        await holdingDb.delete(id);
        await get().fetchHoldings();
      },
      
      // 更新持仓
      updateHolding: async (id, changes) => {
        await holdingDb.update(id, changes);
        await get().fetchHoldings();
      },
      
      // 刷新
      refresh: async () => {
        await get().fetchHoldings();
      },
      
      // 设置分析结果
      setAnalysis: (analysis) => set({ analysis }),
      
      // 清除分析
      clearAnalysis: () => set({ analysis: null })
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        // 只持久化以下字段
        analysis: state.analysis
      })
    }
  )
);

// 选择器
export const selectTotalAssets = (state: PortfolioState) => 
  state.analysis?.summary.totalAssets ?? 0;

export const selectTotalProfit = (state: PortfolioState) =>
  state.analysis?.summary.totalProfit ?? 0;

export const selectTodayProfit = (state: PortfolioState) =>
  state.analysis?.summary.todayProfit ?? 0;

export const selectHoldingCount = (state: PortfolioState) =>
  state.holdings.length;
