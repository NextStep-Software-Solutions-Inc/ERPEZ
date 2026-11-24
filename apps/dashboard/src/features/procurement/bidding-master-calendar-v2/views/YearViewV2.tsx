import {
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { useCalendarV2 } from '../contexts/calendar-context'
import { cn } from '@/lib/utils'

export function YearViewV2() {
  const { selectedDate, setSelectedDate, setCurrentView, dayBuckets } = useCalendarV2()

  const yearStart = startOfYear(selectedDate)
  const months = eachMonthOfInterval({
    start: yearStart,
    end: endOfYear(selectedDate),
  })

  const bucketMap = new Map(dayBuckets.map((b) => [b.date, b]))

  const handleSelectMonth = (monthDate: Date) => {
    setSelectedDate(startOfMonth(monthDate))
    setCurrentView('month')
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-background overflow-y-auto p-4 sm:p-6 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {months.map((month) => {
          const mStart = startOfMonth(month)
          const mEnd = endOfMonth(month)
          const calStart = startOfWeek(mStart, { weekStartsOn: 0 })
          const calEnd = endOfWeek(mEnd, { weekStartsOn: 0 })

          const days = eachDayOfInterval({ start: calStart, end: calEnd })

          return (
            <div
              key={month.toISOString()}
              onClick={() => handleSelectMonth(month)}
              className="flex flex-col rounded-2xl border border-border/70 p-4 bg-card/60 hover:bg-card hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {format(month, 'MMMM')}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  View Month →
                </span>
              </div>

              {/* 7 Weekday abbreviations */}
              <div className="grid grid-cols-7 text-center text-[9px] font-bold text-muted-foreground mb-1">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Mini day cells */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {days.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const inMonth = isSameMonth(day, month)
                  const isToday = isSameDay(day, new Date())
                  const bucket = bucketMap.get(dateKey)
                  const hasEvents = (bucket?.events.length ?? 0) > 0
                  const hasConflict = (bucket?.hardConflictCount ?? 0) > 0

                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        'flex h-6 items-center justify-center rounded-md font-medium text-[10px] relative',
                        !inMonth && 'text-muted-foreground/30',
                        inMonth && !hasEvents && 'text-slate-700 dark:text-slate-300',
                        isToday && 'border border-primary font-bold',
                        hasEvents &&
                          'bg-primary/10 text-primary font-bold hover:bg-primary/20',
                        hasConflict && 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      {hasEvents && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
