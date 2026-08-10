/**
 * Generic Template Card List Component
 * Provides a responsive grid layout with toolbar support for card-based data displays.
 * Designed to be reusable across different features with flexible rendering.
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageAnimations } from '@/utils/animation'
import { cn } from '@/lib/utils'

interface TemplateCardListDashtailProps<T> {
  data: T[]
  renderCard: (item: T) => React.ReactNode
  toolbar?: React.ReactNode
  isLoading?: boolean
  gridColumns?: number
  gap?: number
  emptyState?: React.ReactNode
  className?: string
  containerVariants?: any
}

export function TemplateCardListDashtail<T extends { id: string | number }>({
  data,
  renderCard,
  toolbar,
  isLoading = false,
  gridColumns = 3,
  gap = 6,
  emptyState,
  className,
  containerVariants = pageAnimations.containerStagger,
}: TemplateCardListDashtailProps<T>) {
  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {toolbar && <div className="w-full">{toolbar}</div>}

      {data.length === 0 && !isLoading ? (
        emptyState || (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-muted-foreground font-medium">
              No results found matching your criteria.
            </p>
          </div>
        )
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            layout
            className={cn(
              'grid auto-rows-fr',
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', // Default breakdown
              gridColumns === 4 && 'lg:grid-cols-4',
              gridColumns === 2 && 'lg:grid-cols-2',
              gridColumns === 1 && 'lg:grid-cols-1',
              `gap-${gap}`,
            )}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {data.map((item) => (
              <React.Fragment key={item.id}>{renderCard(item)}</React.Fragment>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
