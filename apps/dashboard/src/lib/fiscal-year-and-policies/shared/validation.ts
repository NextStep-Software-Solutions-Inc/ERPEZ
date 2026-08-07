/**
 * Zod validation schemas for Fiscal Year & Policies
 * Used with TanStack Form for type-safe form validation
 */

import { z } from 'zod'; 

// ============================================
// UTILITY VALIDATORS
// ============================================

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const isoDateString = z.string().refine(isValidDate, 'Invalid date format');

// ============================================
// FISCAL YEAR SCHEMAS
// ============================================

export const createFiscalYearSchema = z.object({
  yearNumber: z
    .number()
    .int('Year must be a whole number')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  description: z.string().optional(),
  startDate: isoDateString,
  endDate: isoDateString,
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start < end;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CreateFiscalYearFormValues = z.infer<typeof createFiscalYearSchema>;

export const updateFiscalYearSchema = createFiscalYearSchema.partial();
export type UpdateFiscalYearFormValues = z.infer<typeof updateFiscalYearSchema>;

// ============================================
// ECONOMIC INDICATOR SCHEMAS
// ============================================

export const createEconomicIndicatorSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code too long'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name too long'),
  value: z.number().finite('Value must be a valid number'),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
});

export type CreateEconomicIndicatorFormValues = z.infer<typeof createEconomicIndicatorSchema>;

// ============================================
// BUDGET CALL SCHEMAS
// ============================================

export const budgetCallTypeEnum = z.enum([
  'InitialProposal',
  'SupplementalBudget',
  'BudgetRevision',
  'MidYearReview',
  'YearEndAdjustment',
]);

export const createBudgetCallSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal year is required').uuid('Invalid fiscal year ID'),
  type: budgetCallTypeEnum,
  submissionDeadline: isoDateString,
});

export type CreateBudgetCallFormValues = z.infer<typeof createBudgetCallSchema>;

// ============================================
// PROCUREMENT THRESHOLD SCHEMAS
// ============================================

export const createProcurementThresholdSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code too long'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name too long'),
  method: z.enum(['open_bidding', 'limited_bidding', 'negotiated_procurement']),
  minAmount: z.number().nonnegative('Minimum amount must be non-negative'),
  maxAmount: z.number().nonnegative('Maximum amount must be non-negative').optional(),
  parentThresholdId: z.string().optional(),
}).refine(
  (data) => {
    if (data.maxAmount === undefined || data.maxAmount === null) return true;
    return data.minAmount <= data.maxAmount;
  },
  {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount'],
  }
);

export type CreateProcurementThresholdFormValues = z.infer<typeof createProcurementThresholdSchema>;

// ============================================
// RATING SCALE SCHEMAS
// ============================================

export const ratingLevelSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
});

export const createRatingScaleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255, 'Name too long'),
  code: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['general', 'custom']),
  scaleType: z.enum(['fixed', 'non_fixed']),
  ratings: z.array(ratingLevelSchema).min(1, 'At least one rating level is required'),
  applicableToQET: z.array(z.enum(['quantity', 'efficiency', 'timeliness'])).optional(),
});

export type CreateRatingScaleFormValues = z.infer<typeof createRatingScaleSchema>;

// ============================================
// PROCUREMENT POLICY CONFIG SCHEMAS
// ============================================

export const createProcurementPolicyConfigSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal year is required').uuid('Invalid fiscal year ID'),
  procurementModeId: z.string().min(1, 'Procurement mode is required').uuid('Invalid procurement mode ID'),
  procurementModeThresholdId: z.string().min(1, 'Procurement mode threshold is required').uuid('Invalid threshold ID'),
  minAmount: z.number().nonnegative('Minimum amount must be non-negative'),
  maxAmount: z.number().nonnegative('Maximum amount must be non-negative').nullable().optional(),
}).refine(
  (data) => {
    if (data.maxAmount === null || data.maxAmount === undefined) return true;
    return data.minAmount <= data.maxAmount;
  },
  {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount'],
  }
);

export type CreateProcurementPolicyConfigFormValues = z.infer<typeof createProcurementPolicyConfigSchema>;

export const updateProcurementPolicyConfigSchema = z.object({
  procurementModeThresholdId: z.string().uuid('Invalid threshold ID').optional(),
  minAmount: z.number().nonnegative('Minimum amount must be non-negative').optional(),
  maxAmount: z.number().nonnegative('Maximum amount must be non-negative').nullable().optional(),
}).refine(
  (data) => {
    if (data.maxAmount === null || data.maxAmount === undefined) return true;
    if (data.minAmount === undefined) return true;
    return data.minAmount <= data.maxAmount;
  },
  {
    message: 'Maximum amount must be greater than or equal to minimum amount',
    path: ['maxAmount'],
  }
);

export type UpdateProcurementPolicyConfigFormValues = z.infer<typeof updateProcurementPolicyConfigSchema>;

// ============================================
// BATCH VALIDATION
// ============================================

export const batchCreateSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema).min(1, 'At least one item is required'),
  });
