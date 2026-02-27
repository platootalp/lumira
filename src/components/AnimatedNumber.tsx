'use client';

import { useEffect, useRef } from 'react';
import {
  useSpring,
  useTransform,
  useReducedMotion,
  motion,
  type SpringOptions,
} from 'framer-motion';
import { formatNumber } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string | undefined;
}

const springConfig: SpringOptions = {
  stiffness: 50,
  damping: 20,
};

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  duration = 1.2,
  className,
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const previousValue = useRef(value);

  const spring = useSpring(previousValue.current, {
    ...springConfig,
    duration: duration * 1000,
  });

  const displayValue = useTransform(spring, (latest) => {
    return `${prefix}${formatNumber(latest, decimals)}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
    previousValue.current = value;
  }, [value, spring]);

  // If user prefers reduced motion, show static value
  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {prefix}{formatNumber(value, decimals)}{suffix}
      </span>
    );
  }

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}

interface AnimatedCurrencyProps {
  value: number;
  currency?: string;
  decimals?: number;
  className?: string | undefined;
}

export function AnimatedCurrency({
  value,
  currency = '¥',
  decimals = 2,
  className,
}: AnimatedCurrencyProps) {
  const prefix = value >= 0 ? currency : `-${currency}`;
  const absValue = Math.abs(value);

  return (
    <AnimatedNumber
      value={absValue}
      prefix={prefix}
      decimals={decimals}
      className={className}
    />
  );
}

interface AnimatedPercentProps {
  value: number;
  decimals?: number;
  className?: string | undefined;
}

export function AnimatedPercent({
  value,
  decimals = 2,
  className,
}: AnimatedPercentProps) {
  const prefix = value >= 0 ? '+' : '';

  return (
    <AnimatedNumber
      value={value}
      prefix={prefix}
      suffix="%"
      decimals={decimals}
      className={className}
    />
  );
}
