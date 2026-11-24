import {
  Calendar,
  FileText,
  Layers,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrencyPHP } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export interface ConsolidatedPrItemDetails {
  id: string
  prItemId?: string
  itemName: string
  description?: string | null
  category?: string | null
  stockNo?: string | null
  unit?: string | null
  quantity: number
  unitPrice: number
  totalAmount: number
  prNumber?: string | null
  purchaseRequestId?: string | null
  officeName?: string | null
  procurementModeId?: string | null
  procurementModeName?: string | null
  allowPartial?: boolean
  monthlyQuantities?: Record<string, number>
}

export interface ConsolidatedPrItemDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ConsolidatedPrItemDetails | null
}

const ALLOCATION_MONTHS = [
  { key: 'January', short: 'Jan' },
  { key: 'February', short: 'Feb' },
  { key: 'March', short: 'Mar' },
  { key: 'April', short: 'Apr' },
  { key: 'May', short: 'May' },
  { key: 'June', short: 'Jun' },
  { key: 'July', short: 'Jul' },
  { key: 'August', short: 'Aug' },
  { key: 'September', short: 'Sep' },
  { key: 'October', short: 'Oct' },
  { key: 'November', short: 'Nov' },
  { key: 'December', short: 'Dec' },
]

export function ConsolidatedPrItemDetailsModal({
  open,
  onOpenChange,
  item,
}: ConsolidatedPrItemDetailsModalProps) {
  if (!item) return null

  const monthlyQuantities = item.monthlyQuantities || {}
  const totalAllocated = ALLOCATION_MONTHS.reduce((sum, m) => {
    return sum + (monthlyQuantities[m.key] || 0)
  }, 0)

  return (
    <ResponsiveDialogDashtail
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Consolidated PR Item Specifications"
      description="Detailed item specifications, originating Purchase Request, and delivery allocation schedule."
      size="2xl"
    >
      <div className="space-y-5 p-1 text-xs">
        {/* Item Header Card */}
        <div className="p-4 bg-muted/30 border rounded-xl space-y-2.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground">
                  {item.itemName}
                </h3>
                {item.category && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {item.category}
                  </Badge>
                )}
                {item.stockNo && (
                  <Badge variant="outline" className="text-[11px] font-mono bg-background">
                    Stock No: {item.stockNo}
                  </Badge>
                )}
              </div>
              {item.description ? (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/70 italic mt-1">
                  No additional specifications provided.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Originating PR & Office Card */}
          <div className="p-4 border rounded-xl bg-card space-y-3 shadow-2xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Origin & Requisition
            </h4>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Originating PR #:</span>
                <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                  {item.prNumber || 'Independent / Not Linked'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Requesting Office:</span>
                <span className="font-semibold text-foreground text-right">
                  {item.officeName || 'General Administration'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Procurement Mode:</span>
                <span className="font-medium text-purple-700 dark:text-purple-400 text-right">
                  {item.procurementModeName || 'Direct Contracting (Proprietary Source)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Allow Partial Delivery:</span>
                {item.allowPartial ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Allowed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" /> Full Batch Delivery
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget & Quantity Card */}
          <div className="p-4 border rounded-xl bg-card space-y-3 shadow-2xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" /> Budget & Quantities
            </h4>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Requested Quantity:</span>
                <span className="font-bold text-foreground text-sm">
                  {item.quantity} {item.unit || 'unit'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Unit Cost:</span>
                <span className="font-semibold text-foreground">
                  {formatCurrencyPHP(item.unitPrice || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <span className="text-xs font-bold text-foreground">
                  Total Approved Budget (ABC):
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyPHP(item.totalAmount || item.quantity * item.unitPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Allocation Schedule Matrix */}
        <div className="p-4 border rounded-xl bg-card space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" /> 12-Month Delivery Schedule Allocation
            </h4>
            <span className="text-[11px] text-muted-foreground font-medium">
              Allocated:{' '}
              <strong className="text-foreground">
                {totalAllocated > 0 ? totalAllocated : item.quantity}
              </strong>{' '}
              / {item.quantity} {item.unit || 'unit'}
            </span>
          </div>
          <Separator />

          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center min-w-[500px]">
              {ALLOCATION_MONTHS.map((m) => {
                const qty = monthlyQuantities[m.key] || 0
                const hasAlloc = qty > 0
                return (
                  <div
                    key={m.key}
                    className={cn(
                      'p-2 rounded-lg border text-center transition-all',
                      hasAlloc
                        ? 'bg-primary/10 border-primary/40 dark:bg-primary/20 text-primary'
                        : 'bg-muted/20 border-border/40 text-muted-foreground/70'
                    )}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider">{m.short}</div>
                    <div
                      className={cn(
                        'text-xs font-bold mt-1',
                        hasAlloc ? 'text-primary font-extrabold' : 'text-muted-foreground/50'
                      )}
                    >
                      {hasAlloc ? qty : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
