import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { PriceCatalogueForm } from './PriceCatalogueForm'
import { useToast } from '@/components/ui/use-toast'
import type { PriceCatalogueItem, PriceCatalogueFormData } from '../../types'
import { useItemMaster } from '@/hooks/useItemMaster'
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'
import { useUpdateItemPrice } from '@/features/planning/procurement-library/item-price/hooks/useItemPriceQueries'

interface EditPriceCatalogueDialogProps {
  item: PriceCatalogueItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPriceCatalogueDialog({
  item,
  open,
  onOpenChange,
}: EditPriceCatalogueDialogProps) {
  const { toast } = useToast()
  const { itemMasters } = useItemMaster()
  const { fiscalYears } = useFiscalYearQueries()
  const { updateItemPrice, isPending } = useUpdateItemPrice()

  const procurementItemOptions = itemMasters.map((option) => ({
    value: option.id,
    label: option.itemName,
  }))

  const fiscalYearOptions = fiscalYears
    .slice()
    .sort((left, right) => right.year - left.year)
    .map((fiscalYear) => ({
      value: fiscalYear.id,
      label: `FY ${fiscalYear.year}`,
    }))

  const handleSubmit = async (data: PriceCatalogueFormData) => {
    if (!item) return

    try {
      await updateItemPrice(item.id, data)
      toast({
        title: 'Success',
        description: 'Price catalogue entry updated successfully.',
        color: 'warning',
      })

      onOpenChange(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Error updating price catalogue entry. Please try again.',
        color: 'destructive',
      })
    }
  }

  if (!item) return null

  const initialData: PriceCatalogueFormData = {
    procurementItemId: item.procurementItemId,
    fiscalYearId: item.fiscalYearId ?? '',
    unitPrice: item.unitPrice,
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Price Catalogue"
      description="Update the price catalogue entry"
    >
      <PriceCatalogueForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        initialData={initialData}
        isLoading={isPending}
        procurementItemOptions={procurementItemOptions}
        fiscalYearOptions={fiscalYearOptions}
      />
    </ResponsiveDialog>
  )
}
