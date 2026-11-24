import { z } from 'zod'

export const recordBidOpeningFormSchema = z.object({
  envelope1Result: z.enum(['Pending', 'Passed', 'Failed']),
  envelope2Opened: z.boolean().default(false),
  disqualificationReason: z.string().optional().default(''),
  asReadBidAmount: z.string().optional().default(''),
  remarks: z.string().optional().default(''),
})

export type RecordBidOpeningFormValues = z.infer<typeof recordBidOpeningFormSchema>
