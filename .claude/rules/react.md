# React Rules

基金投资助手项目的 React 组件规范。

## Component Structure
```typescript
// ✅ Good - 按功能分组
import React, { useState, useCallback } from 'react';
import { useFundData } from '@/hooks/useFundData';
import { Card, Button } from '@/components/ui';
import type { FundHolding } from '@/types';

interface FundCardProps {
  holding: FundHolding;
  onDelete?: (id: string) => void;
  className?: string;
}

export const FundCard: React.FC<FundCardProps> = React.memo(({
  holding,
  onDelete,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { estimate, isLoading } = useFundData(holding.fundId);
  
  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  return (
    <Card className={cn("p-4", className)}>
      {/* ... */}
    </Card>
  );
});

FundCard.displayName = 'FundCard';
```

## Hooks Rules
```typescript
// ✅ Good
function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchHoldings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHoldings();
      setHoldings(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);
  
  return { holdings, isLoading, error, refetch: fetchHoldings };
}

// ✅ Good - 自定义 Hook 返回 tuple
function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}
```

## Performance Optimization
```typescript
// ✅ Good - useMemo for expensive calculations
const profitData = useMemo(() => {
  return holdings.map(h => ({
    ...h,
    profit: calculateProfit(h),
    profitRate: calculateProfitRate(h)
  }));
}, [holdings]);

// ✅ Good - useCallback for event handlers
const handleDelete = useCallback((id: string) => {
  deleteHolding(id);
}, [deleteHolding]);

// ✅ Good - React.memo for list items
const FundListItem = React.memo(({ fund, onSelect }: FundListItemProps) => {
  return <div onClick={() => onSelect(fund.id)}>{fund.name}</div>;
});

// ❌ Bad - inline objects/functions in JSX
<div style={{ color: 'red' }} onClick={() => handleClick()} /> // 每次渲染都创建新引用
```

## State Management
```typescript
// ✅ Good - Zustand for global state
import { create } from 'zustand';

interface PortfolioState {
  holdings: Holding[];
  addHolding: (holding: Holding) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Holding>) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  addHolding: (holding) => set((state) => ({
    holdings: [...state.holdings, holding]
  })),
  removeHolding: (id) => set((state) => ({
    holdings: state.holdings.filter(h => h.id !== id)
  })),
  updateHolding: (id, updates) => set((state) => ({
    holdings: state.holdings.map(h =>
      h.id === id ? { ...h, ...updates } : h
    )
  }))
}));

// ✅ Good - React Query for server state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useFundEstimate(fundCode: string) {
  return useQuery({
    queryKey: ['fund', 'estimate', fundCode],
    queryFn: () => fetchFundEstimate(fundCode),
    refetchInterval: 30000, // 30秒刷新
    staleTime: 10000
  });
}
```

## Styling with Tailwind
```typescript
// ✅ Good - use cn() utility
import { cn } from '@/lib/utils';

function Card({ className, children, variant = 'default' }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      variant === 'default' && "bg-white border-gray-200",
      variant === 'danger' && "bg-red-50 border-red-200",
      className
    )}>
      {children}
    </div>
  );
}

// ✅ Good - responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {holdings.map(h => <FundCard key={h.id} holding={h} />)}
</div>
```

## Accessibility
```typescript
// ✅ Good - proper ARIA attributes
<button
  onClick={onDelete}
  aria-label={`删除 ${fundName} 持仓`}
  className="text-red-500 hover:text-red-700"
>
  <TrashIcon />
</button>

// ✅ Good - keyboard navigation
<div role="tablist">
  {tabs.map(tab => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      onClick={() => setActiveTab(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>
```
