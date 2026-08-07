import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { BACWorkspace, BACSchedule } from '../../types'
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface SchedulesTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function SchedulesTab({ workspace, onUpdate, readOnly }: SchedulesTabProps) {
  const getPeriodType = (period: string): 'Monthly' | 'Quarterly' => {
    return MONTHS.includes(period) ? 'Monthly' : 'Quarterly'
  }

  const handleAddSchedule = (lineItemId: string) => {
    if (readOnly) return

    const item = workspace.lineItems.find((li) => li.id === lineItemId)
    if (!item) return

    const newSchedule: BACSchedule = {
      id: `schedule-${Date.now()}`,
      period: 'Q1',
      scheduledDate: '',
      quantity: 0,
    }

    const updated = workspace.lineItems.map((li) =>
      li.id === lineItemId
        ? { ...li, schedules: [...(li.schedules || []), newSchedule] }
        : li,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  const handleRemoveSchedule = (lineItemId: string, scheduleId: string) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((li) =>
      li.id === lineItemId
        ? {
            ...li,
            schedules: li.schedules.filter((s) => s.id !== scheduleId),
          }
        : li,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  const handleScheduleChange = (
    lineItemId: string,
    scheduleId: string,
    field: string,
    value: unknown,
  ) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((li) =>
      li.id === lineItemId
        ? {
            ...li,
            schedules: li.schedules.map((s) =>
              s.id === scheduleId ? { ...s, [field]: value } : s,
            ),
          }
        : li,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  const handlePeriodTypeChange = (
    lineItemId: string,
    scheduleId: string,
    newType: 'Monthly' | 'Quarterly',
  ) => {
    if (readOnly) return

    // Set default value based on new type
    const defaultValue = newType === 'Monthly' ? 'January' : 'Q1'
    handleScheduleChange(lineItemId, scheduleId, 'period', defaultValue)
  }

  const renderPeriodSelector = (
    schedule: BACSchedule,
    lineItemId: string,
    scheduleId: string,
  ) => {
    const currentType = getPeriodType(schedule.period)
    const isMonthly = currentType === 'Monthly'

    return (
      <div className="space-y-4">
        {/* Period Type Selector */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Timeline Type
          </label>
          <div className="flex gap-2">
            <Button
              variant={isMonthly ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                handlePeriodTypeChange(lineItemId, scheduleId, 'Monthly')
              }
              disabled={readOnly}
              className="flex-1"
            >
              Monthly
            </Button>
            <Button
              variant={!isMonthly ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                handlePeriodTypeChange(lineItemId, scheduleId, 'Quarterly')
              }
              disabled={readOnly}
              className="flex-1"
            >
              Quarterly
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">
            Select {isMonthly ? 'Month' : 'Quarter'}
          </label>
          {isMonthly ? (
            // Monthly Options
            <div className="grid grid-cols-6 gap-1.5">
              {MONTHS.map((month) => (
                <Button
                  key={month}
                  variant={
                    schedule.period === month ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    handleScheduleChange(
                      lineItemId,
                      scheduleId,
                      'period',
                      month,
                    )
                  }
                  disabled={readOnly}
                  className="text-xs h-8 p-0 text-center"
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>
          ) : (
            // Quarterly Options
            <div className="grid grid-cols-4 gap-2">
              {QUARTERS.map((quarter) => (
                <Button
                  key={quarter}
                  variant={
                    schedule.period === quarter ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    handleScheduleChange(
                      lineItemId,
                      scheduleId,
                      'period',
                      quarter,
                    )
                  }
                  disabled={readOnly}
                  className="h-9 font-semibold"
                >
                  {quarter}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-y-auto scrollbar-hide">
      {workspace.lineItems.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">{item.description}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddSchedule(item.id)}
                disabled={readOnly}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.schedules?.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  {/* Period Selector */}
                  {renderPeriodSelector(schedule, item.id, schedule.id)}

                  {/* Quantity Input */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={schedule.quantity}
                        onChange={(e) =>
                          handleScheduleChange(
                            item.id,
                            schedule.id,
                            'quantity',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="Enter quantity"
                        disabled={readOnly}
                        className="w-full"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSchedule(item.id, schedule.id)}
                      disabled={readOnly}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
