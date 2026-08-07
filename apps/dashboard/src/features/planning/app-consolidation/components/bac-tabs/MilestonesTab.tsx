import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BACWorkspace } from '../../types'
import { HybridScheduleInput } from './HybridScheduleInput'
import { BACItemHeader } from './BACItemHeader'
import { ScheduleInputHints } from './ScheduleInputHints'
import api from '@/services/api'
import { Loader2 } from 'lucide-react'

interface MilestonesTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

/**
 * MilestonesTab Component
 * Manages procurement schedule milestones with hybrid inputs:
 * - Advertisement/Posting of IB/REI
 * - Submission/Opening of Bids
 * - Notice of Award
 * - Contract Signing
 *
 * Supports date pickers, free text, and predefined values (N/A, As needed, etc.)
 */
export function MilestonesTab({ workspace, onUpdate, readOnly }: MilestonesTabProps) {
  const [activityTypes, setActivityTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/procurement-activity-types', {
      params: {
        page: 1,
        pageSize: 100,
        filters: 'isActive==true',
      },
    })
      .then((res) => {
        const types = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        setActivityTypes(types)
      })
      .catch((err) => {
        console.error('Failed to load procurement activity types:', err)
        setActivityTypes([
          { id: '1', name: 'Advertisement/Posting of IB/REI' },
          { id: '2', name: 'Submission/Opening of Bids' },
          { id: '3', name: 'Notice of Award' },
          { id: '4', name: 'Contract Signing' },
        ])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Helper function to convert ScheduleValueType to string
  const toScheduleString = (value: any): string => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (value instanceof Date) return value.toISOString().split('T')[0]
    return String(value)
  }

  const getValue = (item: any, activityTypeName: string) => {
    if (item.milestones && (item.milestones as any)[activityTypeName] !== undefined) {
      return toScheduleString((item.milestones as any)[activityTypeName])
    }
    const sch = item.schedules?.find((s: any) => s.period === activityTypeName)
    if (sch) {
      return toScheduleString(sch.scheduledDate)
    }
    
    // Legacy fallback mapping - Exact matches to prevent clashing
    if (activityTypeName === 'Advertisement/Posting of IB/REI') {
      return toScheduleString(item.milestones?.advertisementDate)
    }
    if (activityTypeName === 'Submission/Opening of Bids') {
      return toScheduleString(item.milestones?.submissionDate)
    }
    if (activityTypeName === 'Notice of Award') {
      return toScheduleString(item.milestones?.noticeOfAwardDate)
    }
    if (activityTypeName === 'Contract Signing') {
      return toScheduleString(item.milestones?.contractSigningDate)
    }

    return ''
  }

  const handleMilestoneChange = (
    lineItemId: string,
    activityTypeName: string,
    value: string,
  ) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) => {
      if (item.id === lineItemId) {
        const milestones = item.milestones || {
          advertisementDate: '',
          submissionDate: '',
          noticeOfAwardDate: '',
          contractSigningDate: '',
        }
        const updatedMilestones = { ...milestones, [activityTypeName]: value }

        // Legacy exact match compatibility updates
        if (activityTypeName === 'Advertisement/Posting of IB/REI') {
          updatedMilestones.advertisementDate = value
        } else if (activityTypeName === 'Submission/Opening of Bids') {
          updatedMilestones.submissionDate = value
        } else if (activityTypeName === 'Notice of Award') {
          updatedMilestones.noticeOfAwardDate = value
        } else if (activityTypeName === 'Contract Signing') {
          updatedMilestones.contractSigningDate = value
        }

        // Keep schedules array in sync
        let updatedSchedules = [...(item.schedules || [])]
        const existingIndex = updatedSchedules.findIndex((s) => s.period === activityTypeName)
        if (existingIndex > -1) {
          updatedSchedules[existingIndex] = {
            ...updatedSchedules[existingIndex],
            scheduledDate: value,
          }
        } else {
          updatedSchedules.push({
            id: `schedule-${Date.now()}-${activityTypeName}`,
            period: activityTypeName,
            scheduledDate: value,
            quantity: item.quantity,
          })
        }

        return {
          ...item,
          milestones: updatedMilestones,
          schedules: updatedSchedules,
        }
      }
      return item
    })

    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Procurement Schedule Milestones</CardTitle>
          <p className="text-xs text-gray-600 mt-2">
            Define the key procurement milestones for each line item. Use dates (MM/YYYY), predefined
            options, or custom text.
          </p>
        </CardHeader>
        <CardContent className="overflow-y-auto scrollbar-hide">
          <ScheduleInputHints />

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="text-sm text-gray-500 font-medium">Loading activity types...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {workspace.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="pb-8 border-b last:border-b-0 last:pb-0 border-l-4 border-l-purple-600 pl-4"
                >
                  <BACItemHeader item={item} badgeColor="purple" />

                  {/* Milestone Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {activityTypes.map((type) => {
                      let emoji = '📅'
                      const name = type.name.toUpperCase()
                      if (name.includes('ADVERTISEMENT') || name.includes('POSTING')) emoji = '📢'
                      else if (name.includes('SUBMISSION') || name.includes('OPENING')) emoji = '📋'
                      else if (name.includes('AWARD')) emoji = '🏆'
                      else if (name.includes('SIGNING') || name.includes('CONTRACT')) emoji = '✍️'
                      else if (name.includes('EVALUATION')) emoji = '🔍'
                      else if (name.includes('QUALIFICATION')) emoji = '⚖️'
                      else if (name.includes('CONFERENCE')) emoji = '🤝'

                      return (
                        <HybridScheduleInput
                          key={type.id || type.name}
                          value={getValue(item, type.name)}
                          onChange={(value) => handleMilestoneChange(item.id, type.name, value)}
                          milestoneLabel={`${emoji} ${type.name}`}
                          placeholder={`Enter date or notes for ${type.name}`}
                          disabled={readOnly}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
