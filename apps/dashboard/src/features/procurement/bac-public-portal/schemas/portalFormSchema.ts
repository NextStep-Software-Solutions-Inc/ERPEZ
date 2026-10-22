import { z } from 'zod'

export const itemBidSchema = z.object({
  unitPrice: z.union([z.number().positive(), z.string()]),
  brand: z.string().optional().default(''),
  model: z.string().optional().default(''),
})

export const portalApplicationFormSchema = z.object({
  supplierName: z.string().min(1, 'Supplier / company name is required'),
  email: z.string().email('Valid email address is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  address: z.string().min(1, 'Business address is required'),
  tinNumber: z.string().min(1, 'TIN number is required'),
  deliveryPeriod: z.string().min(1, 'Delivery period is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  warrantyTerms: z.string().optional().default(''),
  validityPeriodDays: z.union([z.number(), z.string()]).optional().default(60),
  remarks: z.string().optional().default(''),
  proposedBidAmount: z.union([z.number(), z.string()]).optional().default(''),
  bidSecurityType: z.string().default('Bid Securing Declaration'),
  bidSecurityAmount: z.union([z.number(), z.string()]).optional().default(''),
  bidSecurityNumber: z.string().optional().default(''),
  bidSecurityValidityDays: z.union([z.number(), z.string()]).optional().default(120),
  itemBids: z.record(z.string(), itemBidSchema).optional().default({}),
})

export type PortalApplicationFormValues = z.infer<typeof portalApplicationFormSchema>
