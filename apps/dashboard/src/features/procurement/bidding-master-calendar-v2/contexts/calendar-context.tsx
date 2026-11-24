import {
  createContext,
  useContext,
  useState,
  useMemo,
  useDeferredValue,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CalendarViewMode,
  ColorTaxonomyMode,
  CascadeCalculationResult,
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarConflictGroup,
} from '../types'
import { useBiddingMasterCalendarData } from '../../bidding-master-calendar/hooks'
import { DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS } from '../../bidding-master-calendar/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface CalendarContextV2Type {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  currentView: CalendarViewMode
  setCurrentView: (view: CalendarViewMode) => void
  colorMode: ColorTaxonomyMode
  setColorMode: (mode: ColorTaxonomyMode) => void
  use24HourFormat: boolean
  toggleTimeFormat: () => void

  filters: BiddingMasterCalendarFilters
  setFilters: Dispatch<SetStateAction<BiddingMasterCalendarFilters>>
  resetFilters: () => void

  events: BiddingMasterCalendarEvent[]
  filteredEvents: BiddingMasterCalendarEvent[]
  dayBuckets: BiddingMasterCalendarDayBucket[]
  conflictGroups: BiddingMasterCalendarConflictGroup[]
  isLoading: boolean
  options: {
    resolutionOptions: Array<{ id: string; number: string; title: string }>
    milestoneOptions: Array<{ value: string; label: string }>
    officeOptions: string[]
    fiscalYearOptions: string[]
  }

  // Modals
  selectedEventForModal: BiddingMasterCalendarEvent | null
  openEventModal: (event: BiddingMasterCalendarEvent) => void
  closeEventModal: () => void

  dayEventsModalData: { date: Date; events: BiddingMasterCalendarEvent[] } | null
  openDayEventsModal: (date: Date, events: BiddingMasterCalendarEvent[]) => void
  closeDayEventsModal: () => void

  cascadeModalData: CascadeCalculationResult | null
  openCascadeModal: (result: CascadeCalculationResult) => void
  closeCascadeModal: () => void

  // Drawer integration
  activeDrawerEvent: BiddingMasterCalendarEvent | null
  isDrawerOpen: boolean
  openDrawer: (event: BiddingMasterCalendarEvent) => void
  closeDrawer: () => void
}

const CalendarContextV2 = createContext<CalendarContextV2Type | null>(null)

export function CalendarProviderV2({
  children,
  initialResolutionId,
}: {
  children: ReactNode
  initialResolutionId?: string
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useLocalStorage<CalendarViewMode>(
    'erpez.calendar.v2.view',
    'month',
  )
  const [colorMode, setColorMode] = useLocalStorage<ColorTaxonomyMode>(
    'erpez.calendar.v2.color-mode',
    'project',
  )
  const [use24HourFormat, setUse24HourFormat] = useLocalStorage<boolean>(
    'erpez.calendar.v2.24h',
    false,
  )

  const [filters, setFilters] = useState<BiddingMasterCalendarFilters>({
    ...DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
    bacResolutionId: initialResolutionId ?? null,
  })

  const deferredFilters = useDeferredValue(filters)
  const calendarData = useBiddingMasterCalendarData(deferredFilters)

  // Modals state
  const [selectedEventForModal, setSelectedEventForModal] =
    useState<BiddingMasterCalendarEvent | null>(null)
  const [dayEventsModalData, setDayEventsModalData] = useState<{
    date: Date
    events: BiddingMasterCalendarEvent[]
  } | null>(null)
  const [cascadeModalData, setCascadeModalData] =
    useState<CascadeCalculationResult | null>(null)

  // Drawer state
  const [activeDrawerEvent, setActiveDrawerEvent] =
    useState<BiddingMasterCalendarEvent | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleTimeFormat = () => setUse24HourFormat((prev) => !prev)

  const resetFilters = () => {
    setFilters(DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS)
  }

  const openEventModal = (event: BiddingMasterCalendarEvent) => {
    setSelectedEventForModal(event)
  }

  const closeEventModal = () => {
    setSelectedEventForModal(null)
  }

  const openDayEventsModal = (date: Date, events: BiddingMasterCalendarEvent[]) => {
    setDayEventsModalData({ date, events })
  }

  const closeDayEventsModal = () => {
    setDayEventsModalData(null)
  }

  const openCascadeModal = (result: CascadeCalculationResult) => {
    setCascadeModalData(result)
  }

  const closeCascadeModal = () => {
    setCascadeModalData(null)
  }

  const openDrawer = (event: BiddingMasterCalendarEvent) => {
    setActiveDrawerEvent(event)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
  }

  const conflictGroups = useMemo(() => {
    return calendarData.agendaGroups.flatMap((g) => g.bucket.hardConflictGroups)
  }, [calendarData.agendaGroups])

  const value: CalendarContextV2Type = {
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    colorMode,
    setColorMode,
    use24HourFormat,
    toggleTimeFormat,

    filters,
    setFilters,
    resetFilters,

    events: calendarData.events,
    filteredEvents: calendarData.filteredEvents,
    dayBuckets: calendarData.dayBuckets,
    conflictGroups,
    isLoading: calendarData.isLoading,
    options: calendarData.options,

    selectedEventForModal,
    openEventModal,
    closeEventModal,

    dayEventsModalData,
    openDayEventsModal,
    closeDayEventsModal,

    cascadeModalData,
    openCascadeModal,
    closeCascadeModal,

    activeDrawerEvent,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  }

  return (
    <CalendarContextV2.Provider value={value}>
      {children}
    </CalendarContextV2.Provider>
  )
}

export function useCalendarV2(): CalendarContextV2Type {
  const context = useContext(CalendarContextV2)
  if (!context) {
    throw new Error('useCalendarV2 must be used within a CalendarProviderV2')
  }
  return context
}
