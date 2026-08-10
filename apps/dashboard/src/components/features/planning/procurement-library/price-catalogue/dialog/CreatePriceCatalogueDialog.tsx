import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { PriceCatalogueForm } from './PriceCatalogueForm'
import { useToast } from '@/components/ui/use-toast'
import type { PriceCatalogueFormData } from '../../types'
import type { MetaActions } from '@/types/global'
import { useItemMaster } from '@/hooks/useItemMaster'
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'
import { useCreateItemPrice } from '@/features/planning/procurement-library/item-price/hooks/useItemPriceQueries'

interface CreatePriceCatalogueDialogProps {
  actions: MetaActions
  onCreateSuccess?: (data: PriceCatalogueFormData) => void
  onRefresh?: () => void
}

export function CreatePriceCatalogueDialog({
  actions,
  onCreateSuccess,
  onRefresh,
}: CreatePriceCatalogueDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { itemMasters } = useItemMaster()
  const { fiscalYears } = useFiscalYearQueries()
  const { createItemPrice, isPending } = useCreateItemPrice()

  const procurementItemOptions = itemMasters.map((item) => ({
    value: item.id,
    label: item.itemName,
  }))

  const fiscalYearOptions = fiscalYears
    .slice()
    .sort((left, right) => right.year - left.year)
    .map((fiscalYear) => ({
      value: fiscalYear.id,
      label: `FY ${fiscalYear.year}`,
    }))

  const handleSubmit = async (data: PriceCatalogueFormData) => {
    try {
      await createItemPrice(data)
      toast({
        title: 'Success',
        description: 'Price catalogue entry created successfully.',
        color: 'success',
      })
      onCreateSuccess?.(data)
      onRefresh?.()
      setOpen(false)
    } catch {
      toast({
        title: 'Error',
        description: 'Error creating price catalogue entry. Please try again.',
        color: 'destructive',
      })
    }
  }

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Price Catalogue"
        description="Create a new price catalogue entry"
        trigger={
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Price
          </Button>
        }
      >
        <PriceCatalogueForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isLoading={isPending}
          procurementItemOptions={procurementItemOptions}
          fiscalYearOptions={fiscalYearOptions}
        />
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
