import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

export const DELIVERY_TERMS = [
  'FOB Destination',
  'FOB Shipping Point',
  'Pick-up by Agency',
  'Staggered Delivery',
  'Within 15 Calendar Days',
  'Within 30 Calendar Days',
  'Others',
] as const

export const PAYMENT_TERMS = [
  'LDDAP-ADA',
  'Check Payment',
  '30 Calendar Days upon Full Delivery',
  'Progress Billing',
  'One-Time Payment',
  'Others',
] as const

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

export const purchaseOrderFormSchema = z
  .object({
    /** PO date — required but stored as Date | undefined in form state */
    date: z.date().optional(),
    poNumber: z.string().min(1, 'PO Number is required.'),
    description: z.string().optional(),
    placeOfDelivery: z.string().min(1, 'Place of Delivery is required.'),
    /** Delivery date — required */
    dateOfDelivery: z.date().optional(),
    deliveryTerm: z.string().min(1, 'Delivery Term is required.'),
    deliveryTermCustom: z.string().optional(),
    paymentTerm: z.string().min(1, 'Payment Term is required.'),
    paymentTermCustom: z.string().optional(),
    // File is validated by the browser; any/null keeps TS happy for RHF register
    bidSupportingDocument: z.any().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date is required.',
        path: ['date'],
      })
    }
    if (!data.dateOfDelivery) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Date of Delivery is required.',
        path: ['dateOfDelivery'],
      })
    }
    if (data.deliveryTerm === 'Others' && !data.deliveryTermCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify a custom delivery term.',
        path: ['deliveryTermCustom'],
      })
    }
    if (data.paymentTerm === 'Others' && !data.paymentTermCustom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify a custom payment term.',
        path: ['paymentTermCustom'],
      })
    }
  })

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>
