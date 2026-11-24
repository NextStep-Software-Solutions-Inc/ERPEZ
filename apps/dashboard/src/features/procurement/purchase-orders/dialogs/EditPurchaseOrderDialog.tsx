import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { EditPurchaseOrderForm } from '../forms/EditPurchaseOrderForm'
import { useUpdatePurchaseOrder } from '../handlers'
import type { PurchaseOrder } from '../types'
import type { PurchaseOrderFormValues } from './purchaseOrderFormSchema'

type EditPurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrder | null
}

export function EditPurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: EditPurchaseOrderDialogProps) {
  const updateMutation = useUpdatePurchaseOrder()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: PurchaseOrderFormValues) => {
    if (!purchaseOrder) return
    setIsSubmitting(true)

    try {
      const deliveryTerm =
        values.deliveryTerm === 'Others'
          ? values.deliveryTermCustom || ''
          : values.deliveryTerm
      const paymentTerm =
        values.paymentTerm === 'Others'
          ? values.paymentTermCustom || ''
          : values.paymentTerm

      await updateMutation.mutateAsync({
        id: purchaseOrder.id,
        poNumber: values.poNumber,
        procurementMode: (purchaseOrder.procurementMode || 'SVP') as any,
        sourceDocumentType: (purchaseOrder.sourceDocumentType || 'AOB') as any,
        sourceDocumentId: purchaseOrder.sourceDocumentId || '',
        supplierId: purchaseOrder.supplierId || '',
        description: values.description || undefined,
        date: values.date
          ? format(values.date, 'yyyy-MM-dd')
          : purchaseOrder.date || '',
        placeOfDelivery: values.placeOfDelivery,
        dateOfDelivery: values.dateOfDelivery
          ? format(values.dateOfDelivery, 'yyyy-MM-dd')
          : undefined,
        deliveryTerm,
        paymentTerm,
        supportingDocumentUrl: purchaseOrder.supportingDocumentUrl || undefined,
      })

      toast.success(`Purchase Order ${values.poNumber} updated successfully!`)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update Purchase Order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Purchase Order"
      description={`Update header details for ${purchaseOrder?.poNumber || 'Purchase Order'}.`}
      size="2xl"
      showCloseButton
      onPointerDownOutside={(e) => {
        // Prevent accidental closing when interacting with datepicker/select portals
        const target = e.target as HTMLElement | null
        if (
          target?.closest('[data-radix-popper-content-wrapper]') ||
          target?.closest('[role="dialog"]') ||
          target?.closest('[role="listbox"]')
        ) {
          e.preventDefault()
        }
      }}
      footer={
        <div className="flex justify-end gap-2 w-full pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-purchase-order-form"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      }
    >
      <EditPurchaseOrderForm
        formId="edit-purchase-order-form"
        purchaseOrder={purchaseOrder}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialogDashtail>
  )
}
