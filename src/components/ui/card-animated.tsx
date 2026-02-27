"use client";

import { motion, type Transition, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem, cardHover } from "@/lib/animations";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover={hover ? (cardHover.hover as TargetAndTransition) : undefined}
      transition={delay ? ({ delay: delay / 1000 } as Transition) : undefined}
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
