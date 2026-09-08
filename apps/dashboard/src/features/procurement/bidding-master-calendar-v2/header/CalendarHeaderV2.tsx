import { format } from 'date-fns'
import {
  Printer,
  Settings,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCalendarV2 } from '../contexts/calendar-context'
import { DateNavigatorV2 } from './DateNavigatorV2'
import { ViewTabsV2 } from './ViewTabsV2'
import { CalendarFiltersPopoverV2 } from './CalendarFiltersPopoverV2'
import type { ColorTaxonomyMode } from '../types'

export function CalendarHeaderV2() {
  const {
    setSelectedDate,
    filters,
    setFilters,
    colorMode,
    setColorMode,
    use24HourFormat,
    toggleTimeFormat,
    conflictGroups,
    options,
  } = useCalendarV2()

  const today = new Date()
  const currentMonthAbbr = format(today, 'MMM').toUpperCase()
  const currentDayNumber = format(today, 'd')

  const handleGoToday = () => {
    setSelectedDate(new Date())
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-3 border-b bg-card/50 backdrop-blur-xs px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs select-none">
      {/* Left side: Today button + Date Navigator */}
      <div className="flex items-center gap-3">
        {/* Tear-off style Today button */}
        <Button
          variant="outline"
          onClick={handleGoToday}
          className="flex h-11 w-11 flex-col items-center justify-center p-0 rounded-xl border-border/80 shadow-2xs hover:border-primary/50 transition-all cursor-pointer group"
          title="Jump to Today"
        >
          <span className="w-full bg-primary/90 text-[9px] font-black text-primary-foreground py-0.5 rounded-t-[10px] text-center tracking-wider">
            {currentMonthAbbr}
          </span>
          <span className="text-sm font-extrabold text-foreground py-0.5 group-hover:scale-110 transition-transform">
            {currentDayNumber}
          </span>
        </Button>

        {/* Date Navigator */}
        <DateNavigatorV2 />
      </div>

      {/* Center / Right controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Hard Conflicts warning chip */}
        {conflictGroups.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>{conflictGroups.length} Committee Conflict{conflictGroups.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Quick BAC Resolution Filter / Combobox */}
        <div className="w-48 sm:w-56">
          <Select
            value={filters.bacResolutionId ?? 'all'}
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                bacResolutionId: val === 'all' ? null : val,
              }))
            }
          >
            <SelectTrigger className="h-9 text-xs rounded-lg border-border/60 bg-background">
              <SelectValue placeholder="All Active Procurements" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all" className="text-xs font-semibold">
                All Active Procurements
              </SelectItem>
              {options.resolutionOptions.map((res) => (
                <SelectItem key={res.id} value={res.id} className="text-xs">
                  <span className="font-semibold text-foreground">{res.number}</span>
                  <span className="text-muted-foreground ml-1.5 truncate max-w-44 block">
                    {res.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Popover */}
        <CalendarFiltersPopoverV2 />

        {/* View Tabs */}
        <ViewTabsV2 />

        {/* Print Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrint}
          className="h-9 w-9 rounded-lg border-border/60 hover:bg-muted"
          title="Print Calendar View"
        >
          <Printer className="h-4 w-4 text-foreground" />
        </Button>

        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border/60 hover:bg-muted"
              title="Calendar Settings"
            >
              <Settings className="h-4 w-4 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">
              Color Taxonomy
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={colorMode}
              onValueChange={(val) => setColorMode(val as ColorTaxonomyMode)}
            >
              <DropdownMenuRadioItem value="project" className="text-xs font-medium cursor-pointer">
                By BAC Project / Resolution
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="category" className="text-xs font-medium cursor-pointer">
                By Procurement Category
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status" className="text-xs font-medium cursor-pointer">
                By Milestone Urgency / Status
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">
              Time Format
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={toggleTimeFormat}
              className="text-xs font-medium justify-between cursor-pointer"
            >
              <span>24-Hour Military Format</span>
              {use24HourFormat && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
