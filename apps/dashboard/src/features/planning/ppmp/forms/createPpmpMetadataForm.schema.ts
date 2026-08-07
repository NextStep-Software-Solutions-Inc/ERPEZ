import { z } from 'zod'

export const createPpmpMetadataSchema = z.object({
  officeId: z.string().min(1, 'Office is required.'),
  fiscalYearId: z.string().min(1, 'Fiscal year is required.'),
  libId: z.string().min(1, 'Line-item budget is required.'),
  fundSourceId: z.string().nullable(),
  parentId: z.string().nullable(),
  ppmpNumber: z
    .string()
    .regex(
      /^FY-\d{4}-\d{4}$/,
      'PPMP number must follow the format FY-YYYY-0001',
    )
    .nullable(),
  isMaster: z.boolean(),
})

export type CreatePpmpMetadataFormValues = z.infer<
  typeof createPpmpMetadataSchema
>

export const DEFAULT_PPMP_SEQUENCE_SUFFIX = '0001'

export function generatePpmpNumber(year: number, suffix: string): string {
  return `FY-${year}-${suffix.padStart(4, '0')}`
}

export function extractPpmpSequenceSuffix(ppmpNumber?: string | null): string {
  if (!ppmpNumber) return DEFAULT_PPMP_SEQUENCE_SUFFIX
  const match = ppmpNumber.match(/^(?:FY-\d{4}-)(\d{4})$/i)
  return match?.[1] ?? DEFAULT_PPMP_SEQUENCE_SUFFIX
}
