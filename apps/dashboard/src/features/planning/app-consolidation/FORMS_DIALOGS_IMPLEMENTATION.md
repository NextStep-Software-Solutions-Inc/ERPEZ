# APP Consolidation Feature - Forms & Dialogs Implementation

## Overview
Completed implementation of form and dialog components following the budget-allocation pattern with proper separation of concerns.

## Folder Structure

```
src/features/planning/app-consolidation/
├── forms/                     # Reusable form components
│   ├── PPMPSelectionForm.tsx  # Item selection table with checkboxes
│   ├── BACConfigurationForm.tsx # BAC workspace configuration wrapper
│   ├── SignatoryForm.tsx      # Signatory input form (Updated)
│   └── index.ts               # Barrel exports
├── dialogs/                   # Dialog wrappers (state management)
│   ├── CreateAPPDialog.tsx    # 5-step multi-page dialog with button protection
│   ├── UpdateAPPDialog.tsx    # Edit existing APP with signatories & BAC
│   ├── DeleteAPPDialog.tsx    # Bulk delete confirmation
│   └── index.ts               # Barrel exports
├── tables/                    # Data display tables (TemplateTable pattern)
│   ├── Column.tsx             # ColumnDef array (6 columns)
│   ├── Toolbar.tsx            # Search, filter, export controls
│   ├── AppActions.tsx         # Row dropdown menu
│   └── index.ts               # Barrel exports
├── components/                # Supporting components
│   ├── PPMPSelector.tsx       # Item selection (used in dialog step 1)
│   ├── AggregationPreview.tsx # Aggregation summary (used in dialog step 2)
│   ├── BACWorkspace.tsx       # Multi-tab BAC editor (used in dialog step 3)
│   └── index.ts               # Barrel exports
├── handlers/                  # API blueprints (Query/Mutation)
├── atoms.ts                   # Jotai state management
├── types.ts                   # TypeScript interfaces
└── index.ts                   # Feature barrel export
```

## Forms Architecture

### PPMPSelectionForm
- **Purpose**: Select PPMP items for APP
- **Props**: 
  - `ppmpData: PPMPItem[]` - Available items
  - `onConfirm?: (items: PPMPItem[]) => void` - Selection callback
  - `selectedItems?: PPMPItem[]` - Pre-selected items
- **Features**:
  - TanStack Table with checkbox column
  - Global search filter
  - Selected count display
  - Confirm button with validation

### BACConfigurationForm
- **Purpose**: Configure Budget Alignment Checklist
- **Props**:
  - `appData: AppMaster` - Current APP data
  - `onConfirm?: (data: AppMaster) => void` - Save callback
  - `onChange?: (data: AppMaster) => void` - Real-time update
- **Features**:
  - Wraps BACWorkspace component
  - Handles state synchronization
  - Confirm button for completion

### SignatoryForm (Enhanced)
- **Purpose**: Input signatory information
- **Props**:
  - `onSave?: (signatories: SignatoryBlock) => void` - Save callback
  - `initialData?: SignatoryBlock` - Pre-filled data
- **Features**:
  - 4 signatory sections (Prepared By, Reviewed By, Approved By, Certified By)
  - Prepared By auto-filled from current user
  - Manual input for other roles
  - State-based (no TanStack Form)

## Dialog Architecture

### CreateAPPDialog
- **Flow**: 5-step multi-page process
  1. **Select PPMP**: PPMPSelectionForm (item selection with checkboxes)
  2. **Aggregation**: AggregationPreview (items grouped by unit, totals, budget summary)
  3. **BAC**: BACWorkspace (Mode of Procurement, Schedules, Remarks, EPA)
  4. **Signatories**: SignatoryForm (4 signatory sections)
  5. **Review**: Summary with submit button
- **Button Protection**:
  - `isCreating` state (prevents multiple submissions)
  - `isNavigating` state (prevents rapid step changes)
  - Combined guard: `isDialogDisabled = isCreating || isNavigating`
  - useCallback hooks for all handlers
  - All buttons disabled during async operations
- **Features**:
  - Badge-based step indicator (clickable for previous steps only)
  - Visual feedback during operations ("Loading...", "Creating...")
  - Prevents dialog closure during operations
  - Resets state after successful creation

### UpdateAPPDialog
- **Purpose**: Edit existing APP
- **Sections**:
  - Signatories section (using SignatoryForm)
  - BAC Configuration section (using BACWorkspace)
- **Button Protection**:
  - `isUpdating` state
  - `isDirty` check (tracks changes)
  - Unsaved changes warning before discard
  - Buttons disabled during update
- **Features**:
  - Detects dirty state (compares JSON serialization)
  - Shows unsaved warning if changes detected
  - Save button disabled if no changes
  - Real-time form updates via Jotai atoms

### DeleteAPPDialog  
- **Purpose**: Confirm deletion of APP records
- **Props**:
  - `open: boolean` - Dialog visibility
  - `onOpenChange?: (open: boolean) => void` - State callback
  - `appIds: string[]` - IDs to delete
  - `onSuccess?: () => void` - Success callback
- **Features**:
  - Uses AlertDialog component
  - Supports bulk delete (multiple appIds)
  - Updates appListAtom after deletion
  - Loading state during deletion
  - Toast notifications (success/error)

## Component Patterns

### Button Protection Pattern
```tsx
const [isCreating, setIsCreating] = useState(false)
const [isNavigating, setIsNavigating] = useState(false)
const isDisabled = isCreating || isNavigating

const handleAction = useCallback(async () => {
  if (isDisabled) return
  setIsCreating(true) // or setIsNavigating(true)
  try {
    // Async operation
  } finally {
    setIsCreating(false)
  }
}, [isDisabled])

return <Button disabled={isDisabled}>Action</Button>
```

### Form Component Pattern
```tsx
interface FormProps {
  onSave?: (data: Data) => void
  initialData?: Data
}

export function Form({ onSave, initialData }: FormProps) {
  const [data, setData] = useState(initialData || defaultValue)
  
  const handleSave = () => {
    onSave?.(data)
  }

  return (
    <Card>
      {/* Form UI */}
      <Button onClick={handleSave}>Save</Button>
    </Card>
  )
}
```

### Dialog Wrapper Pattern
```tsx
const [open, setOpen] = useAtom(dialogAtom)
const [data, setData] = useAtom(dataAtom)

export function Dialog() {
  const handleSubmit = async (formData: Data) => {
    // API call
    setData(formData)
    setOpen(false)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <Form onSave={handleSubmit} />
    </ResponsiveDialog>
  )
}
```

## State Management (Jotai Atoms)

### Dialog State Atoms
- `createAPPDialogOpenAtom` - Create dialog visibility
- `appPreviewDialogOpenAtom` - Preview dialog visibility
- `supplementalAPPDialogOpenAtom` - Supplemental APP dialog visibility
- `appDetailsDialogOpenAtom` - Details/edit dialog visibility

### Data Atoms
- `currentAppAtom` - Currently selected APP
- `appListAtom` - List of all APPs
- `selectedPPMPDataAtom` - Selected PPMP items
- `bacWorkspaceAtom` - BAC workspace data
- `signatoryBlockAtom` - Signatory data

### UI Atoms
- `bacWorkspaceTabAtom` - Active BAC tab (mop|schedules|remarks|epa)
- `appListFilterAtom` - Table filter state (search, status, fiscal year)
- `appListSortingAtom` - Table sorting state
- `appListPaginationAtom` - Table pagination state

### Loading Atoms
- `appCreationLoadingAtom` - Create operation loading state
- `appExportLoadingAtom` - Export operation loading state
- `batchDeleteLoadingAtom` - Batch delete operation loading state

## Import Patterns

### Using Barrel Exports (Recommended)
```tsx
// Forms
import { PPMPSelectionForm, BACConfigurationForm, SignatoryForm } from '@/features/planning/app-consolidation/forms'

// Dialogs
import { CreateAPPDialog, UpdateAPPDialog, DeleteAPPDialog } from '@/features/planning/app-consolidation/dialogs'

// Tables
import { Column, Toolbar, AppActions } from '@/features/planning/app-consolidation/tables'

// Components
import { PPMPSelector, AggregationPreview, BACWorkspace } from '@/features/planning/app-consolidation/components'
```

### Direct Imports (When Needed)
```tsx
import PPMPSelectionForm from '@/features/planning/app-consolidation/forms/PPMPSelectionForm'
```

## Key Implementation Details

### Multi-Step Dialog Navigation
- Steps are ordered in `stepOrder` array
- Current step stored in component state
- Badge-based indicator allows navigation to previous steps only
- Next/Back buttons update step state via `setCurrentStep()`
- Review step shows summary before final submission

### Dirty State Detection
- Compares JSON serialization: `JSON.stringify(formData) !== JSON.stringify(currentApp)`
- Used in UpdateAPPDialog to detect changes
- Prevents discard without warning if changes made

### Table Integration
- TemplateTable accepts `Column` (ColumnDef array)
- Toolbar accepts `Table<AppMaster>` prop
- AppActions component renders dropdown menu for each row
- Consistent with budget-allocation feature pattern

### API Integration Points (TODO)
- CreateAPPDialog: `await new Promise()` → Replace with `createAPPRequest` mutation
- UpdateAPPDialog: `await new Promise()` → Replace with `updateAPPRequest` mutation
- DeleteAPPDialog: `await new Promise()` → Replace with `deleteAPPRequest` mutation

## Files Modified/Created

✅ **Created**:
- `forms/PPMPSelectionForm.tsx` (TemplateTable-based item selector)
- `forms/BACConfigurationForm.tsx` (BAC configuration wrapper)
- `forms/index.ts` (Barrel export)
- `dialogs/UpdateAPPDialog.tsx` (Edit dialog with unsaved warning)
- `dialogs/DeleteAPPDialog.tsx` (Confirmation dialog)
- `dialogs/index.ts` (Barrel export)
- `tables/Column.tsx` (Renamed from .ts, ColumnDef array)
- `components/index.ts` (Barrel export)

✅ **Modified**:
- `forms/SignatoryForm.tsx` (Added `initialData` prop support)
- `dialogs/CreateAPPDialog.tsx` (Already implemented with button protection)
- `tables/Toolbar.tsx` (Fixed import paths)
- `tables/index.ts` (Barrel export)
- `tables/AppToolbar.tsx` (Fixed import paths)

✅ **Verified**:
- All files compile without errors
- No unused imports or variables
- Proper type inference and safety
- 200-line max constraint maintained

## Next Steps

1. **API Integration**:
   - Replace mock `await new Promise()` calls with actual API mutations
   - Use `createMutationHookFromTemplate()` from erpez-shared-lib
   - Implement query invalidation after mutations

2. **Dialog Manager** (Optional):
   - Create centralized dialog manager similar to budget-allocation pattern
   - Consolidate all dialog open/close logic in one place
   - Reduces prop drilling

3. **Edit Form Component** (If Needed):
   - Create separate `UpdateAPPForm.tsx` if form complexity increases
   - Keep UpdateAPPDialog as thin wrapper for dialog state

4. **Task 2: Document Generation**:
   - Implement Excel export with GPPB format
   - Implement PDF export with signatures
   - Use export handlers

5. **Task 3: Supplemental APP Manager**:
   - Extract delta items (net-new items only)
   - Create supplemental APP creation flow
   - Implement sequential naming convention
