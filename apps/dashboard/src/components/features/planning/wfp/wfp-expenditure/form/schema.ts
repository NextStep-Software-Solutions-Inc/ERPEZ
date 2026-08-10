import { z } from 'zod'

export const createWFPObjectiveExpenditureSchema = z.object({
  wfpObjectiveTargetId: z.string().min(1, 'Activity ID is required'),
  expenditures: z.array(z.object({
    expenditureType: z.string().min(1, 'Expenditure Type is required'),
    lineItems: z.array(z.object({
      objectId: z.string().min(1, 'Item of Expenditure is required'),
      items: z.array(z.object({
        name: z.string().min(1, 'Item Name is required'),
        unitEstimates: z.number().min(0).nullable(),
        quantity: z.number().min(0).nullable(),
        subTotal: z.number().min(0).nullable(),
      })).min(1, 'At least one item is required'),
    })).min(1, 'At least one line item is required'),
  })).min(1, 'At least one expenditure block is required'),
});

export type CreateWFPObjectiveTargetExpenditureValues = z.infer<typeof createWFPObjectiveExpenditureSchema>
