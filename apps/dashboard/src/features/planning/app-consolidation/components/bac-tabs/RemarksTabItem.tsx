import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { BACLineItem } from '../../types'

interface RemarksTabItemProps {
  item: BACLineItem
  onUpdate?: (item: Partial<BACLineItem>) => void
  readOnly?: boolean
}

export function RemarksTabItem({
  item,
  onUpdate,
  readOnly,
}: RemarksTabItemProps) {
  const handleUpdateRemarks = (remarks: string) => {
    if (readOnly) return
    onUpdate?.({ ...item, remarks })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Procurement Remarks</CardTitle>
        <p className="text-xs text-gray-600 mt-2">
          Add any relevant remarks, justification, or notes for this procurement item.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <label className="text-sm font-medium block text-gray-700">Remarks</label>
          <Textarea
            value={item.remarks || ''}
            onChange={(e) => handleUpdateRemarks(e.target.value)}
            placeholder="Enter procurement remarks, justification, or notes for this item..."
            disabled={readOnly}
            className="min-h-20"
          />
          {item.remarks && (
            <p className="text-xs text-gray-500 mt-2">
              {item.remarks.length} characters
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
