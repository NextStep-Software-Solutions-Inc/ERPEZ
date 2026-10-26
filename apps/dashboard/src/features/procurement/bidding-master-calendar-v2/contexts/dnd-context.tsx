import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { format, differenceInCalendarDays, addDays, parseISO } from 'date-fns'
import type { BiddingMasterCalendarEvent, CascadeCalculationResult } from '../types'
import { useCalendarV2 } from './calendar-context'

interface DndContextV2Type {
  draggedEvent: BiddingMasterCalendarEvent | null
  isDragging: boolean
  startDrag: (event: BiddingMasterCalendarEvent) => void
  endDrag: () => void
  handleEventDrop: (targetDate: Date, hour?: number, minute?: number) => void
}

const DndContextV2 = createContext<DndContextV2Type | null>(null)

export function DndProviderV2({ children }: { children: ReactNode }) {
  const { events, openCascadeModal } = useCalendarV2()
  const [draggedEvent, setDraggedEvent] = useState<BiddingMasterCalendarEvent | null>(null)

  const isDragging = Boolean(draggedEvent)

  const startDrag = useCallback((event: BiddingMasterCalendarEvent) => {
    setDraggedEvent(event)
  }, [])

  const endDrag = useCallback(() => {
    setDraggedEvent(null)
  }, [])

  const handleEventDrop = useCallback(
    (targetDate: Date, _hour?: number, _minute?: number) => {
      if (!draggedEvent) return

      const origDateStr = draggedEvent.startDate || draggedEvent.eventDate
      const origDate = parseISO(origDateStr.split('T')[0])
      const newDateStr = format(targetDate, 'yyyy-MM-dd')

      const dayDelta = differenceInCalendarDays(targetDate, origDate)

      if (dayDelta === 0) {
        endDrag()
        return
      }

      // Find all milestones belonging to this BAC Resolution
      const projectEvents = events
        .filter((e) => e.bacResolutionId === draggedEvent.bacResolutionId)
        .sort((a, b) => (a.startDate || a.eventDate).localeCompare(b.startDate || b.eventDate))

      // Downstream milestones are ones ordered after the dragged milestone or with later dates
      const draggedIndex = projectEvents.findIndex((e) => e.id === draggedEvent.id)
      const downstreamEvents =
        draggedIndex >= 0
          ? projectEvents.slice(draggedIndex + 1)
          : projectEvents.filter(
              (e) =>
                (e.startDate || e.eventDate) > (draggedEvent.startDate || draggedEvent.eventDate),
            )

      const affectedMilestones = downstreamEvents.map((m) => {
        const mOriginalStr = m.startDate || m.eventDate
        const mOriginal = parseISO(mOriginalStr.split('T')[0])
        const mNewDate = addDays(mOriginal, dayDelta)

        return {
          milestoneId: m.milestoneId || m.id,
          milestoneKey: m.milestoneKey,
          milestoneName: m.milestoneName,
          originalDate: mOriginalStr,
          computedNewDate: format(mNewDate, 'yyyy-MM-dd'),
        }
      })

      const cascadeResult: CascadeCalculationResult = {
        draggedEvent,
        originalDate: origDateStr,
        newDate: newDateStr,
        dateDeltaDays: dayDelta,
        affectedMilestones,
      }

      openCascadeModal(cascadeResult)
      endDrag()
    },
    [draggedEvent, events, openCascadeModal, endDrag],
  )

  const value = useMemo(
    () => ({
      draggedEvent,
      isDragging,
      startDrag,
      endDrag,
      handleEventDrop,
    }),
    [draggedEvent, isDragging, startDrag, endDrag, handleEventDrop],
  )

  return <DndContextV2.Provider value={value}>{children}</DndContextV2.Provider>
}

export function useDndV2(): DndContextV2Type {
  const context = useContext(DndContextV2)
  if (!context) {
    throw new Error('useDndV2 must be used within a DndProviderV2')
  }
  return context
}
