/**
 * OverviewTab
 * Read-only display of all item fields within the detail panel.
 * Displays specification, classification, requestor info, and audit trail.
 */

import { useAtomValue } from 'jotai'
import { Skeleton } from '@/components/ui/skeleton'
import { selectedItemDataAtom } from '../atoms/selectedItemAtom'
import { useItemDetail } from '../hooks/useItemDetail'
import { formatDateTimeLocal } from '@/lib/fiscal-year-and-policies/utils'
import { formatCurrencyPHP } from '@/utils/formatters'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

function Divider() {
  return <hr className="border-border my-3" />
}

export function OverviewTab() {
  const item = useAtomValue(selectedItemDataAtom)
  const { isLoading } = useItemDetail()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Pricing & Classification */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current Unit Price">
          <span className="font-semibold text-foreground">
            {formatCurrencyPHP(item.currentPrice)}
          </span>
        </Field>
        <Field label="Procurement Category">
          <span>{item.procurementCategoryName || 'Goods'}</span>
        </Field>
      </div>

      {/* UoM & Codes */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Unit of Measure">
          <span className="capitalize">{item.uomName || '—'}</span>
        </Field>
        <Field label="Product Code">
          {item.productCode ? (
            <span className="font-mono text-xs">{item.productCode}</span>
          ) : (
            <span className="italic text-muted-foreground text-xs">—</span>
          )}
        </Field>
      </div>

      <Divider />

      {/* Specification / Description */}
      {item.description && (
        <>
          <Field label="Description / Specification">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </Field>
          <Divider />
        </>
      )}

      {/* Remarks */}
      {item.remarks && (
        <>
          <Field label="Remarks">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.remarks}
            </p>
          </Field>
          <Divider />
        </>
      )}

      {/* Audit Trail */}
      <div className="text-xs text-muted-foreground space-y-1.5">
        {item.createdAt && (
          <Field label="Created">
            {formatDateTimeLocal(new Date(item.createdAt))}
          </Field>
        )}
        {item.createdBy && <Field label="Created By">{item.createdBy}</Field>}
      </div>
    </div>
  )
}
