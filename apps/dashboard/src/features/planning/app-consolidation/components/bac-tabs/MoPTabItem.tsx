import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BACLineItem } from '../../types'
import api from '@/services/api'

const MOP_OPTIONS = [
  'Direct Contracting',
  'Procurement by Canvassing',
  'Competitive Bidding',
  'Repeat Order',
  'Lease',
]

interface MoPTabItemProps {
  item: BACLineItem
  onUpdate?: (item: Partial<BACLineItem>) => void
  readOnly?: boolean
}

export function MoPTabItem({ item, onUpdate, readOnly }: MoPTabItemProps) {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    api.get('/procurement-modes', { params: { PageNumber: 1, PageSize: 1000 } })
      .then((res) => {
        const modes = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        const names = modes
          .filter((m: any) => m.isActive && !m.isArchived)
          .map((m: any) => m.name)

        // Ensure the current selection is in the list
        if (item.modeOfProcurement && !names.includes(item.modeOfProcurement)) {
          names.push(item.modeOfProcurement)
        }

        setOptions(names)
      })
      .catch((err) => {
        console.error('Failed to load procurement modes:', err)
        // Fallback options
        const fallback = [...MOP_OPTIONS]
        if (item.modeOfProcurement && !fallback.includes(item.modeOfProcurement)) {
          fallback.push(item.modeOfProcurement)
        }
        setOptions(fallback)
      })
  }, [item.modeOfProcurement])

  const handleMoPChange = (mop: string) => {
    if (readOnly) return
    onUpdate?.({ ...item, modeOfProcurement: mop })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mode of Procurement</CardTitle>
        <p className="text-xs text-gray-600 mt-2">
          Select the procurement method for this line item.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <label className="text-sm font-medium text-gray-700">Procurement Method:</label>
          <Select
            value={item.modeOfProcurement || ''}
            onValueChange={handleMoPChange}
            disabled={readOnly}
          >
            <SelectTrigger className="w-56 relative z-50">
              <SelectValue placeholder="Select MoP..." />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" sideOffset={8} className="z-[99999] max-h-[200px] overflow-y-auto">
              {options.map((mop) => (
                <SelectItem key={mop} value={mop}>
                  {mop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
