/**
 * Gantt Chart Shared Types
 * Used by both the GanttChart component and data transformation utilities
 * Centralizes these types to avoid circular dependencies between UI and business logic
 */

/**
 * Single timeline segment within an activity
 * Represents a quarterly/monthly/weekly planning period
 */
export interface TimelineItem {
  id: string
  timelineType: string
  startDate: string
  endDate: string
  targetValue: number
}

/**
 * Activity displayed on the Gantt chart
 * Can originate from WFP or legacy formats
 */
export interface GanttActivity {
  id: string
  name: string
  budget: number
  start: string
  end: string
  q1: number
  q2: number
  q3: number
  q4: number
  timelines?: TimelineItem[]
}
