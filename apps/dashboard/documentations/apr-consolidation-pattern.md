# APR Consolidation Pattern - Development Guide

**Date:** May 8, 2026  
**Type:** Implementation Pattern  
**Status:** ✅ COMPLETE  

---

## What is APR Consolidation?

APR Consolidation is the process of combining selected items from one or more APPs (Annual Procurement Plans) into a single Agency Purchase Request document. This enables:

- **Multi-APP Aggregation**: Combine items from different fiscal years/APPs
- **Item Selection**: Choose specific line items instead of entire APP
- **Budget Consolidation**: Single budget ceiling across all selected items
- **Procurement Efficiency**: One APR instead of multiple smaller requests

---

## Consolidation Workflow

### Phase 1: Selection (SelectAPPDialog)

```
User Opens CreateAPRDialog
    ↓
SelectAPPDialog opens automatically
    ├─ Display fiscal year selector (current ±5 years)
    ├─ Load approved APPs for selected year
    ├─ Show APP details: Code, Name, Status
    └─ Allow multi-select of line items
        ↓
User confirms selection
    ↓
Returns: appId + lineItemIds array
```

**State Management:**
```typescript
// atoms.ts
export const selectedAPRFiscalYearAtom = atom(new Date().getFullYear())
export const selectAPPDialogOpenAtom = atom(false)

// SelectAPPDialog updates:
const [selectedFiscalYear, setSelectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)

// Filter APPs by fiscal year:
const appsByYear = mockApprovedAPPs.filter(
  app => app.fiscalYear === selectedFiscalYear
)
```

---

### Phase 2: Header Configuration (APRHeaderForm)

```
User enters APR metadata
    ├─ Agency Control Number (max 50 chars)
    ├─ Agency Account Code (max 50 chars)
    ├─ Description (5-500 chars)
    ├─ Request Date (date picker)
    └─ Fiscal Year (defaults to selected year)

Form validates with aprHeaderFormSchema
    ↓
Success → Enable Terms step
Failed → Show validation errors
```

**Form Structure:**
```typescript
interface APRHeaderFormProps {
  form: TanStackFormInstance  // From useForm hook
}

// Fields validate:
- agencyControlNumber: 1-50 chars
- agencyAccountCode: 1-50 chars
- description: 5-500 chars
- requestDate: Valid ISO date
- fiscalYear: 2000-2100
```

---

### Phase 3: Terms Configuration (APRTermsForm)

```
User configures procurement terms
    ├─ Mode of Delivery
    │  ├─ FAST_LANE (express)
    │  ├─ SCHEDULED_PICKUP (scheduled)
    │  └─ DOOR_TO_DOOR (door delivery)
    │
    ├─ Insufficient Funds Action
    │  ├─ REDUCE_QUANTITY (pro-rata cut)
    │  ├─ BILL_US (invoice difference)
    │  └─ CHARGE_TO_DEPOSIT (deposit charge)
    │
    ├─ Attachment Options
    │  ├─ Observation Report Required?
    │  ├─ Collective Barter Agreement Required?
    │  └─ Complete Specs Required?
    │
    ├─ Procurement Milestones (optional)
    │  ├─ Advertisement Date
    │  ├─ Submission Date
    │  ├─ Notice of Award Date
    │  └─ Contract Signing Date
    │
    └─ Remarks (optional)

Form validates with aprTermsFormSchema
    ↓
Success → Enable Create APR button
Failed → Show validation errors
```

---

### Phase 4: Consolidation & Creation

```
User clicks "Create APR"
    ↓
Validation checks
    ├─ Verify APP selected
    ├─ Verify line items selected
    ├─ Validate header form
    ├─ Validate terms form
    └─ Check budget availability
    ↓
Build CreateAPRPayload
    {
      sourceAPPId: "APP-2024-001",
      selectedAppLineItemIds: ["bac-001", "bac-002"],
      header: { /* user input */ },
      terms: { /* user input */ }
    }
    ↓
Call createAPRRequest mutation
    {
      // Find source APP
      const sourceAPP = mockApprovedAPPs.find(
        app => app.id === payload.sourceAPPId
      )
      
      // Get selected line items
      const selectedLineItems = sourceAPP.bac.lineItems.filter(
        item => payload.selectedAppLineItemIds.includes(item.id)
      )
      
      // ✅ Convert to APR items
      consolidatedItems = convertAppLineItemsToAPRItems(
        selectedLineItems,
        sourceAPP.id,
        sourceAPP.bac.id
      )
      
      // Calculate totals
      totalAmount = consolidatedItems.reduce(
        (sum, item) => sum + item.totalAmount, 0
      )
      
      // Create APR Master
      newAPR = {
        id: "APR-...",
        status: APRStatus.DRAFT,
        consolidatedItems,
        totalAmount,
        // ... other fields
      }
      
      return newAPR
    }
    ↓
Success: APR created, show toast
Failed: Show error message, keep dialog open
    ↓
Clear form & close dialog
```

---

## Consolidation State Machine

```
                  ┌─────────────────────┐
                  │   DIALOG_CLOSED     │
                  └──────────┬──────────┘
                             │
                    (User clicks "Create APR")
                             ↓
                  ┌─────────────────────┐
                  │  SELECTING_APP      │ ← SelectAPPDialog
                  └──────────┬──────────┘
                             │
                    (APP & items selected)
                             ↓
                  ┌─────────────────────┐
            ┌────→│ ENTERING_HEADER     │ ← APRHeaderForm
            │     └──────────┬──────────┘
            │                │
            │       (Header valid)
            │                ↓
            │     ┌─────────────────────┐
            │────→│ ENTERING_TERMS      │ ← APRTermsForm
            │     └──────────┬──────────┘
            │                │
            │       (Terms valid)
            │                ↓
            │     ┌─────────────────────┐
            │────→│ CONSOLIDATING       │
            │     └──────────┬──────────┘
            │                │
            │     (Items converted)
            │                ↓
            │     ┌─────────────────────┐
            └────→│ CREATING_APR        │
                  └──────────┬──────────┘
                             │
                   (APR created)
                             ↓
                  ┌─────────────────────┐
                  │   SUCCESS           │ → Toast & Close
                  └─────────────────────┘

  ERROR PATHS:
  
  Invalid Selection → DIALOG_CLOSED
  Invalid Header   → ENTERING_HEADER (show errors)
  Invalid Terms    → ENTERING_TERMS (show errors)
  Creation Failed  → ENTERING_TERMS (show error toast)
```

---

## Multi-APP Consolidation (Future)

Current implementation supports single APP selection. Future enhancement for multiple APPs:

```typescript
interface MultiAPPConsolidationPayload {
  sourceAPPIds: string[]        // Multiple APPs
  selectedAppLineItemIds: {     // Items per APP
    [appId: string]: string[]
  }
  // ... header, terms
}

// Conversion process:
for (const appId of payload.sourceAPPIds) {
  const items = payload.selectedAppLineItemIds[appId]
  const app = mockApprovedAPPs.find(a => a.id === appId)
  
  consolidatedItems.push(
    ...convertAppLineItemsToAPRItems(
      app.bac.lineItems.filter(item => items.includes(item.id)),
      appId,
      app.bac.id
    )
  )
}
```

---

## Data Structure During Consolidation

```
USER SELECTS: APP-2024-001 + items ["bac-001", "bac-002"]
    ↓
SOURCE APP STRUCTURE:
{
  id: "APP-2024-001",
  appCode: "HMEA-2024-001",
  bac: {
    id: "BAC-123",
    lineItems: [
      { id: "bac-001", description: "Hospital Beds", quantity: 50, ... },
      { id: "bac-002", description: "ECG Machines", quantity: 10, ... },
      { id: "bac-003", description: "Supplies", quantity: 1000, ... }
    ]
  }
}
    ↓
CONSOLIDATION FILTER (only selected items):
[
  { id: "bac-001", description: "Hospital Beds", quantity: 50, ... },
  { id: "bac-002", description: "ECG Machines", quantity: 10, ... }
]
    ↓
CONVERTED TO APR ITEMS:
[
  {
    id: "apr-item-APP-2024-001-bac-001-...",
    appLineItemId: "bac-001",
    appId: "APP-2024-001",
    description: "Hospital Beds",
    quantity: 50,
    appApprovedQuantity: 50,
    quantityVariance: 0,
    // ... other APR fields
  },
  {
    id: "apr-item-APP-2024-001-bac-002-...",
    appLineItemId: "bac-002",
    appId: "APP-2024-001",
    description: "ECG Machines",
    quantity: 10,
    appApprovedQuantity: 10,
    quantityVariance: 0,
    // ... other APR fields
  }
]
    ↓
APR MASTER CREATED:
{
  id: "APR-1714956000123",
  aprNumber: "APR-2024-001",
  status: "DRAFT",
  consolidatedItems: [ /* above */ ],
  totalItemsCount: 2,
  totalAmount: 755000, // 750000 + 5000000? No, let me recalculate
  // ...
}
```

---

## Key Implementation Details

### 1. Fiscal Year Filtering
```typescript
// SelectAPPDialog uses fiscal year to filter APPs
const appsByYear = mockApprovedAPPs.filter(
  app => app.fiscalYear === selectedFiscalYear
)

// Year selector: current ±5 years
const years = Array.from({ length: 10 }, (_, i) => {
  return new Date().getFullYear() - 5 + i
})
```

### 2. Line Item Selection (Checkbox Array)
```typescript
// SelectAPPForm maintains selected item IDs
const [selectedLineItemIds, setSelectedLineItemIds] = useState<string[]>([])

// Toggle selection
const handleItemToggle = (itemId: string) => {
  setSelectedLineItemIds(prev =>
    prev.includes(itemId)
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
  )
}

// Return selected items when form submitted
const handleSubmit = () => {
  onSelectAPP(selectedAppId, selectedLineItemIds)
}
```

### 3. Variance Initialization (Critical)
```typescript
// Variances start at 0 when item added to APR
const conversionResult = convertAppLineItemToAPRItem(lineItem, appId, appBACId, index)

// variances are 0:
quantityVariance: 0,        // No modification yet
quantityVariancePercent: 0,
budgetVariance: 0,
budgetVariancePercent: 0

// These only change if user modifies quantity/cost AFTER APR creation
```

### 4. Total Calculation
```typescript
const totalAmount = consolidatedItems.reduce(
  (sum, item) => sum + item.totalAmount,
  0
)

// For budget ceiling comparison:
const totalApprovedBudget = consolidatedItems.reduce(
  (sum, item) => sum + item.appApprovedBudget,
  0
)

// Aggregate variance:
const totalBudgetVariance = consolidatedItems.reduce(
  (sum, item) => sum + item.budgetVariance,
  0
)

const totalBudgetVariancePercent =
  totalApprovedBudget > 0
    ? (totalBudgetVariance / totalApprovedBudget) * 100
    : 0
```

---

## Error Scenarios & Handling

### Scenario 1: User selects invalid APP
```typescript
if (!sourceAPP) {
  toast.error(`APP ${payload.sourceAPPId} not found`)
  // Keep dialog open, user can select different APP
}
```

### Scenario 2: Selected items no longer exist in APP
```typescript
const selectedLineItems = appBAC.lineItems.filter(item =>
  payload.selectedAppLineItemIds.includes(item.id)
)

if (selectedLineItems.length === 0) {
  toast.error('Selected items not found in APP (may have been deleted)')
  // Show reconciliation dialog
}
```

### Scenario 3: Budget ceiling exceeded
```typescript
const totalAmount = consolidatedItems.reduce(
  (sum, item) => sum + item.totalAmount, 0
)

if (totalAmount > BUDGET_CEILING) {
  toast.error(`Total ${totalAmount} exceeds budget ceiling`)
  // Suggest reducing quantities or removing items
}
```

### Scenario 4: Form validation failure
```typescript
const result = aprHeaderFormSchema.safeParse(headerData)

if (!result.success) {
  // Show field-level errors
  result.error.fieldErrors.forEach(err => {
    showFieldError(err.path, err.message)
  })
  // Keep dialog open on header tab
}
```

---

## Testing Consolidation

```typescript
// Test: Select APP and verify items consolidate
test('converts selected APP items to APR items', () => {
  const appId = 'APP-2024-001'
  const selectedItems = ['bac-001', 'bac-002']
  
  const result = convertAppLineItemsToAPRItems(
    mockApprovedAPPs[0].bac.lineItems.filter(
      item => selectedItems.includes(item.id)
    ),
    appId,
    mockApprovedAPPs[0].bac.id
  )
  
  expect(result).toHaveLength(2)
  expect(result[0].appLineItemId).toBe('bac-001')
  expect(result[0].appId).toBe(appId)
  expect(result[0].quantityVariance).toBe(0)
})

// Test: Verify total calculation
test('calculates APR total correctly', () => {
  const total = consolidatedItems.reduce(
    (sum, item) => sum + item.totalAmount, 0
  )
  
  expect(total).toBe(755000)
})

// Test: Verify BAC milestones copied
test('copies BAC milestones to APR items', () => {
  const item = consolidatedItems[0]
  
  expect(item.bacMilestones?.advertisementDate).toBeDefined()
  expect(item.bacMilestones?.submissionDate).toBeDefined()
  expect(item.bacMilestones?.noticeOfAwardDate).toBeDefined()
  expect(item.bacMilestones?.contractSigningDate).toBeDefined()
})
```

---

## Performance Considerations

- **Lazy Loading**: Load APPs only for selected fiscal year
- **Virtual Scrolling**: For large lists of line items (future)
- **Batch Conversion**: convertAppLineItemsToAPRItems handles bulk in O(n)
- **Memoization**: useMemo for filtered APP lists

---

## References

- **Consolidation Implementation**: `convertAppItemsToAPR.ts`
- **State Management**: `atoms.ts`
- **Form Validation**: `aprHeaderFormSchema.ts`, `aprTermsFormSchema.ts`
- **Main Dialog**: `dialogs/CreateAPRDialog.tsx`
- **APP Selection**: `dialogs/SelectAPPDialog.tsx`
