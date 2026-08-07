import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { BACLineItem } from '../../types'

interface EPATabItemProps {
  item: BACLineItem
  onUpdate?: (item: Partial<BACLineItem>) => void
  readOnly?: boolean
}

export function EPATabItem({
  item,
  onUpdate,
  readOnly,
}: EPATabItemProps) {
  const handleToggleEPA = (eligible: boolean) => {
    if (readOnly) return
    onUpdate?.({ ...item, eligibleForEPA: eligible })
  }

  const handleUpdateEPARemarks = (epaRemarks: string) => {
    if (readOnly) return
    onUpdate?.({ ...item, epaRemarks })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">EPA (Environmental & Social Safeguards) Management</CardTitle>
        <p className="text-xs text-gray-600 mt-2">
          Mark this item as EPA-eligible if it requires environmental and social safeguards assessment.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* EPA Eligibility Toggle */}
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
              id={`epa-${item.id}`}
              checked={item.eligibleForEPA || false}
              onCheckedChange={(checked) => handleToggleEPA(checked as boolean)}
              disabled={readOnly}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={`epa-${item.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                Mark as Eligible for EPA
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Check this box if this item requires environmental and social safeguards assessment
              </p>
            </div>
          </div>

          {/* EPA Remarks */}
          {item.eligibleForEPA && (
            <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
              <Label htmlFor={`remarks-${item.id}`} className="text-sm font-medium text-green-900">
                EPA Notes & Remarks
              </Label>
              <Textarea
                id={`remarks-${item.id}`}
                value={item.epaRemarks || ''}
                onChange={(e) => handleUpdateEPARemarks(e.target.value)}
                placeholder="Enter any EPA-related remarks, considerations, or requirements for this item..."
                disabled={readOnly}
                className="min-h-20 bg-white"
              />
              {item.epaRemarks && (
                <p className="text-xs text-gray-500 mt-2">
                  {item.epaRemarks.length} characters
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
