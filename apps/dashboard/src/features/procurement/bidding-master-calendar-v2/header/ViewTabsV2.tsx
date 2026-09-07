import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarRange,
  List,
  Columns,
  Grid3X3,
  Grid2X2,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useCalendarV2 } from '../contexts/calendar-context'
import type { CalendarViewMode } from '../types'

interface TabItem {
  name: string
  value: CalendarViewMode
  icon: React.ComponentType<{ className?: string }>
}

const TABS: TabItem[] = [
  {
    name: 'Month',
    value: 'month',
    icon: Grid3X3,
  },
  {
    name: 'Week',
    value: 'week',
    icon: Columns,
  },
  {
    name: 'Day',
    value: 'day',
    icon: List,
  },
  {
    name: 'Agenda',
    value: 'agenda',
    icon: CalendarRange,
  },
  {
    name: 'Year',
    value: 'year',
    icon: Grid2X2,
  },
]

export const ViewTabsV2 = memo(function ViewTabsV2() {
  const { currentView, setCurrentView } = useCalendarV2()

  return (
    <Tabs
      value={currentView}
      onValueChange={(val) => setCurrentView(val as CalendarViewMode)}
      className="w-auto"
    >
      <TabsList className="h-9 gap-1 rounded-xl p-1 bg-muted/60 border border-border/60">
        {TABS.map(({ icon: Icon, name, value }) => {
          const isActive = currentView === value

          return (
            <motion.div
              key={value}
              layout
              className={cn(
                'flex h-7 items-center justify-center overflow-hidden rounded-lg transition-all',
                isActive ? 'flex-1 shadow-xs bg-background' : 'flex-none hover:bg-muted',
              )}
              initial={false}
              animate={{
                width: isActive ? 96 : 32,
              }}
              transition={{
                type: 'spring',
                stiffness: 2000,
                damping: 30,
              }}
            >
              <TabsTrigger
                value={value}
                asChild
                className="h-full w-full border-0 shadow-none px-2 py-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <div className="flex h-full w-full items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold select-none">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-foreground" />
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        className="truncate text-foreground font-medium"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </TabsTrigger>
            </motion.div>
          )
        })}
      </TabsList>
    </Tabs>
  )
})
