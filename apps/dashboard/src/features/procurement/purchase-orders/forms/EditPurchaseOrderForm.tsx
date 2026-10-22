import { useEffect, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import FieldInfo from '@/components/FieldInfo'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { PurchaseOrder } from '../types'
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
  DELIVERY_TERMS,
  PAYMENT_TERMS,
} from '../dialogs/purchaseOrderFormSchema'

export interface EditPurchaseOrderFormProps {
  formId?: string
  purchaseOrder: PurchaseOrder | null
  onSubmit: (values: PurchaseOrderFormValues) => Promise<void> | void
  isSubmitting?: boolean
  onCancel?: () => void
}

export function EditPurchaseOrderForm({
  formId = 'edit-purchase-order-form',
  purchaseOrder,
  onSubmit,
  isSubmitting = false,
}: EditPurchaseOrderFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isDeliveryDateOpen, setIsDeliveryDateOpen] = useState(false)

  const isCustomDelivery = Boolean(
    purchaseOrder?.deliveryTerm &&
      !DELIVERY_TERMS.includes(purchaseOrder.deliveryTerm as any),
  )
  const isCustomPayment = Boolean(
    purchaseOrder?.paymentTerm &&
      !PAYMENT_TERMS.includes(purchaseOrder.paymentTerm as any),
  )

  const defaultValues: PurchaseOrderFormValues = {
    poNumber: purchaseOrder?.poNumber || '',
    date: purchaseOrder?.date ? new Date(purchaseOrder.date) : new Date(),
    placeOfDelivery: purchaseOrder?.placeOfDelivery || '',
    dateOfDelivery: purchaseOrder?.dateOfDelivery
      ? new Date(purchaseOrder.dateOfDelivery)
      : undefined,
    deliveryTerm: isCustomDelivery
      ? 'Others'
      : (purchaseOrder?.deliveryTerm || 'Within 30 Calendar Days'),
    deliveryTermCustom: isCustomDelivery ? purchaseOrder?.deliveryTerm || '' : '',
    paymentTerm: isCustomPayment
      ? 'Others'
      : (purchaseOrder?.paymentTerm || '30 Calendar Days upon Full Delivery'),
    paymentTermCustom: isCustomPayment ? purchaseOrder?.paymentTerm || '' : '',
    description: purchaseOrder?.description || '',
    bidSupportingDocument: null,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onChange: purchaseOrderFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  // Pre-fill form when purchaseOrder changes
  useEffect(() => {
    if (purchaseOrder) {
      const isCustomDel = Boolean(
        purchaseOrder.deliveryTerm &&
          !DELIVERY_TERMS.includes(purchaseOrder.deliveryTerm as any),
      )
      const isCustomPay = Boolean(
        purchaseOrder.paymentTerm &&
          !PAYMENT_TERMS.includes(purchaseOrder.paymentTerm as any),
      )

      form.reset({
        poNumber: purchaseOrder.poNumber || '',
        date: purchaseOrder.date ? new Date(purchaseOrder.date) : new Date(),
        placeOfDelivery: purchaseOrder.placeOfDelivery || '',
        dateOfDelivery: purchaseOrder.dateOfDelivery
          ? new Date(purchaseOrder.dateOfDelivery)
          : undefined,
        deliveryTerm: isCustomDel
          ? 'Others'
          : (purchaseOrder.deliveryTerm || 'Within 30 Calendar Days'),
        deliveryTermCustom: isCustomDel ? purchaseOrder.deliveryTerm || '' : '',
        paymentTerm: isCustomPay
          ? 'Others'
          : (purchaseOrder.paymentTerm || '30 Calendar Days upon Full Delivery'),
        paymentTermCustom: isCustomPay ? purchaseOrder.paymentTerm || '' : '',
        description: purchaseOrder.description || '',
        bidSupportingDocument: null,
      })
      setSubmitAttempted(false)
    }
  }, [purchaseOrder, form])

  const deliveryTermValue = useStore(form.store, (s) => s.values.deliveryTerm)
  const paymentTermValue = useStore(form.store, (s) => s.values.paymentTerm)

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setSubmitAttempted(true)
        form.handleSubmit()
      }}
      className="space-y-4 py-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PO Number */}
        <form.Field name="poNumber">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  PO Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  placeholder="PO-SVP-2026-..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>

        {/* PO Date */}
        <form.Field name="date">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2 flex flex-col">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  PO Date <span className="text-destructive">*</span>
                </Label>
                <Popover modal={true} open={isDateOpen} onOpenChange={setIsDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="po-date-picker"
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className={cn(
                        'w-full pl-3 text-left font-normal flex justify-between items-center',
                        hasError && 'border-destructive text-destructive',
                      )}
                    >
                      {field.state.value ? (
                        format(field.state.value, 'PPP')
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-[99999]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.state.value}
                      onSelect={(date) => {
                        if (date) {
                          field.handleChange(date)
                          setIsDateOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Place of Delivery */}
        <form.Field name="placeOfDelivery">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Place of Delivery <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Agency Main Office"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>

        {/* Date of Delivery */}
        <form.Field name="dateOfDelivery">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2 flex flex-col">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Date of Delivery <span className="text-destructive">*</span>
                </Label>
                <Popover
                  modal={true}
                  open={isDeliveryDateOpen}
                  onOpenChange={setIsDeliveryDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="delivery-date-picker"
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      className={cn(
                        'w-full pl-3 text-left font-normal flex justify-between items-center',
                        hasError && 'border-destructive text-destructive',
                      )}
                    >
                      {field.state.value ? (
                        format(field.state.value, 'PPP')
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a delivery date
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-[99999]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.state.value}
                      onSelect={(date) => {
                        field.handleChange(date)
                        setIsDeliveryDateOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Term */}
        <form.Field name="deliveryTerm">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Delivery Term <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id={field.name}
                    className={cn(hasError && 'border-destructive')}
                  >
                    <SelectValue placeholder="Select delivery term" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    {DELIVERY_TERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>

        {/* Payment Term */}
        <form.Field name="paymentTerm">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Payment Term <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id={field.name}
                    className={cn(hasError && 'border-destructive')}
                  >
                    <SelectValue placeholder="Select payment term" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    {PAYMENT_TERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>
      </div>

      {/* Custom Delivery Term if Others */}
      {deliveryTermValue === 'Others' && (
        <form.Field name="deliveryTermCustom">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Custom Delivery Term <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  placeholder="Specify custom delivery term"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>
      )}

      {/* Custom Payment Term if Others */}
      {paymentTermValue === 'Others' && (
        <form.Field name="paymentTermCustom">
          {(field) => {
            const hasError =
              (submitAttempted || field.state.meta.isTouched) &&
              field.state.meta.errors.length > 0
            return (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className={cn(hasError && 'text-destructive')}
                >
                  Custom Payment Term <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  placeholder="Specify custom payment term"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
                />
                <FieldInfo field={field} showErrors={submitAttempted} />
              </div>
            )
          }}
        </form.Field>
      )}

      {/* Description / Remarks */}
      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description / Remarks</Label>
            <Textarea
              id={field.name}
              placeholder="Provide additional details or procurement remarks"
              className="resize-none"
              rows={3}
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldInfo field={field} showErrors={submitAttempted} />
          </div>
        )}
      </form.Field>
    </form>
  )
}
