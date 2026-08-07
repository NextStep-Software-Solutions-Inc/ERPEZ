# Procurement Library Implementation Guide

## Overview
The Procurement Library is a comprehensive UI module for managing standardized procurement data used in PPMP and APP planning. It provides six interconnected tabs for managing different aspects of procurement data.

## File Structure

```
dashboard/src/
├── components/features/planning/procurement-library/
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── item-master/
│   │   ├── table/
│   │   │   ├── index.ts               # Column definitions
│   │   │   └── Toolbar.tsx            # Search, add, import/export
│   │   └── dialog/
│   │       ├── CreateItemMasterDialog.tsx
│   │       └── ItemMasterForm.tsx
│   ├── modes-of-procurement/
│   │   ├── table/
│   │   │   ├── index.ts
│   │   │   └── Toolbar.tsx
│   │   └── dialog/
│   │       ├── CreateModeOfProcurementDialog.tsx
│   │       └── ModeOfProcurementForm.tsx
│   ├── price-catalogue/
│   │   ├── table/
│   │   │   └── index.ts
│   │   └── dialog/
│   │       └── PriceCatalogueForm.tsx
│   ├── unit-of-measurement/
│   │   ├── table/
│   │   │   └── index.ts
│   │   └── dialog/
│   │       └── UnitOfMeasurementForm.tsx
│   ├── suppliers/
│   │   ├── table/
│   │   │   └── index.ts
│   │   └── dialog/
│   │       └── SupplierRegistryForm.tsx
│   ├── procurement-activities/
│   │   ├── table/
│   │   │   └── index.ts
│   │   └── dialog/
│   │       └── ProcurementActivityForm.tsx
│   ├── tabs/
│   │   ├── ItemMasterTab.tsx
│   │   ├── ModesOfProcurementTab.tsx
│   │   ├── PriceCatalogueTab.tsx
│   │   ├── UnitOfMeasurementTab.tsx
│   │   ├── SuppliersTab.tsx
│   │   └── ProcurementActivitiesTab.tsx
│   └── index.ts                        # Consolidated exports
├── pages/planning/settings/procurement-library/
│   └── ProcurementLibraryPage.tsx       # Main page component
└── routes/v1/planning/settings/
    └── procurement-library.tsx          # Route definition
```

## Features Implemented

### 1. **Item Master Tab**
- **Table Columns**: Item Name, UACS Code, UACS Description, CSE Badge, UNSPSC Code, Status
- **Features**:
  - Add/Edit item master entries
  - Search functionality
  - CSV import/export
  - Status indicator (Active/Inactive)
  - RBAC-aware UI (hide buttons for read-only users)

- **Form Fields**:
  - Item Name (required, unique)
  - UACS Code (searchable dropdown)
  - CSE checkbox
  - UNSPSC Code (optional)
  - Minimum Technical Specifications (textarea)
  - Status toggle (Active/Inactive)

### 2. **Modes of Procurement Tab**
- **Table Columns**: Mode Name, Min Amount, Max Amount, Requires HOPE Approval, Display Order
- **Features**:
  - Add/Edit procurement modes
  - Currency formatting (Philippine Pesos)
  - HOPE Approval badge indicator
  - Display order for form sequencing

- **Form Fields**:
  - Mode Name (required)
  - Min Amount (number, PHP)
  - Max Amount (number, PHP)
  - Requires HOPE Approval (checkbox)
  - Display Order (number)

### 3. **Price Catalogue Tab**
- **Table Columns**: Item Name, UOM, Unit Price, Last Updated, Price Alert
- **Features**:
  - Fiscal year selector at top
  - Price warning indicator (> 20% increase)
  - Historical price tracking
  - CSV import/export capabilities
  - Currency formatting

- **Form Fields**:
  - Item (dropdown)
  - Unit Price (number, PHP)
  - Fiscal Year (dropdown)

### 4. **Unit of Measurement Tab**
- **Table Columns**: Name, Abbreviation, Parent Unit, Conversion Factor
- **Features**:
  - Support for derived/parent units
  - Conversion factor tracking
  - Delete protection for used units

- **Form Fields**:
  - Name (required)
  - Abbreviation (required)
  - Parent UOM (optional dropdown)
  - Conversion Factor (number)

### 5. **Suppliers Registry Tab**
- **Table Columns**: Company Name, PhilGEPS Number, Industry Categories, Blacklist Status
- **Features**:
  - Multi-select industry categories
  - Blacklist status with reason
  - Contact information management
  - Permit expiry tracking (Mayor's Permit, DTI)

- **Form Fields**:
  - Company Name (required)
  - TIN Number (validated 12-digit)
  - Address (required, textarea)
  - Contact Person (required)
  - Contact Email (validated)
  - PhilGEPS Number
  - Mayor's Permit Expiry (date)
  - DTI Expiry (date)
  - Industry Categories (multi-select)
  - Blacklist toggle with reason

### 6. **Procurement Activities & Timeline Tab**
- **Table Columns**: Activity Name, Sequence Order, Min Days, Max Days, Default Days, APP Milestone
- **Features**:
  - Two-panel mode mapping interface
  - Left panel: List of procurement modes
  - Right panel: Checklist of activities mapped to selected mode
  - APP milestone badges

- **Form Fields**:
  - Activity Name (required)
  - Sequence Order (number)
  - Min Days (number)
  - Max Days (number)
  - Default Days (number, with validation)
  - Is APP Milestone (checkbox)

## RBAC Implementation

All components respect the MetaActions permission system:
- **write**: Shows Add/Edit/Delete buttons
- **delete**: Shows delete confirmation
- **read**: Shows export and view functionality
- **approve**: Available for future workflows

### Permission Check Example
```tsx
<PermissionCheck action="write" actions={actions}>
  <Button>Add Item</Button>
</PermissionCheck>
```

## Navigation Integration

The Procurement Library is added to the main navigation under Planning > Settings:

```
Planning (icon: HomeIcon)
  ├── Overview
  ├── Office
  ├── KPI
  ├── OPCR
  └── Settings (icon: Settings)
      └── Procurement Library
```

**Route**: `/v1/planning/settings/procurement-library`

## Component Architecture

### Type System (`types/index.ts`)
Defines all TypeScript interfaces:
- `ItemMaster` & `ItemMasterFormData`
- `ModeOfProcurement` & `ModeOfProcurementFormData`
- `PriceCatalogueItem` & `PriceCatalogueFormData`
- `UnitOfMeasurement` & `UnitOfMeasurementFormData`
- `SupplierRegistry` & `SupplierRegistryFormData`
- `ProcurementActivity` & `ProcurementActivityFormData`
- `ActivityModeMapping`

### Table System
Each tab has a standardized table structure using `TemplateTable`:
- **Column Definitions**: Located in `{feature}/table/index.ts`
- **Toolbar**: Located in `{feature}/table/Toolbar.tsx`
- Uses TanStack React Table for sorting, filtering, pagination

### Dialog System
Each tab with CRUD operations uses:
- **Create Dialog**: `{feature}/dialog/Create{Feature}Dialog.tsx`
- **Form Component**: `{feature}/dialog/{Feature}Form.tsx`
- Uses `ResponsiveDialog` wrapper for consistent styling

## Mock Data

All tabs use mock data generators for demonstration:
- `generateMockItemMasters()`: Creates sample items
- `generateMockModes()`: Creates procurement modes
- `generateMockPriceCatalogue()`: Creates price entries with historical data
- `generateMockUOMs()`: Creates units with parent relationships
- `generateMockSuppliers()`: Creates supplier entries
- `generateMockActivities()`: Creates procurement activities

**Note**: Replace these generators with actual API calls in production.

## API Integration Points (TODO)

When connecting to backend, replace mock data with API calls in these locations:

### Item Master
- `ItemMasterTab.tsx`: Replace `generateMockItemMasters()` with API call
- `ItemMasterForm.tsx`: Add POST/PUT call in `handleSubmit()`

### Modes of Procurement
- `ModesOfProcurementTab.tsx`: Replace `generateMockModes()` with API call
- `ModeOfProcurementForm.tsx`: Add POST/PUT call

### Price Catalogue
- `PriceCatalogueTab.tsx`: Add API call for fiscal year filtering
- `PriceCatalogueForm.tsx`: Add POST/PUT call

### Unit of Measurement
- `UnitOfMeasurementTab.tsx`: Replace `generateMockUOMs()` with API call
- `UnitOfMeasurementForm.tsx`: Add POST/PUT call

### Suppliers
- `SuppliersTab.tsx`: Replace `generateMockSuppliers()` with API call
- `SupplierRegistryForm.tsx`: Add POST/PUT call, TIN validation via API

### Procurement Activities
- `ProcurementActivitiesTab.tsx`: Replace `generateMockActivities()` with API call
- Mode mapping: Add API call to save mappings
- `ProcurementActivityForm.tsx`: Add POST/PUT call

## Design System Components Used

- `PageContainer`: Main page layout wrapper
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Tab navigation
- `TemplateTable`: Reusable table component with sorting/filtering
- `ResponsiveDialog`: Modal dialog for forms
- `Button`: Action buttons
- `Input`: Text input fields
- `Textarea`: Multi-line text
- `Select`: Dropdown selections
- `Checkbox`: Boolean toggles
- `Badge`: Status and flag indicators
- `Card`: Section containers
- `Label`: Form labels
- `FieldInfo`: Helper text for complex fields
- `DebouncedInput`: Search input with debouncing

## Styling Notes

- Uses Tailwind CSS with `cn()` utility for conditional classes
- Responsive design adapts to mobile (md: breakpoint)
- Consistent spacing and sizing throughout
- Government system professional appearance
- Color scheme: Uses Shadcn UI default palette

## Features Requiring Backend Implementation

1. **CSV Import/Export**: Currently console.log, implement actual file handling
2. **Search & Filtering**: Uses TanStack React Table, ready for API integration
3. **Pagination**: Built-in with TemplateTable, configure page size as needed
4. **Form Validation**: Currently client-side, add server validation
5. **Soft Delete**: UI hides deleted records, configure filter logic
6. **Price History**: Mock data includes historical prices, needs API integration
7. **TIN Validation**: Currently regex-based, add BIR verification API
8. **PhilGEPS Integration**: Currently text input, add PhilGEPS registry lookup
9. **Activity Mode Mapping**: Currently state-based, add persistence

## Testing Considerations

- All forms include validation with error display
- RBAC permissions tested with different action arrays
- Tables handle empty states gracefully
- Currency formatting tested with various amounts
- Date pickers for expiry dates
- Multi-select with add/remove functionality

## Performance Optimizations

- Uses `DebouncedInput` for search to reduce re-renders
- Tables implement virtual scrolling capability (TemplateTable)
- Modal dialogs lazy-loaded on demand
- Components properly memoized for re-render prevention

## Future Enhancements

1. Add bulk import functionality with validation
2. Implement export templates for different formats (Excel, PDF)
3. Add approval workflow for changes
4. Implement activity timeline visualization
5. Add price analytics and forecasting
6. Supplier performance metrics dashboard
7. Audit trail for all changes
8. Batch operations for multiple items
