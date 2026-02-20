'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Loader2, ArrowDown } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

type PullState = 'idle' | 'pulling' | 'release' | 'refreshing'

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 60,
}: PullToRefreshProps) {
  const [pullState, setPullState] = useState<PullState>('idle')
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container) return

    // Only enable pull when at top of container
    if (container.scrollTop > 0) return

    startYRef.current = e.touches[0].clientY
    currentYRef.current = startYRef.current
    setPullState('pulling')
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const container = containerRef.current
      if (!container || pullState === 'refreshing') return

      // Only enable pull when at top of container
      if (container.scrollTop > 0) return

      currentYRef.current = e.touches[0].clientY
      const diff = currentYRef.current - startYRef.current

      if (diff > 0) {
        e.preventDefault()
        // Apply resistance to make it feel natural
        const resistance = 0.5
        const newDistance = Math.min(diff * resistance, threshold * 2)
        setPullDistance(newDistance)

        if (newDistance >= threshold) {
          setPullState('release')
        } else {
          setPullState('pulling')
        }
      }
    },
    [pullState, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (pullState === 'refreshing') return

    if (pullState === 'release' && pullDistance >= threshold) {
      setPullState('refreshing')
      setPullDistance(threshold)

      try {
        await onRefresh()
      } finally {
        setPullState('idle')
        setPullDistance(0)
      }
    } else {
      setPullState('idle')
      setPullDistance(0)
    }
  }, [pullState, pullDistance, threshold, onRefresh])

  const getIndicatorText = () => {
    switch (pullState) {
      case 'pulling':
        return '下拉刷新'
      case 'release':
        return '释放刷新'
      case 'refreshing':
        return '刷新中...'
      default:
        return ''
    }
  }

  const getIndicatorIcon = () => {
    if (pullState === 'refreshing') {
      return <Loader2 className="h-5 w-5 animate-spin text-cta" />
    }
    return (
      <ArrowDown
        className={`h-5 w-5 text-text-muted transition-transform duration-200 ${
          pullState === 'release' ? 'rotate-180' : ''
        }`}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden transition-transform duration-200"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          top: 0,
          transform: `translateY(-${Math.max(pullDistance, 0)}px)`,
        }}
      >
        <div className="flex flex-col items-center gap-1 pt-2">
          {getIndicatorIcon()}
          <span className="text-xs text-text-muted">{getIndicatorText()}</span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
