'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook for auto-refreshing data at a specified interval
 * @param callback - Function to call on each interval
 * @param interval - Interval in milliseconds
 * @param enabled - Whether the auto-refresh is enabled
 */
export function useAutoRefresh(
  callback: () => void,
  interval: number,
  enabled: boolean
): void {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = setInterval(() => {
      callbackRef.current()
    }, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [interval, enabled])
}
