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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RotateCcw, Sparkles, FileText, Calendar } from 'lucide-react'
import type { BACLineItem } from '../../types'
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
    <div className="space-y-5">
      {/* Read-Only Source Reference Card */}
      <Card className="bg-slate-50/70 border-slate-200/90 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-slate-200/60 bg-slate-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Source PPMP Reference (Read-Only)
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 text-[11px] font-medium">
              Immutable PPMP Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3.5">
          {/* Key PPMP Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Quantity & Unit</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{item.quantity} {item.unit}</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Unit Cost</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{formatCurrency(item.unitCost)}</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Original PPMP Budget</span>
              <span className="text-sm font-bold text-blue-700 mt-0.5 block">{formatCurrency(item.originalPPMPBudget || item.totalAmount)}</span>
            </div>
          </div>

          {/* Full Original Item Name */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Source Item Name</span>
            <p className="text-sm font-medium text-slate-900 mt-1 leading-relaxed break-words">
              {item.name || item.description || '—'}
            </p>
          </div>

          {/* Full Original Description */}
          {item.itemDescription && (
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">Source PPMP Description / Scope</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                {item.itemDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable APP Procurement Details Card */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">
                APP Procurement & Details Configuration
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the APP project title, description, procurement method, ABC, and procurement timeline.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
          {/* Section 1: Titles & Descriptions */}
          <div className="space-y-4">
            {/* Project Title / Item Name (Column 1) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Project Title / Item Name:
                  </label>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 py-0">
                    Column 1 on APP
                  </Badge>
                </div>
                {Boolean(item.itemNameOverride) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (readOnly) return
                      onUpdate?.({ ...item, itemNameOverride: '' })
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </div>
              <Input
                type="text"
                placeholder={`Default: ${item.description || 'Project Title'}`}
                value={item.itemNameOverride !== undefined && item.itemNameOverride !== null && item.itemNameOverride !== '' ? item.itemNameOverride : (item.description || '')}
                onChange={(e) => {
                  if (readOnly) return
                  onUpdate?.({ ...item, itemNameOverride: e.target.value })
                }}
                disabled={readOnly}
                className={`w-full text-xs font-medium transition-colors ${item.itemNameOverride ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus-visible:ring-amber-400' : 'border-slate-200 text-slate-800'}`}
              />
              <p className="text-[11px]">
                {item.itemNameOverride ? (
                  <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                    ★ APP Override Active — this title replaces the PPMP item name in the APP table and reports
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Inherited from PPMP: <span className="font-medium text-slate-700">{item.description || '—'}</span>
                  </span>
                )}
              </p>
            </div>

            {/* General Description (Column 3) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    General Description of the Project:
                  </label>
                  <Badge variant="secondary" className="text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 py-0">
                    Column 3 on APP
                  </Badge>
                </div>
                {Boolean(item.generalDescription) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (readOnly) return
                      onUpdate?.({ ...item, generalDescription: '' })
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </div>
              {(() => {
                const descVal = item.generalDescription !== undefined && item.generalDescription !== null && item.generalDescription !== '' ? item.generalDescription : (item.itemDescription || '')
                const dynamicRows = Math.min(10, Math.max(4, Math.ceil((descVal.length || 0) / 75)))

                return (
                  <>
                    <Textarea
                      rows={dynamicRows}
                      placeholder={`Default: ${item.itemDescription || item.description || 'General Description'}`}
                      value={descVal}
                      onChange={(e) => {
                        if (readOnly) return
                        onUpdate?.({ ...item, generalDescription: e.target.value })
                      }}
                      disabled={readOnly}
                      className={`w-full rounded-md border px-3 py-2.5 text-xs font-medium min-h-[100px] resize-y leading-relaxed transition-colors ${item.generalDescription ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus-visible:ring-amber-400' : 'border-slate-200 text-slate-800'}`}
                    />
                    <p className="text-[11px]">
                      {item.generalDescription ? (
                        <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                          ★ APP Override Active — this custom description will be used in the APP and generated document
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Inherited from PPMP: <span className="font-medium text-slate-700">{item.itemDescription || item.description || '—'}</span>
                        </span>
                      )}
                    </p>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Section 2: Method & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            {/* Mode of Procurement */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Procurement Method (MoP):</label>
              <Select
                value={item.modeOfProcurement || ''}
                onValueChange={handleMoPChange}
                disabled={readOnly}
              >
                <SelectTrigger className="w-full relative z-50 text-xs font-medium bg-white">
                  <SelectValue placeholder="Select Procurement Method..." />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" sideOffset={8} className="z-[99999] max-h-[220px] overflow-y-auto">
                  {options.map((mop) => (
                    <SelectItem key={mop} value={mop} className="text-xs">
                      {mop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500">
                Method under RA 9184 / NGPA rules
              </p>
            </div>

            {/* ABC / Estimated Budget Override */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Approved Budget for the Contract (ABC):
                </label>
                {(item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (readOnly) return
                      onUpdate?.({ ...item, estimatedBudgetOverride: null })
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
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
                  onUpdate?.({ ...item, estimatedBudgetOverride: val })
                }}
                disabled={readOnly}
                className={`w-full text-xs font-medium transition-colors ${(item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined) ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus-visible:ring-amber-400' : 'border-slate-200 text-slate-800'}`}
              />
              <p className="text-[11px]">
                {(item.estimatedBudgetOverride !== null && item.estimatedBudgetOverride !== undefined) ? (
                  <span className="text-amber-700 font-medium">
                    ★ APP Override Active (Display: {formatCurrency(item.estimatedBudgetOverride)})
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Inherited PPMP Amount: <span className="font-medium text-slate-700">{formatCurrency(item.originalPPMPBudget || item.totalAmount)}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Section 3: Schedule Start & End */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
            {/* Start of Procurement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <label className="text-xs font-semibold text-slate-700">Start of Procurement:</label>
                </div>
                {!!item.startOfProcurementOverride && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (readOnly) return
                      onUpdate?.({ ...item, startOfProcurementOverride: '' })
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </div>
              <Input
                type="date"
                value={item.startOfProcurementOverride ? toInputDateFormat(item.startOfProcurementOverride) : toInputDateFormat(item.effectiveStartOfProcurement)}
                onChange={(e) => {
                  if (readOnly) return
                  onUpdate?.({ ...item, startOfProcurementOverride: e.target.value })
                }}
                disabled={readOnly}
                className={`w-full text-xs font-medium transition-colors ${item.startOfProcurementOverride ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus-visible:ring-amber-400' : 'border-slate-200 text-slate-800'}`}
              />
              <p className="text-[11px]">
                {item.startOfProcurementOverride ? (
                  <span className="text-amber-700 font-medium">
                    ★ APP Override (Display in APP: {toDisplayMonthYear(item.startOfProcurementOverride)})
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Inherited: <span className="font-medium text-slate-700">{toDisplayMonthYear(item.effectiveStartOfProcurement)}</span>
                  </span>
                )}
              </p>
            </div>

            {/* End of Procurement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <label className="text-xs font-semibold text-slate-700">End of Procurement:</label>
                </div>
                {!!item.endOfProcurementOverride && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (readOnly) return
                      onUpdate?.({ ...item, endOfProcurementOverride: '' })
                    }}
                    className="h-6 px-2 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Default
                  </Button>
                )}
              </div>
              <Input
                type="date"
                value={item.endOfProcurementOverride ? toInputDateFormat(item.endOfProcurementOverride) : toInputDateFormat(item.effectiveEndOfProcurement)}
                onChange={(e) => {
                  if (readOnly) return
                  onUpdate?.({ ...item, endOfProcurementOverride: e.target.value })
                }}
                disabled={readOnly}
                className={`w-full text-xs font-medium transition-colors ${item.endOfProcurementOverride ? 'border-amber-400 bg-amber-50/20 text-amber-950 focus-visible:ring-amber-400' : 'border-slate-200 text-slate-800'}`}
              />
              <p className="text-[11px]">
                {item.endOfProcurementOverride ? (
                  <span className="text-amber-700 font-medium">
                    ★ APP Override (Display in APP: {toDisplayMonthYear(item.endOfProcurementOverride)})
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Inherited: <span className="font-medium text-slate-700">{toDisplayMonthYear(item.effectiveEndOfProcurement)}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
