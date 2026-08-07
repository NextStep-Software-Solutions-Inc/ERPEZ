import { Target } from 'lucide-react'
import type { OPCRActivity } from '../../opcr/table/types'

interface ActivityTargetsDisplayProps {
  activity: OPCRActivity
}

export const ActivityTargetsDisplay = ({ activity }: ActivityTargetsDisplayProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          Performance Targets
        </h4>
      </div>

      {activity.indicator && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Indicator: </span>
            {activity.indicator}
          </p>
        </div>
      )}

      {renderTimelineTargets(activity)}
    </div>
  )
}

function renderTimelineTargets(activity: OPCRActivity) {
  const timelineType = activity.timelineType || 'Quarterly'

  if (timelineType === 'Quarterly' && activity.quarterlyTargets) {
    return (
      <div className="space-y-2">
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-orange-700">Quarterly Performance Targets</span>
          <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded">4 Quarters</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((quarter) => (
            <div key={quarter} className="flex flex-col gap-1">
              <div className="p-3 rounded-lg text-center border border-orange-200 bg-orange-50 text-gray-700 hover:bg-orange-100 cursor-default transition-colors">
                <p className="text-xs font-bold text-orange-700">{quarter}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-orange-600">
                  {activity.quarterlyTargets?.[quarter.toLowerCase() as keyof typeof activity.quarterlyTargets] || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (timelineType === 'Monthly' && activity.monthlyTargets) {
    return (
      <div className="space-y-2">
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">Monthly Performance Targets</span>
          <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-1 rounded">12 Months</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const).map((month) => (
            <div key={month} className="flex flex-col gap-1">
              <div className="p-2 rounded-lg text-center border border-emerald-200 bg-emerald-50 text-gray-700 hover:bg-emerald-100 cursor-default transition-colors">
                <p className="text-xs font-bold text-emerald-700">{month.toUpperCase()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-600">{activity.monthlyTargets?.[month] || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (timelineType === 'Weekly' && activity.weeklyTargets) {
    const weeks = Object.entries(activity.weeklyTargets).slice(0, 14)
    return (
      <div className="space-y-2">
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-purple-700">Weekly Performance Targets</span>
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded">52 Weeks</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.map(([week, value]) => (
            <div key={week} className="flex flex-col gap-1">
              <div className="p-1 rounded-lg text-center border border-purple-200 bg-purple-50 text-gray-700 hover:bg-purple-100 cursor-default transition-colors">
                <p className="text-xs font-bold text-purple-700">{week}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-purple-600">{(value as number) || 0}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 py-1">
          ... and {Object.entries(activity.weeklyTargets).length - 14} more weeks
        </div>
      </div>
    )
  }

  if (timelineType === 'Daily' && activity.dailyTargets) {
    const days = Object.entries(activity.dailyTargets).slice(0, 12)
    return (
      <div className="space-y-2">
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Daily Performance Targets</span>
          <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">365 Days</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {days.map(([day, value]) => (
            <div key={day} className="flex flex-col gap-1">
              <div className="p-2 rounded-lg text-center border border-blue-200 bg-blue-50 text-gray-700 hover:bg-blue-100 cursor-default transition-colors">
                <p className="text-xs font-bold text-blue-700">{day}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-blue-600">{(value as number) || 0}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 py-1">
          ... and {Object.entries(activity.dailyTargets).length - 12} more day periods
        </div>
      </div>
    )
  }

  if (timelineType === 'Annual' && activity.annualTargets) {
    return (
      <div className="space-y-2">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Annual Performance Target</span>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">1 Year</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1">
            <div className="p-3 rounded-lg text-center border border-slate-200 bg-slate-50 text-gray-700 hover:bg-slate-100 cursor-default transition-colors">
              <p className="text-sm font-bold text-slate-700">Annual</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-600">{activity.annualTargets.annual || 0}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <p className="text-sm text-gray-600">No targets available</p>
      <p className="text-xs text-gray-500 mt-1">Activity targets data is missing</p>
    </div>
  )
}
