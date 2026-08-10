# Procurement Library - Quick Reference

## 🎯 Quick Start

### Access the Page
- **URL**: `http://localhost:5173/v1/planning/settings/procurement-library`
- **Menu**: Planning > Settings > Procurement Library

### File Locations

| Component | Path |
|-----------|------|
| Main Page | `src/pages/planning/settings/procurement-library/ProcurementLibraryPage.tsx` |
| Route | `src/routes/v1/planning/settings/procurement-library.tsx` |
| Navigation | `src/data/navigation-group.ts` |
| Feature Folder | `src/components/features/planning/procurement-library/` |

---

## 📋 Tab Overview

### 1. Item Master
**Purpose**: Manage procurement items
- **Add Button**: Creates new item
- **Search**: Filter by name, code, description
- **Columns**: 6 (Item Name, UACS Code, UACS Desc, CSE, UNSPSC, Status)
- **Export**: Downloads CSV
- **Import**: Upload CSV file

### 2. Modes of Procurement
**Purpose**: Define procurement methods
- **Add Button**: Create new mode
- **Amounts**: PHP formatted (₱)
- **HOPE Approval**: Badge indicator
- **Display Order**: For form sequencing

### 3. Price Catalogue
**Purpose**: Track item pricing
- **Fiscal Year**: Dropdown selector at top
- **Price Alert**: Warns if increase > 20%
- **Last Updated**: Shows update date
- **Historical**: Data model includes price history

### 4. Unit of Measurement
**Purpose**: Define measurement units
- **Parent Unit**: Optional parent-child relationships
- **Conversion Factor**: For unit conversions
- **Add UOM**: Permission-gated button
- **Mock Units**: kg, g, m, cm, L, ml, pc, box

### 5. Suppliers
**Purpose**: Manage supplier registry
- **Categories**: Multi-select industry types
- **Blacklist**: Toggle with reason field
- **Expiry Dates**: Mayor's Permit & DTI tracking
- **TIN Validation**: 12-digit format required

### 6. Procurement Activities & Timeline
**Purpose**: Define procurement activities and mode mappings
- **Activities**: List with sequence and days
- **Mode Mapping**: Two-panel interactive selector
- **APP Milestone**: Badge indicator
- **Checklist**: Check/uncheck activities per mode

---

## 🔧 Common Tasks

### Adding a New Item (Item Master)
1. Click "Add Item" button
2. Fill Item Name (required)
3. Select UACS Code from dropdown
4. Check CSE if applicable
5. Enter UNSPSC Code (optional)
6. Add Technical Specifications
7. Set Status (Active/Inactive)
8. Click "Save Item"

### Searching
- Use search box to filter by name/code
- Debounced input (300ms delay)
- Real-time table filtering

### Exporting Data
1. Click "Export" button on any tab
2. File downloads as CSV
3. Ready for spreadsheet editing

### Role-Based Access
- **Admin (write)**: Can add, edit, delete
- **Viewer (read)**: Can only view and export
- Buttons automatically hide based on permissions

---

## 💾 Data Structure

### ItemMaster
```typescript
{
  id: string                           // IM-1, IM-2, etc.
  itemName: string
  uacsCode: string
  uacsDescription: string
  isCSE: boolean
  unspscCode: string
  minimumTechnicalSpecifications: string
  status: 'active' | 'inactive'
  createdAt: string                   // ISO date
  updatedAt: string                   // ISO date
}
```

### ModeOfProcurement
```typescript
{
  id: string                           // MP-1, MP-2, etc.
  modeName: string
  minAmount: number                   // PHP
  maxAmount: number                   // PHP
  requiresHOPEApproval: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}
```

### SupplierRegistry
```typescript
{
  id: string
  companyName: string
  tinNumber: string                   // 12 digits
  address: string
  contactPerson: string
  contactEmail: string
  philGEPSNumber: string
  mayorPermitExpiry: string            // Date
  dtiExpiry: string                    // Date
  industryCategories: string[]
  isBlacklisted: boolean
  blacklistReason?: string
  createdAt: string
  updatedAt: string
}
```

---

## 🎨 UI Patterns

### Search Box
```tsx
<DebouncedInput
  placeholder="Search..."
  value={globalFilter}
  onChange={(value) => table.setGlobalFilter(String(value))}
  className="max-w-sm"
/>
```

### Add Button
```tsx
<PermissionCheck action="write" actions={actions}>
  <Button size="sm" className="gap-2">
    <Plus className="w-4 h-4" />
    Add Item
  </Button>
</PermissionCheck>
```

### Status Badge
```tsx
<Badge variant={status === 'active' ? 'default' : 'outline'}>
  {status}
</Badge>
```

### Currency Display
```tsx
<span className="font-mono">
  ₱{amount.toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}
</span>
```

---

## 🔗 API Endpoints (TO BE IMPLEMENTED)

```
GET    /api/items                      # List items
POST   /api/items                      # Create item
PUT    /api/items/:id                  # Update item
DELETE /api/items/:id                  # Delete item

GET    /api/procurement-modes          # List modes
POST   /api/procurement-modes          # Create mode
PUT    /api/procurement-modes/:id      # Update mode
DELETE /api/procurement-modes/:id      # Delete mode

GET    /api/prices?fiscalYear=YYYY     # List prices
POST   /api/prices                     # Create price
GET    /api/prices/:id/history         # Price history

GET    /api/uoms                       # List UOMs
POST   /api/uoms                       # Create UOM
PUT    /api/uoms/:id                   # Update UOM
DELETE /api/uoms/:id                   # Delete UOM (if not used)

GET    /api/suppliers                  # List suppliers
POST   /api/suppliers                  # Create supplier
PUT    /api/suppliers/:id              # Update supplier
POST   /api/suppliers/:id/blacklist    # Toggle blacklist

GET    /api/activities                 # List activities
POST   /api/activities                 # Create activity
PUT    /api/activities/:id             # Update activity
DELETE /api/activities/:id             # Delete activity

GET    /api/activity-modes             # Get mode mappings
POST   /api/activity-modes             # Save mappings
```

---

## 🐛 Debugging Tips

### Check Mock Data
- Mock generators are in each Tab component
- Replace with API calls for production
- Look for `generateMock*()` functions

### RBAC Issues
- Check `MetaActions` being passed to table
- Verify `PermissionCheck` wraps buttons
- Test with different action arrays: `['write', 'delete', 'read']`

### Form Validation
- Look in form components for `validateForm()`
- Check error state display
- All fields show error messages

### Table Issues
- Verify `forTab={true}` on TemplateTable
- Check column definitions in `table/index.ts`
- Use `setGlobalFilter()` for search

### Import Errors
- Verify paths use `@/` alias
- Check file exists in correct folder
- Types should be imported from `../types`

---

## 📦 Dependencies Used

```json
{
  "@tanstack/react-table": "Column definitions, sorting, pagination
  "@tanstack/react-router": "Routing",
  "lucide-react": "Icons (Plus, Download, Upload, AlertTriangle, etc)",
  "react-hook-form": "Form handling (if integrating)",
  "zod": "Validation (if integrating)"
}
```

---

## 🎯 Next Steps for Backend Integration

1. **Replace Mock Data**
   - Update each tab's generator with API call
   - Handle loading and error states

2. **Implement API Calls**
   - Create service functions in `services/` folder
   - Add try-catch error handling
   - Show toast notifications

3. **Add Form Submission**
   - Replace `console.log()` with API calls
   - Handle optimistic updates
   - Refresh data after mutations

4. **Implement CSV**
   - Add file upload handling
   - Add file download generation
   - Add progress indicators

5. **Add Validation**
   - Server-side validation
   - Error message display
   - Conflict resolution

---

## 📞 Component API Reference

### ItemMasterForm Props
```tsx
{
  onSubmit: (data: ItemMasterFormData) => void
  onCancel: () => void
  initialData?: ItemMasterFormData
  isLoading?: boolean
}
```

### Toolbar Props (Tables)
```tsx
{
  table: Table<T>
  actions: MetaActions
}
```

### ResponsiveDialog Props
```tsx
{
  open: boolean
  onOpenChange?: (state: boolean) => void
  title: string
  description?: string
  trigger?: ReactNode
  children: ReactNode
  footer?: ReactNode
}
```

---

## ✅ Validation Rules

### Item Master
- Item Name: Required, unique
- UACS Code: Required
- Status: Active or Inactive

### Modes of Procurement
- Mode Name: Required
- Max Amount ≥ Min Amount
- All amounts positive

### Supplier
- Company Name: Required
- TIN: 12 digits (regex validated)
- Email: Valid email format (if provided)

### Activities
- Min Days ≤ Default Days ≤ Max Days
- All day values non-negative

---

**Last Updated**: January 22, 2026
**Implementation Status**: ✅ UI Complete, Ready for Backend
**Help**: See `PROCUREMENT_LIBRARY_IMPLEMENTATION.md` for detailed docs
