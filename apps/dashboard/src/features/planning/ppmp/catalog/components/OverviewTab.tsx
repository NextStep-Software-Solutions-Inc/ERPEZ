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
          <span className="font-mono font-semibold">
            ₱
            {item.currentPrice.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </Field>
        <Field label="Item Type">
          <span className="capitalize">{item.itemType}</span>
        </Field>
      </div>

      {/* Item Classification */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">{item.category}</Field>
        <Field label="Subcategory">
          {item.subcategory ?? (
            <span className="italic text-muted-foreground text-xs">—</span>
          )}
        </Field>
      </div>

      {/* UoM & Codes */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Unit of Measure">
          <span className="capitalize">{item.unitOfMeasure}</span>
        </Field>
        <Field label="Supplier">
          {item.supplier ?? (
            <span className="italic text-muted-foreground text-xs">—</span>
          )}
        </Field>
      </div>

      <Divider />

      {/* Codes & Classifications */}
      <div className="space-y-2">
        <Field label="UACS Code">
          {item.uacsCode ? (
            <span className="font-mono text-xs">{item.uacsCode}</span>
          ) : (
            <span className="italic text-muted-foreground text-xs">—</span>
          )}
        </Field>
        <Field label="UNSPSC Code">
          <span className="font-mono text-xs">{item.unspscCode}</span>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CSE Item">
          <span className="text-xs font-semibold">
            {item.isCSE ? (
              <span className="text-green-600 dark:text-green-400">Yes</span>
            ) : (
              <span className="text-gray-500">No</span>
            )}
          </span>
        </Field>
        <Field label="Status">
          <span className="text-xs font-semibold capitalize">
            {item.status}
          </span>
        </Field>
      </div>

      <Divider />

      {/* Specification */}
      {item.specification && (
        <>
          <Field label="Specification">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {item.specification}
            </p>
          </Field>
          <Divider />
        </>
      )}

      {/* Image URL */}
      {item.imageUrl && (
        <>
          <Field label="Image URL">
            <span className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {item.imageUrl}
            </span>
          </Field>
          <Divider />
        </>
      )}

      {/* Origin - Requestor Info */}
      {(item.requestingOffice || item.requestingUser) && (
        <>
          <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2 uppercase tracking-wide">
              Origin / Requested By
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Requesting Office">
                {item.requestingOffice ?? (
                  <span className="italic text-muted-foreground text-xs">
                    —
                  </span>
                )}
              </Field>
              <Field label="Requesting User">
                {item.requestingUser ?? (
                  <span className="italic text-muted-foreground text-xs">
                    —
                  </span>
                )}
              </Field>
            </div>
            {item.sourceRequestId && (
              <Field label="Source Request ID">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.sourceRequestId}
                </span>
              </Field>
            )}
          </div>
          <Divider />
        </>
      )}

      {/* Audit Trail */}
      <div className="text-xs text-muted-foreground space-y-1.5">
        <Field label="Created">{formatDateTimeLocal(item.createdDate)}</Field>
        <Field label="Last Modified">
          {formatDateTimeLocal(item.lastModified)}
        </Field>
      </div>
    </div>
  )
}
