import { z } from 'zod'

export const signatoryMatrixFormBaseSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal year is required'),
})

export const signatoryMatrixFormSchema = z
  .object({
    fiscalYearId: z.string().min(1, 'Fiscal year is required'),
    departmentId: z.string().min(1, 'Department is required'),
    documentType: z.string().min(1, 'Document type is required'),
    recommendingApproverId: z
      .string()
      .min(1, 'Recommending approver is required'),
    finalApproverId: z.string().min(1, 'Final approver is required'),
  })
  .refine((data) => data.recommendingApproverId !== data.finalApproverId, {
    message: 'Recommending and Final approvers cannot be the same person',
    path: ['finalApproverId'],
  })

export type SignatoryMatrixFormValues = z.infer<
  typeof signatoryMatrixFormSchema
>

export type SignatoryMatrixFilterValues = z.infer<
  typeof signatoryMatrixFormBaseSchema
>
