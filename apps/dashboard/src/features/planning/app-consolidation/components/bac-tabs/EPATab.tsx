import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { BACWorkspace } from '../../types'
import { BACItemHeader } from './BACItemHeader'

interface EPATabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function EPATab({ workspace, onUpdate, readOnly }: EPATabProps) {
  const handleToggleEPA = (lineItemId: string, eligible: boolean) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId ? { ...item, eligibleForEPA: eligible } : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  const handleUpdateEPARemarks = (lineItemId: string, epaRemarks: string) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId ? { ...item, epaRemarks } : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">EPA (Environmental & Social Safeguards) Management</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            {workspace.lineItems.map((item) => (
              <div key={item.id} className="pb-6 border-b last:border-b-0 border-l-4 border-l-green-600 pl-4">
                <BACItemHeader item={item} badgeColor="green" />

                {/* EPA Eligibility Toggle */}
                <div className="flex items-start gap-3 mb-4 mt-4">
                  <Checkbox
                    id={`epa-${item.id}`}
                    checked={item.eligibleForEPA || false}
                    onCheckedChange={(checked) => handleToggleEPA(item.id, checked as boolean)}
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
                <div className="space-y-2">
                  <Label htmlFor={`remarks-${item.id}`} className="text-sm font-medium">
                    EPA Notes & Remarks
                  </Label>
                  <Textarea
                    id={`remarks-${item.id}`}
                    value={item.epaRemarks || ''}
                    onChange={(e) =>
                      handleUpdateEPARemarks(item.id, e.target.value)
                    }
                    placeholder="Enter any EPA-related remarks, considerations, or requirements for this item..."
                    disabled={readOnly}
                    className="min-h-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
