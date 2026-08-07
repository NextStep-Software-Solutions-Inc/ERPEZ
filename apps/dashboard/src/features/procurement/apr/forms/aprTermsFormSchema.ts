/**
 * APR Terms Form Schema & Types
 * Captures terms configuration: Mode of Delivery, Insufficient Funds action, Attachments
 */

import { z } from 'zod'

/**
 * APR Terms Form Schema (Zod)
 * Validates user input for APR terms configuration
 */
export const aprTermsFormSchema = z.object({
  modeOfDelivery: z
    .enum(['FAST_LANE', 'SCHEDULED_PICKUP', 'DOOR_TO_DOOR'])
    .refine((val) => !!val, 'Please select a valid mode of delivery'),
  insufficientFundsAction: z
    .enum(['REDUCE_QUANTITY', 'BILL_US', 'CHARGE_TO_DEPOSIT'])
    .refine((val) => !!val, 'Please select a valid action for insufficient funds'),
  attachments: z.object({
    observationReportRequired: z.boolean().default(false),
    collectiveBarterAgreementRequired: z.boolean().default(false),
    completeSpecsRequired: z.boolean().default(false),
  }),
  remarks: z.string().optional().default(''),
})

export type APRTermsFormSchema = z.infer<typeof aprTermsFormSchema>
