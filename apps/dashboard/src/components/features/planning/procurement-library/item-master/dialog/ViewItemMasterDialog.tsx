import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { FileImage } from 'lucide-react'
import type { ItemMaster } from '../../types'

interface ViewItemMasterDialogProps {
  item: ItemMaster | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewItemMasterDialog({
  item,
  open,
  onOpenChange,
}: ViewItemMasterDialogProps) {
  if (!item) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="View Item Master"
      description="Complete details of the item master"
      footer={null}
      showCloseButton
    >
      <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* Item Name */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Item Name
          </label>
          <p className="text-base font-medium mt-1">{item.itemName}</p>
        </div>

        {/* Object Code */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Object Code
          </label>
          <div className="mt-1 space-y-1">
            <code className="text-base font-mono bg-gray-100 px-2 py-1 rounded block">
              {item.uacsCode}
            </code>
            {item.objectCodeId && (
              <p className="text-xs text-muted-foreground">
                ID: {item.objectCodeId}
              </p>
            )}
          </div>
        </div>

        {/* Product Code (displayed like Object Code) */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Product Code
          </label>
          <div className="mt-1 space-y-1">
            <code className="text-base font-mono bg-gray-100 px-2 py-1 rounded block">
              {item.productCode || '—'}
            </code>
          </div>
        </div>

        {/* UNSPSC Code */}
        {item.unspscCode && (
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              UNSPSC Code
            </label>
            <code className="text-base font-mono bg-gray-100 px-2 py-1 rounded block mt-1">
              {item.unspscCode}
            </code>
          </div>
        )}

        {/* Minimum Technical Specifications */}
        {item.minimumTechnicalSpecifications && (
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              Minimum Technical Specifications
            </label>
            <p className="text-base mt-1 whitespace-pre-wrap">
              {item.minimumTechnicalSpecifications}
            </p>
          </div>
        )}

        {/* Unit of Measurement */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Unit of Measurement
          </label>
          <p className="text-base font-medium mt-1">{item.uom}</p>
          {item.uomId && (
            <p className="text-xs text-muted-foreground mt-1">
              ID: {item.uomId}
            </p>
          )}
        </div>

        {/* Item Type */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Item Type
          </label>
          <div className="mt-1">
            {
              // Map canonical backend itemType values to badge styles/labels
              (() => {
                const map: Record<string, { label: string; className: string }> = {
                  Expendable: { label: 'Expendable', className: 'bg-green-100 text-green-800' },
                  SemiExpendable: { label: 'Semi Expendable', className: 'bg-yellow-100 text-yellow-800' },
                  Equipment: { label: 'Equipment', className: 'bg-indigo-100 text-indigo-800' },
                  PPE: { label: 'PPE', className: 'bg-blue-100 text-blue-800' },
                  // backward compat for older lowercased values
                  expendable: { label: 'Expendable', className: 'bg-green-100 text-green-800' },
                  'semi expendable': { label: 'Semi Expendable', className: 'bg-yellow-100 text-yellow-800' },
                  ppe: { label: 'PPE', className: 'bg-blue-100 text-blue-800' },
                }

                const entry = map[item.itemType as string]

                if (entry) {
                  return (
                    <Badge className={entry.className}>{entry.label}</Badge>
                  )
                }

                // Fallback: show raw value in a neutral badge
                return (
                  <Badge className="bg-gray-100 text-gray-800">
                    {String(item.itemType)}
                  </Badge>
                )
              })()
            }
          </div>
        </div>

        {/* Item Life */}
        {item.itemLife && (
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              Item Life
            </label>
            <p className="text-base font-medium mt-1">
              {item.itemLife} {item.itemLifeUnit || 'years'}
            </p>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Status
          </label>
          <div className="mt-1">
            {item.status === 'active' ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-orange-300 text-orange-600 bg-transparent"
              >
                Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Image */}
        {item.imageURL && (
          <div>
            <label className="text-sm font-semibold text-muted-foreground">
              Image
            </label>
            <div className="mt-2">
              {item.imageURL.startsWith('http') ||
              item.imageURL.startsWith('blob:') ? (
                <img
                  src={item.imageURL}
                  alt="Item image"
                  className="max-w-full max-h-32 object-contain rounded border border-gray-200"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileImage className="w-4 h-4" />
                  {item.imageURL}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Created At */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Created At
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Updated At */}
        <div>
          <label className="text-sm font-semibold text-muted-foreground">
            Last Updated
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
