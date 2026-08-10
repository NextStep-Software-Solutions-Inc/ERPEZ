import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { BACWorkspace } from '../../types'
import { BACItemHeader } from './BACItemHeader'

interface RemarksTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function RemarksTab({ workspace, onUpdate, readOnly }: RemarksTabProps) {
  const handleUpdateRemarks = (lineItemId: string, remarks: string) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId ? { ...item, remarks } : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Procurement Remarks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            {workspace.lineItems.map((item) => (
              <div key={item.id} className="space-y-3 border-l-4 border-l-blue-600 pl-4">
                <BACItemHeader item={item} badgeColor="blue" />
                <label className="text-sm font-medium block text-gray-700">Remarks</label>
                <Textarea
                  value={item.remarks || ''}
                  onChange={(e) =>
                    handleUpdateRemarks(item.id, e.target.value)
                  }
                  placeholder="Enter procurement remarks, justification, or notes for this item..."
                  disabled={readOnly}
                  className="min-h-20"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
