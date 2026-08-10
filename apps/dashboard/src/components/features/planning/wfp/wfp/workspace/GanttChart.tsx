import { useState, useMemo } from 'react'
import type { WFPResponse, GanttActivity } from '@/features/planning/types'
import { formatDisplayDate } from '@/utils/formatters'
import { transformWFPDataToGanttGroups, GanttObjectiveGroup } from '@/features/planning/utils/transformWFPToGanttGrouped'

interface GanttChartProps {
  activities?: GanttActivity[]
  wfpData?: WFPResponse
  mode: 'opcr' | 'external'
  projectStartDate?: string
  projectEndDate?: string
}

export default function GanttChart(props: GanttChartProps) {
  const { mode, projectStartDate, projectEndDate } = props
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Transform raw WFP data to grouped objectives/activities/timelines
  const groupedObjectives = useMemo<GanttObjectiveGroup[]>(() => {
    if (props.wfpData && props.wfpData.wfpObjectives) {
      return transformWFPDataToGanttGroups({
        wfpObjectives: props.wfpData.wfpObjectives.map(obj => ({
          id: obj.id,
          description: obj.description || '',
          wfpObjectiveTargets: (obj.wfpObjectiveTargets || []).map(target => ({
            id: target.id,
            activityName: target.activityName || '',
            wfpObjectiveTimelines: (target.wfpObjectiveTimelines || []).map(tl => ({
              id: tl.id,
              timelineType: tl.timelineType || '',
              startDate: tl.startDate,
              endDate: tl.endDate,
              targetValue: tl.targetValue
            })),
            wfpObjectiveTargetExpenditures: target.wfpObjectiveTargetExpenditures?.map(exp => ({
              unitCost: exp.unitCost
            })) || []
          }))
        }))
      })
    }
    // fallback: treat activities as a single objective
    if (props.activities) {
      return [{
        id: 'default',
        name: 'Activities',
        activities: props.activities.map(a => {
          // Synthesize default timeline from activity.start/end if timelines is empty
          const timelines = (a.timelines && a.timelines.length > 0) 
            ? a.timelines 
            : (a.start && a.end ? [{
                id: `${a.id}-default-timeline`,
                timelineType: 'Default',
                startDate: a.start,
                endDate: a.end,
                targetValue: 0
              }] : [])
          
          return {
            id: a.id,
            name: a.name,
            timelines,
            budget: a.budget
          }
        })
      }]
    }
    return []
  }, [props.wfpData, props.activities])

  // Flatten all timelines for date calculations and rendering
  const allTimelines = useMemo(() => {
    return groupedObjectives.flatMap(obj =>
      obj.activities.flatMap(act =>
        act.timelines.map(tl => ({
          ...tl,
          activityId: act.id,
          activityName: act.name,
          objectiveId: obj.id,
          objectiveName: obj.name
        }))
      )
    )
  }, [groupedObjectives])

  // Use project dates for timeline headers, fallback to timeline dates if not provided
  let timelineMinDate: Date
  let timelineMaxDate: Date

  if (projectStartDate && projectEndDate) {
    timelineMinDate = new Date(projectStartDate)
    timelineMaxDate = new Date(projectEndDate)
  } else {
    // Fallback to all timeline dates if project dates not provided
    if (allTimelines.length > 0) {
      timelineMinDate = new Date(allTimelines[0].startDate)
      timelineMaxDate = new Date(allTimelines[0].endDate)
      allTimelines.forEach((tl) => {
        const start = new Date(tl.startDate)
        const end = new Date(tl.endDate)
        if (start < timelineMinDate) timelineMinDate = start
        if (end > timelineMaxDate) timelineMaxDate = end
      })
    } else {
      timelineMinDate = new Date()
      timelineMaxDate = new Date()
    }
  }

  // For OPCR mode, clamp to fiscal year boundaries
  if (mode === 'opcr') {
    const year = timelineMinDate.getFullYear()
    timelineMinDate = new Date(year, 0, 1) // January 1st
    timelineMaxDate = new Date(year, 11, 31) // December 31st
  }

  // Generate months between timeline min and max dates
  const months: Date[] = []
  const current = new Date(timelineMinDate.getFullYear(), timelineMinDate.getMonth(), 1)
  const end = new Date(timelineMaxDate.getFullYear(), timelineMaxDate.getMonth(), 1)

  while (current <= end) {
    months.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }

  // Calculate total days for display based on timeline
  const totalDays = Math.ceil((timelineMaxDate.getTime() - timelineMinDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Activity colors (cycling through a palette)
  const activityColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ]

  const getActivityColor = (index: number) => activityColors[index % activityColors.length]

  // Calculate position and width for a timeline bar using percentages
  // Accepts either timeline row or timeline object
  const getTimelinePosition = (row: { startDate: string, endDate: string }) => {
    const start = new Date(row.startDate)
    const end = new Date(row.endDate)
    const startDays = (start.getTime() - timelineMinDate.getTime()) / (1000 * 60 * 60 * 24)
    const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const startPercent = Math.max(0, (startDays / totalDays) * 100)
    const widthPercent = Math.max(1, (duration / totalDays) * 100) // Minimum 1% width

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    }
  }

  // Find hovered timeline info from allTimelines
  const hoveredData = allTimelines.find(tl => `${tl.activityId}-${tl.id}` === hoveredId)

  // Handle mouse movement to track position for tooltip
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm" onMouseMove={handleMouseMove}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">
          WFP Timeline ({mode === 'opcr' ? 'OPCR' : 'External'} Mode)
        </h3>
        <p className="text-sm text-gray-600">
          {groupedObjectives.length} objectives • {groupedObjectives.reduce((sum, obj) => sum + obj.activities.length, 0)} activities • {allTimelines.length} timeline(s) • {months.length} months • {Math.round(totalDays)} days total
        </p>
      </div>

      {/* Gantt Chart Grid */}
      <div className="overflow-auto max-h-96">
        {allTimelines.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <p className="text-sm font-medium">No timeline data available</p>
              <p className="text-xs mt-1">Objectives/activities must have timelines to display</p>
            </div>
          </div>
        ) : (
        <div className="flex">
          {/* Left Sidebar - Objective > Activity > Timeline */}
          <div className="w-96 border-r bg-gray-50 flex-shrink-0">
            <div className="sticky top-0 bg-gray-100 border-b px-4 py-2 font-medium text-sm text-gray-700 flex items-center justify-center" style={{ height: '40px' }}>
              Objectives, Activities & Timelines
            </div>
            <div>
              {groupedObjectives.map((objective) => (
                <div key={objective.id} className="border-b border-gray-200">
                  <div className="px-4 py-2 font-bold text-base text-gray-800 bg-gray-100">{objective.name}</div>
                  {objective.activities.map((activity, actIdx) => (
                    <div key={activity.id} className="pl-4 border-b border-gray-100">
                      <div className="py-2 font-medium text-sm text-gray-900 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${getActivityColor(actIdx)} flex-shrink-0`} />
                        {activity.name}
                      </div>
                      {activity.timelines.map((tl) => (
                        <div
                          key={tl.id}
                          className="pl-8 py-1 text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
                          onMouseEnter={() => setHoveredId(`${activity.id}-${tl.id}`)}
                          onMouseLeave={() => setHoveredId(null)}
                          style={{ minHeight: '28px' }}
                        >
                          <span className="font-semibold text-gray-600">{tl.timelineType}</span>
                          <span>{formatDisplayDate(tl.startDate)} - {formatDisplayDate(tl.endDate)}</span>
                          {tl.targetValue > 0 && <span className="text-gray-400">({tl.targetValue}%)</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Area */}
          <div className="flex-1 min-w-0 relative border-l border-r border-gray-300">
            {/* Month Headers - Dynamic width using flexbox */}
            <div className="flex border-b bg-gray-100 sticky top-0 z-10 bottom-2">
              {months.map((month, index) => {
                const currentYear = month.getFullYear()
                const prevYear = index > 0 ? months[index - 1].getFullYear() : currentYear
                // Show abbreviated month, and year only when it changes
                const monthText = month.toLocaleDateString('en-US', { month: 'short' })
                const yearText = currentYear !== prevYear ? ` ${currentYear}` : ''
                const displayText = `${monthText}${yearText}`
                return (
                  <div
                    key={index}
                    className="flex-1 px-1 py-2 text-center text-xs font-medium text-gray-700 border-r border-gray-300 last:border-r-0 flex items-center justify-center min-w-0"
                    style={{ height: '39px' }}
                  >
                    <div className="truncate">
                      {displayText}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Timeline Bars - stacked by objective/activity/timeline */}
            <div className="relative divide-y divide-gray-100">
              {groupedObjectives.map((objective) => (
                <div key={objective.id}>
                  {/* Objective Header Row Spacer */}
                  <div
                    className="relative border-b border-gray-300 bg-gray-100"
                    style={{ height: '36px' }}
                  >
                    {/* Empty spacer to match sidebar objective header */}
                  </div>
                  
                  {objective.activities.map((activity, actIdx) => (
                    <div key={activity.id}>
                      {/* Activity Header Row Spacer */}
                      <div
                        className="relative border-b border-gray-200"
                        style={{ height: '36px' }}
                      >
                        {/* Empty spacer to match sidebar activity header */}
                      </div>
                      
                      {/* Timeline Rows */}
                      {activity.timelines.map((tl) => {
                        const position = getTimelinePosition({
                          startDate: tl.startDate,
                          endDate: tl.endDate
                        })
                        return (
                          <div
                            key={tl.id}
                            className="relative flex items-center"
                            style={{ height: '28px' }}
                          >
                            <div
                              className={`absolute top-1 h-6 rounded-md shadow-sm border-2 border-white cursor-pointer transition-all hover:shadow-md ${getActivityColor(actIdx)}`}
                              style={{
                                left: position.left,
                                width: position.width,
                                minWidth: '20px',
                                opacity: hoveredId === `${activity.id}-${tl.id}` ? 1 : 0.9,
                              }}
                              onMouseEnter={() => setHoveredId(`${activity.id}-${tl.id}`)}
                              onMouseLeave={() => setHoveredId(null)}
                            >
                              <div className="px-2 py-1 text-xs font-medium text-white truncate">
                                {tl.timelineType}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredData && (
        <div
          className="fixed z-50 bg-black text-white text-xs rounded-md px-3 py-2 shadow-lg pointer-events-none max-w-xs"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            transform: mousePosition.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="font-semibold mb-1">{hoveredData.objectiveName} / {hoveredData.activityName}</div>
          <div className="space-y-1">
            <div>Timeline: {hoveredData.timelineType}</div>
            <div>Duration: {formatDisplayDate(hoveredData.startDate)} - {formatDisplayDate(hoveredData.endDate)}</div>
            {hoveredData.targetValue > 0 && <div>Target: {hoveredData.targetValue}%</div>}
          </div>
        </div>
      )}
    </div>
  )
}
