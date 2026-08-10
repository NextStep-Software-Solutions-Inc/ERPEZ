import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BACWorkspace } from '../../types'
import { BACItemHeader } from './BACItemHeader'
import api from '@/services/api'

const MOP_OPTIONS = [
  'Direct Contracting',
  'Procurement by Canvassing',
  'Competitive Bidding',
  'Repeat Order',
  'Lease',
]

interface MoPTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function MoPTab({ workspace, onUpdate, readOnly }: MoPTabProps) {
  console.log('📋 MoPTab rendering with lineItems count:', workspace.lineItems?.length || 0)
  const [mopOptions, setMopOptions] = useState<string[]>([])

  useEffect(() => {
    api.get('/procurement-modes', { params: { PageNumber: 1, PageSize: 1000 } })
      .then((res) => {
        const modes = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        const names = modes
          .filter((m: any) => m.isActive && !m.isArchived)
          .map((m: any) => m.name)
        setMopOptions(names)
      })
      .catch((err) => {
        console.error('Failed to load procurement modes:', err)
        setMopOptions(MOP_OPTIONS)
      })
  }, [])

  const handleMoPChange = (lineItemId: string, mop: string) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId ? { ...item, modeOfProcurement: mop } : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mode of Procurement</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            {workspace.lineItems.map((item) => {
              const options = [...mopOptions]
              if (item.modeOfProcurement && !options.includes(item.modeOfProcurement)) {
                options.push(item.modeOfProcurement)
              }
              return (
                <div key={item.id} className="space-y-3 border-l-4 border-l-orange-500 pl-4">
                  <BACItemHeader item={item} badgeColor="orange" />
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <label className="text-sm font-medium text-gray-700">Mode of Procurement:</label>
                    <Select
                      value={item.modeOfProcurement || ''}
                      onValueChange={(value) => handleMoPChange(item.id, value)}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select MoP..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {options.map((mop) => (
                          <SelectItem key={mop} value={mop}>
                            {mop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
