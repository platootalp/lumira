'use client'

import Link from "next/link"
import { usePositions, usePortfolioStats } from "@/hooks/usePositions"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"
import { fundOperations } from "@/lib/db"
import { useTimeDimension } from "@/hooks/useTimeDimension"
import ProfitCalendar from "@/components/charts/ProfitCalendar"
import { useEffect, useState, useMemo, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  ArrowRight,
  Plus,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Target,
  Calendar,
} from "lucide-react"
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

interface PositionWithNav {
  id: string
  fundCode: string
  fundName: string
  shares: number
  cost: number
  nav: number
  marketValue: number
  profit: number
  profitRate: number
  type?: string
}

// 模拟7天收益数据
const mockDailyReturns = [
  { date: '周一', value: 1250 },
  { date: '周二', value: 1890 },
  { date: '周三', value: 980 },
  { date: '周四', value: -450 },
  { date: '周五', value: 1680 },
  { date: '周六', value: 0 },
  { date: '今天', value: 2100 },
]

const COLORS = ['#1677FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#13C2C2']

export default function DashboardPage() {
  const { positions, isLoading, loadPositions } = usePositions()
  const { stats, isCalculating } = usePortfolioStats(positions)
  const [topPositions, setTopPositions] = useState<PositionWithNav[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [hideAmount, setHideAmount] = useState(false)
  const { dimension, setDimension, timeRange } = useTimeDimension()

  const dailyProfits = useMemo(() => {
    const profits = []
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const profit = (Math.random() - 0.45) * 5000
      profits.push({
        date: date.toISOString().split('T')[0],
        profit,
        profitRate: (profit / (stats.totalCost || 100000)) * 100,
      })
    }
    return profits
  }, [stats.totalCost])

  useEffect(() => {
    let isMounted = true
    const loadTopPositions = async () => {
      const enriched = await Promise.all(
        positions.slice(0, 5).map(async (pos) => {
          const fundInfo = await fundOperations.getFundByCode(pos.fundCode)
          const nav = fundInfo?.nav || pos.costPrice
          const marketValue = pos.shares * nav
          const profit = marketValue - pos.cost
          const profitRate = pos.cost > 0 ? (profit / pos.cost) * 100 : 0

          return {
            ...pos,
            nav,
            marketValue,
            profit,
            profitRate,
            type: fundInfo?.type || '其他',
          }
        })
      )
      if (isMounted) {
        setTopPositions(enriched)
      }
    }

    if (positions.length > 0) {
      loadTopPositions()
    }

    return () => { isMounted = false }
  }, [positions])

  const handleRefresh = useCallback(async () => {
    try {
      await loadPositions()
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }, [loadPositions])

  useAutoRefresh(handleRefresh, 60000, positions.length > 0)

  // 计算资产分布数据
  const assetDistribution = topPositions.reduce((acc, pos) => {
    const type = pos.type || '其他'
    if (!acc[type]) acc[type] = 0
    acc[type] += pos.marketValue
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(assetDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  // 计算昨日收益（模拟）
  const yesterdayProfit = stats.dailyProfit * 0.85

  if (isLoading || isCalculating) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cta" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 总资产卡片 - 蚂蚁财富风格 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] p-6 sm:p-8">
        <div className="relative">
          {/* 顶部信息栏 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-cta" />
              <span className="text-sm text-text-muted">总资产（元）</span>
              <button 
                onClick={() => setHideAmount(!hideAmount)}
                className="text-text-muted hover:text-white"
              >
                {hideAmount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-xs text-text-muted">
              更新于 {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {/* 总资产金额 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              {hideAmount ? '****' : formatCurrency(stats.totalAssets)}
            </h1>
          </div>

          {/* 收益数据网格 */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-1 flex items-center gap-1 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                昨日收益
              </div>
              <div className={`text-lg font-semibold ${yesterdayProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {hideAmount ? '****' : (yesterdayProfit >= 0 ? '+' : '') + formatCurrency(yesterdayProfit).replace('¥', '')}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-1 flex items-center gap-1 text-xs text-text-muted">
                <TrendingUp className="h-3 w-3" />
                持有收益
              </div>
              <div className={`text-lg font-semibold ${stats.totalProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {hideAmount ? '****' : (stats.totalProfit >= 0 ? '+' : '') + formatCurrency(stats.totalProfit).replace('¥', '')}
              </div>
              <div className={`text-xs ${stats.totalProfitRate >= 0 ? 'text-up' : 'text-down'}`}>
                {hideAmount ? '**' : formatPercent(stats.totalProfitRate)}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-1 flex items-center gap-1 text-xs text-text-muted">
                <Target className="h-3 w-3" />
                今日收益
              </div>
              <div className={`text-lg font-semibold ${stats.dailyProfit >= 0 ? 'text-up' : 'text-down'}`}>
                {hideAmount ? '****' : (stats.dailyProfit >= 0 ? '+' : '') + formatCurrency(stats.dailyProfit).replace('¥', '')}
              </div>
              <div className={`text-xs ${stats.dailyProfitRate >= 0 ? 'text-up' : 'text-down'}`}>
                {hideAmount ? '**' : formatPercent(stats.dailyProfitRate)}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-1 flex items-center gap-1 text-xs text-text-muted">
                <PieChart className="h-3 w-3" />
                持仓成本
              </div>
              <div className="text-lg font-semibold text-white">
                {hideAmount ? '****' : formatCurrency(stats.totalCost).replace('¥', '')}
              </div>
              <div className="text-xs text-text-muted">
                {stats.positionCount} 只基金
              </div>
            </div>
          </div>

          {/* 快速操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/import/manual"
              className="flex items-center gap-2 rounded-lg bg-cta px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-cta/90"
            >
              <Plus className="h-4 w-4" />
              买入
            </Link>
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10">
              <TrendingDown className="h-4 w-4" />
              卖出
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10">
              <Clock className="h-4 w-4" />
              定投
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      {positions.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 资产分布饼图 */}
          <div className="rounded-xl border border-white/5 bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">资产分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-text-muted">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 收益走势图 */}
          <div className="rounded-xl border border-white/5 bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">7日收益走势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockDailyReturns}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1677FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1f2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`¥${value}`, '收益']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1677FF" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {positions.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cta" />
              <h3 className="text-lg font-semibold text-white">收益日历</h3>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 p-1">
              {(['day', 'month', 'year'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDimension(d)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    dimension === d
                      ? 'bg-cta text-white'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {d === 'day' ? '日' : d === 'month' ? '月' : '年'}
                </button>
              ))}
            </div>
          </div>
          <ProfitCalendar data={dailyProfits} />
        </div>
      )}

      {/* 持仓列表 */}
      {positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-card py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <PieChart className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">暂无持仓数据</h3>
          <p className="mb-6 text-text-muted">开始添加您的第一笔基金持仓</p>
          <Link
            href="/import"
            className="flex items-center gap-2 rounded-lg bg-cta px-6 py-3 font-semibold text-white transition-all hover:bg-cta/90"
          >
            <Plus className="h-5 w-5" />
            添加持仓
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">持仓基金</h2>
            <Link
              href="/portfolio"
              className="flex items-center gap-1 text-sm text-cta hover:underline"
            >
              查看全部
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {topPositions.map((position) => (
              <Link
                key={position.id}
                href={`/fund/${position.fundCode}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{position.fundName}</div>
                  <div className="text-xs text-text-muted">{position.fundCode}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {hideAmount ? '****' : formatCurrency(position.marketValue)}
                  </div>
                  <div className={`text-xs ${position.profit >= 0 ? 'text-up' : 'text-down'}`}>
                    {hideAmount ? '**' : formatPercent(position.profitRate)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
