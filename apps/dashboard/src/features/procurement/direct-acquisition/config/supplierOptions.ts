/**
 * Reputable source / supplier options shown in the Direct Acquisition
 * purchase-entry dialog.
 *
 * Each entry carries an optional TIN that is automatically applied when the
 * store is selected — no manual TIN entry required.
 *
 * TODO: Replace this static list with a live API call (e.g. GET /api/suppliers?type=retail)
 *       before going to production. The list should be user-editable or fetched from
 *       the Supplier Registry module once that is available.
 */
export interface SupplierOption {
  id: string
  name: string
  tin?: string
}

export const SUPPLIER_OPTIONS: SupplierOption[] = [
  { id: 'sup-001', name: 'National Bookstore',            tin: '000-123-456-000' },
  { id: 'sup-002', name: 'Shopee Official Store',         tin: '000-234-567-000' },
  { id: 'sup-003', name: 'Lazada Mall',                   tin: '000-345-678-000' },
  { id: 'sup-004', name: 'Abenson',                       tin: '000-456-789-000' },
  { id: 'sup-005', name: 'Octagon Computer Accessories',  tin: '000-567-890-000' },
  { id: 'sup-006', name: 'SM Store',                      tin: '000-678-901-000' },
  { id: 'sup-007', name: 'Robinsons Dept. Store',         tin: '000-789-012-000' },
  { id: 'sup-008', name: 'CleanPro Supplies',             tin: '000-890-123-000' },
  { id: 'sup-009', name: 'TechSource Inc.',               tin: '000-901-234-000' },
  { id: 'sup-010', name: 'Hardware Store XYZ',            tin: undefined },
]
