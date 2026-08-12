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
import type { BACWorkspace } from '../../types'
import { BACItemHeader } from './BACItemHeader'
import api from '@/services/api'

const toInputDateFormat = (val?: string | null): string => {
  if (!val) return ''
  const trimmed = val.trim()
  if (!trimmed) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0]
  }
  if (/^\d{2}\/\d{4}$/.test(trimmed)) {
    const [m, y] = trimmed.split('/')
    return `${y}-${m.padStart(2, '0')}-01`
  }
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`
  }
  try {
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }
  } catch {
    // ignore
  }
  return ''
}

const toDisplayMonthYear = (val?: string | null): string => {
  const dateStr = toInputDateFormat(val)
  if (!dateStr) return '—'
  const [y, m] = dateStr.split('-')
  return `${m}/${y}`
}

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

  const handleItemUpdate = (lineItemId: string, updates: Partial<any>) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId ? { ...item, ...updates } : item,
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
          <div className="space-y-6">
            {workspace.lineItems.map((item) => {
              const options = [...mopOptions]
              if (item.modeOfProcurement && !options.includes(item.modeOfProcurement)) {
                options.push(item.modeOfProcurement)
              }
              const formatCurrency = (amount?: number | null) => {
                if (amount === undefined || amount === null) return '₱0.00'
                return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount)
              }
              return (
                <div key={item.id} className="space-y-4 border-l-4 border-l-orange-500 pl-4 pb-4 border-b last:border-b-0">
                  <BACItemHeader item={item} badgeColor="orange" />
                  
                  {/* Grid of Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                    
                    {/* Mode of Procurement */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Mode of Procurement:</label>
                      <Select
                        value={item.modeOfProcurement || ''}
                        onValueChange={(value) => handleItemUpdate(item.id, { modeOfProcurement: value })}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-full bg-white text-xs">
                          <SelectValue placeholder="Select MoP..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {options.map((mop) => (
                            <SelectItem key={mop} value={mop} className="text-xs">
                              {mop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ABC / Budget Override */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">
                          Approved Budget for the Contract (ABC):
                        </label>
                        {(item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (readOnly) return
                              handleItemUpdate(item.id, { estimatedBudgetOverride: null })
                            }}
                            className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-semibold cursor-pointer"
                          >
                            Clear Override
                          </button>
                        )}
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={`Default: ${item.originalPPMPBudget || item.totalAmount}`}
                        value={item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined ? item.estimatedBudgetOverride : (item.originalPPMPBudget || item.totalAmount || '')}
                        onChange={(e) => {
                          if (readOnly) return
                          const val = e.target.value === '' ? null : parseFloat(e.target.value)
                          handleItemUpdate(item.id, { estimatedBudgetOverride: val })
                        }}
                        disabled={readOnly}
                        className={`w-full text-xs font-medium ${(item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined) ? 'border-amber-400 bg-amber-50/20 text-amber-900' : 'border-slate-200 text-slate-700 bg-white'}`}
                      />
                      <p className="text-[10px]">
                        {item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined ? (
                          <span className="text-amber-700 font-semibold">
                            ★ APP Override (Display: {formatCurrency(item.estimatedBudgetOverride)})
                          </span>
                        ) : (
                          <span className="text-slate-400">Inherited from PPMP ({formatCurrency(item.originalPPMPBudget || item.totalAmount)})</span>
                        )}
                      </p>
                    </div>

                    {/* Start of Procurement Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">Start of Procurement:</label>
                        {!!item.startOfProcurementOverride && (
                          <button
                            type="button"
                            onClick={() => {
                              if (readOnly) return
                              handleItemUpdate(item.id, { startOfProcurementOverride: '' })
                            }}
                            className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-semibold cursor-pointer"
                          >
                            Clear Override
                          </button>
                        )}
                      </div>
                      <Input
                        type="date"
                        value={item.startOfProcurementOverride ? toInputDateFormat(item.startOfProcurementOverride) : toInputDateFormat(item.effectiveStartOfProcurement)}
                        onChange={(e) => {
                          if (readOnly) return
                          handleItemUpdate(item.id, { startOfProcurementOverride: e.target.value })
                        }}
                        disabled={readOnly}
                        className={`w-full text-xs font-medium bg-white ${item.startOfProcurementOverride ? 'border-amber-400 bg-amber-50/10 text-amber-950' : 'border-slate-200 text-slate-700'}`}
                      />
                      <p className="text-[10px]">
                        {item.startOfProcurementOverride ? (
                          <span className="text-amber-700 font-semibold">
                            ★ APP Override ({toDisplayMonthYear(item.startOfProcurementOverride)})
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Inherited: {toDisplayMonthYear(item.effectiveStartOfProcurement)}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* End of Procurement Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">End of Procurement:</label>
                        {!!item.endOfProcurementOverride && (
                          <button
                            type="button"
                            onClick={() => {
                              if (readOnly) return
                              handleItemUpdate(item.id, { endOfProcurementOverride: '' })
                            }}
                            className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-semibold cursor-pointer"
                          >
                            Clear Override
                          </button>
                        )}
                      </div>
                      <Input
                        type="date"
                        value={item.endOfProcurementOverride ? toInputDateFormat(item.endOfProcurementOverride) : toInputDateFormat(item.effectiveEndOfProcurement)}
                        onChange={(e) => {
                          if (readOnly) return
                          handleItemUpdate(item.id, { endOfProcurementOverride: e.target.value })
                        }}
                        disabled={readOnly}
                        className={`w-full text-xs font-medium bg-white ${item.endOfProcurementOverride ? 'border-amber-400 bg-amber-50/10 text-amber-950' : 'border-slate-200 text-slate-700'}`}
                      />
                      <p className="text-[10px]">
                        {item.endOfProcurementOverride ? (
                          <span className="text-amber-700 font-semibold">
                            ★ APP Override ({toDisplayMonthYear(item.endOfProcurementOverride)})
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Inherited: {toDisplayMonthYear(item.effectiveEndOfProcurement)}
                          </span>
                        )}
                      </p>
                    </div>

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
