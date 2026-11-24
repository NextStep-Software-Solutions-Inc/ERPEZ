import { useMemo } from 'react'
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCalendarV2 } from '../contexts/calendar-context'

export function DateNavigatorV2() {
  const { selectedDate, setSelectedDate, currentView, filteredEvents } = useCalendarV2()

  const handlePrevious = () => {
    switch (currentView) {
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1))
        break
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1))
        break
      case 'day':
        setSelectedDate(subDays(selectedDate, 1))
        break
      case 'agenda':
        setSelectedDate(subMonths(selectedDate, 1))
        break
      case 'year':
        setSelectedDate(subYears(selectedDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (currentView) {
      case 'month':
        setSelectedDate(addMonths(selectedDate, 1))
        break
      case 'week':
        setSelectedDate(addWeeks(selectedDate, 1))
        break
      case 'day':
        setSelectedDate(addDays(selectedDate, 1))
        break
      case 'agenda':
        setSelectedDate(addMonths(selectedDate, 1))
        break
      case 'year':
        setSelectedDate(addYears(selectedDate, 1))
        break
    }
  }

  const mainTitle = useMemo(() => {
    if (currentView === 'year') {
      return format(selectedDate, 'yyyy')
    }
    if (currentView === 'day') {
      return format(selectedDate, 'MMMM d, yyyy')
    }
    return format(selectedDate, 'MMMM yyyy')
  }, [selectedDate, currentView])

  const subRangeText = useMemo(() => {
    if (currentView === 'month' || currentView === 'agenda') {
      const s = startOfMonth(selectedDate)
      const e = endOfMonth(selectedDate)
      return `${format(s, 'MMM d')} - ${format(e, 'MMM d, yyyy')}`
    }
    if (currentView === 'week') {
      const s = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const e = endOfWeek(selectedDate, { weekStartsOn: 0 })
      return `${format(s, 'MMM d')} - ${format(e, 'MMM d, yyyy')}`
    }
    if (currentView === 'day') {
      return format(selectedDate, 'EEEE')
    }
    return `Full Calendar Year ${format(selectedDate, 'yyyy')}`
  }, [selectedDate, currentView])

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.h2
            key={mainTitle}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="text-base font-bold text-foreground sm:text-lg tracking-tight"
          >
            {mainTitle}
          </motion.h2>
        </AnimatePresence>

        <Badge
          variant="secondary"
          className="px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border border-border/60"
        >
          {filteredEvents.length} activities
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-muted"
          onClick={handlePrevious}
          aria-label="Previous period"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="font-medium text-slate-600 dark:text-slate-400 select-none px-0.5 min-w-32">
          {subRangeText}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-muted"
          onClick={handleNext}
          aria-label="Next period"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
