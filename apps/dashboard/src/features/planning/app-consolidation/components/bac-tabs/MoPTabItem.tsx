import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

        if (item.modeOfProcurement && !names.includes(item.modeOfProcurement)) {
          names.push(item.modeOfProcurement)
        }

        setOptions(names)
      })
      .catch((err) => {
        console.error('Failed to load procurement modes:', err)
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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₱0.00'
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Read-Only Source Reference Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Source PPMP Reference (Read-Only)
            </CardTitle>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[10px]">
              Immutable PPMP Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Description:</span>
            <span className="font-medium text-slate-900 line-clamp-1">{item.description || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Quantity & Unit:</span>
            <span className="font-medium text-slate-900">{item.quantity} {item.unit}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Unit Cost:</span>
            <span className="font-medium text-slate-900">{formatCurrency(item.unitCost)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Original PPMP Budget:</span>
            <span className="font-medium text-slate-900">{formatCurrency(item.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable APP Procurement Details Card */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold text-slate-800">
            APP Procurement & Budget Configuration
          </CardTitle>
          <p className="text-xs text-slate-500">
            Configure APP-specific procurement mode, ABC override, and start/end dates.
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode of Procurement */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Procurement Method:</label>
              <Select
                value={item.modeOfProcurement || ''}
                onValueChange={handleMoPChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full relative z-50">
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

            {/* ABC / Estimated Budget Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Approved Budget for the Contract (ABC):
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={`Default: ${item.totalAmount}`}
                value={item.estimatedBudgetOverride !== undefined && item.estimatedBudgetOverride !== null ? item.estimatedBudgetOverride : ''}
                onChange={(e) => {
                  if (readOnly) return
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                  onUpdate?.({ ...item, estimatedBudgetOverride: val })
                }}
                disabled={readOnly}
                className="w-full text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Leave blank to use original PPMP budget ({formatCurrency(item.totalAmount)}).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Start of Procurement */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Start of Procurement (Date/Month):</label>
              <Input
                type="text"
                placeholder="e.g. 01/2026 or 2026-01-15"
                value={item.startOfProcurementOverride || ''}
                onChange={(e) => {
                  if (readOnly) return
                  onUpdate?.({ ...item, startOfProcurementOverride: e.target.value })
                }}
                disabled={readOnly}
                className="w-full text-xs"
              />
            </div>

            {/* End of Procurement */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">End of Procurement (Date/Month):</label>
              <Input
                type="text"
                placeholder="e.g. 03/2026 or 2026-03-31"
                value={item.endOfProcurementOverride || ''}
                onChange={(e) => {
                  if (readOnly) return
                  onUpdate?.({ ...item, endOfProcurementOverride: e.target.value })
                }}
                disabled={readOnly}
                className="w-full text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
