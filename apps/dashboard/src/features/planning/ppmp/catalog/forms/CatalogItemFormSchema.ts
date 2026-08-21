/**
 * CatalogItemFormSchema
 * Zod schema shared by Create and Edit catalog item forms.
 * Matches CreateCatalogItemInput / UpdateCatalogItemInput contracts.
 */

import { z } from 'zod'
import {
  CATALOG_UOM_OPTIONS,
  PROCUREMENT_CATEGORY_OPTIONS,
} from '../types/catalog.types'

export const catalogItemFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters'),
  itemType: z.enum(PROCUREMENT_CATEGORY_OPTIONS),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  unitOfMeasure: z.enum(CATALOG_UOM_OPTIONS),
  currentPrice: z
    .number()
    .min(0.01, 'Price must be greater than 0'),
  specification: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  uacsCode: z.string().optional().nullable(),
  unspscCode: z.string().min(1, 'UNSPSC code is required'),
  isCSE: z.boolean().default(false),
  imageUrl: z.string().optional().nullable(),
})

export type CatalogItemFormValues = z.infer<typeof catalogItemFormSchema>
