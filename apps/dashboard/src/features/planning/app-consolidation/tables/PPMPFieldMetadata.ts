/**
 * PPMP Field Metadata
 * Centralized definitions for PPMP item field labels, keys, and formatting
 * Used consistently across tables, columns, dialogs, and other components
 */

export const PPMPFieldMetadata = {
  code: {
    key: 'code',
    label: 'Item Code',
    header: 'Item Code',
  },
  id: {
    key: 'id',
    label: 'Item ID',
    header: 'ID',
  },
  description: {
    key: 'description',
    label: 'Description',
    header: 'Description',
  },
  office: {
    key: 'office',
    label: 'Office/Department',
    header: 'Office',
  },
  fundSource: {
    key: 'fundSource',
    label: 'Fund Source',
    header: 'Fund Source',
  },
  itemCategory: {
    key: 'itemCategory',
    label: 'Category',
    header: 'Category',
  },
  unit: {
    key: 'unit',
    label: 'Unit of Measure',
    header: 'UOM',
  },
  quantity: {
    key: 'quantity',
    label: 'Quantity',
    header: 'Qty',
  },
  unitCost: {
    key: 'unitCost',
    label: 'Unit Cost',
    header: 'Unit Cost',
  },
  totalAmount: {
    key: 'totalAmount',
    label: 'Total Amount',
    header: 'Total Amount',
  },
} as const

export type PPMPFieldKey = keyof typeof PPMPFieldMetadata
