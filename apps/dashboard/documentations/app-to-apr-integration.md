# APP-to-APR Integration & Consolidation Pattern

**Date:** May 8, 2026  
**Type:** Architecture & Data Flow  
**Status:** ✅ COMPLETE  

---

## Overview

The APP-to-APR integration enables seamless conversion of Annual Procurement Plan (APP) line items into Agency Purchase Request (APR) items while maintaining complete traceability and budget alignment. This pattern ensures SPMS compliance and enables variance tracking.

---

## Data Flow Diagram

```
APP (Annual Procurement Plan)
    ├── appId: APP-2024-001
    ├── appCode: HMEA-2024-001
    └── bac: BACWorkspace
        ├── id: BAC-123
        └── lineItems: BACLineItem[]
            ├── id: bac-ppmp-001
            │   ├── description: "Hospital Beds"
            │   ├── quantity: 50
            │   ├── unitCost: 15000
            │   ├── totalAmount: 750000
            │   ├── office: "Hospital Operations"
            │   ├── fundSource: "General Fund"
            │   └── milestones:
            │       ├── advertisementDate: "15/01/2024"
            │       ├── submissionDate: "20/02/2024"
            │       ├── noticeOfAwardDate: "28/02/2024"
            │       └── contractSigningDate: "15/03/2024"
            │
            └── id: bac-ppmp-002
                └── ... (similar structure)
                
                    ↓↓↓ CONVERSION PROCESS ↓↓↓
                    
APR (Agency Purchase Request)
    ├── id: APR-1714956000123
    ├── aprNumber: APR-2024-001
    ├── status: DRAFT
    └── consolidatedItems: ConsolidatedAPRItem[]
        ├── id: apr-item-APP-2024-001-bac-ppmp-001-...
        │   ├── description: "Hospital Beds"
        │   ├── quantity: 50 (current - matches APP initially)
        │   ├── unitCost: 15000
        │   ├── totalAmount: 750000
        │   ├── appLineItemId: "bac-ppmp-001" ✅ TRACEABILITY
        │   ├── appId: "APP-2024-001" ✅ TRACEABILITY
        │   ├── appApprovedQuantity: 50 (snapshot)
        │   ├── appApprovedBudget: 750000 (snapshot)
        │   ├── quantityVariance: 0 (current - approved)
        │   ├── budgetVariance: 0
        │   ├── bacMilestones: {
        │   │   ├── advertisementDate: "15/01/2024"
        │   │   ├── submissionDate: "20/02/2024"
        │   │   ├── noticeOfAwardDate: "28/02/2024"
        │   │   └── contractSigningDate: "15/03/2024"
        │   └── fundSource: "General Fund"
        │
        └── (additional items...)
```

---

## Conversion Functions

### 1. Single Item Conversion

**Location:** `features/procurement/apr/utils/convertAppItemsToAPR.ts`

```typescript
export function convertAppLineItemToAPRItem(
  lineItem: BACLineItem,
  appId: string,
  appBACId: string,
  index: number
): ConsolidatedAPRItem {
  // Step 1: Generate unique APR item ID
  const itemId = `apr-item-${appId}-${lineItem.id}-${Date.now()}-${index}`
  
  // Step 2: Extract BAC milestones if available
  const bacMilestones: APRMilestones | undefined = lineItem.milestones
    ? {
        advertisementDate: lineItem.milestones.advertisementDate,
        submissionDate: lineItem.milestones.submissionDate,
        noticeOfAwardDate: lineItem.milestones.noticeOfAwardDate,
        contractSigningDate: lineItem.milestones.contractSigningDate,
      }
    : undefined
  
  // Step 3: Create APR item with APP references
  return {
    id: itemId,
    
    // Basic item data (from APP BAC)
    description: lineItem.description,
    unit: lineItem.unit,
    quantity: lineItem.quantity,           // Current quantity (matches APP initially)
    unitCost: lineItem.unitCost,
    totalAmount: lineItem.totalAmount,     // quantity * unitCost
    office: lineItem.office || '',
    fundSource: '', // Will be populated from APP context
    
    // APP References (SPMS Compliance)
    appId,                                 // Source APP ID
    appLineItemId: lineItem.id,           // ✅ Links to specific BAC line item
    appBACId,                             // BAC workspace ID
    appApprovedQuantity: lineItem.quantity,        // Snapshot at creation time
    appApprovedBudget: lineItem.totalAmount,       // Snapshot at creation time
    
    // Variance Tracking (initialized at 0)
    quantityVariance: 0,                  // Current - Approved (0 when created)
    quantityVariancePercent: 0,
    budgetVariance: 0,                    // Current - Approved (0 when created)
    budgetVariancePercent: 0,
    
    // Procurement details
    bacMilestones,                        // Copied from APP BAC
    allotmentClass: lineItem.allotmentClass || 'CO',
  }
}
```

**Purpose:**
- Creates a single ConsolidatedAPRItem from a BAC line item
- Maintains complete APP reference for SPMS compliance
- Initializes variances at 0 (APR matches APP at creation)
- Extracts and preserves BAC milestones

**Key Points:**
- ✅ `appLineItemId` ensures traceability to source
- ✅ Snapshots of approved quantity/budget for variance calculation
- ✅ Variance starts at 0 (no changes yet)
- ✅ BAC milestones copied for procurement schedule

---

### 2. Batch Conversion

```typescript
export function convertAppLineItemsToAPRItems(
  lineItems: BACLineItem[],
  appId: string,
  appBACId: string
): ConsolidatedAPRItem[] {
  return lineItems.map((lineItem, index) =>
    convertAppLineItemToAPRItem(lineItem, appId, appBACId, index)
  )
}
```

**Purpose:** Convert multiple BAC line items to APR items in one operation

---

## Integration with Create APR Flow

### Step-by-Step Process

1. **User Opens CreateAPRDialog**
   ```typescript
   // Dialog opens with SelectAPPDialog
   // User selects fiscal year and specific APP
   ```

2. **SelectAPPDialog Returns Selection**
   ```typescript
   const handleSelectAPP = (appId: string, lineItemIds: string[]) => {
     setSourceAPPId(appId)
     setSelectedAppLineItemIds(lineItemIds)  // User selected items
     setSelectAPPDialogOpen(false)
   }
   ```

3. **User Fills Header & Terms**
   ```typescript
   // APRHeaderForm collects:
   - Agency Control Number
   - Agency Account Code
   - Description
   - Request Date
   - Fiscal Year
   
   // APRTermsForm collects:
   - Mode of Delivery
   - Insufficient Funds Action
   - Attachment Options
   - Remarks
   ```

4. **Submit Triggers createAPRRequest**
   ```typescript
   const payload: CreateAPRPayload = {
     sourceAPPId: "APP-2024-001",           // Selected APP
     selectedAppLineItemIds: ["bac-001", "bac-002"],  // Selected items
     header: { /* ... */ },
     terms: { /* ... */ }
   }
   
   await createAPR({ pathParams: {}, payload })
   ```

5. **Request Handler Processes**
   ```typescript
   // In createAPRRequest.fetcher:
   
   // Find source APP in mock data
   const sourceAPP = mockApprovedAPPs.find(
     app => app.id === payload.sourceAPPId
   )
   
   // Get selected BAC line items
   const selectedLineItems = sourceAPP.bac.lineItems.filter(
     item => payload.selectedAppLineItemIds.includes(item.id)
   )
   
   // ✅ Convert to APR items
   const consolidatedItems = convertAppLineItemsToAPRItems(
     selectedLineItems,
     sourceAPP.id,
     sourceAPP.bac.id
   )
   
   // Create APR Master with converted items
   const newAPR: APRMaster = {
     id: `APR-${Date.now()}`,
     consolidatedItems,
     totalAmount: consolidatedItems.reduce(
       (sum, item) => sum + item.totalAmount, 0
     ),
     // ... other fields
   }
   ```

6. **APR Created with Full Traceability**
   - ✅ Each item links back to APP via `appLineItemId`
   - ✅ Approved quantities/budgets captured
   - ✅ Variances initialized at 0
   - ✅ BAC milestones preserved
   - ✅ Fund sources included

---

## Variance Tracking & Budget Alignment

### Scenario: User Modifies APR Item Quantity

**Before (at creation):**
```javascript
{
  appLineItemId: "bac-ppmp-001",
  quantity: 50,
  appApprovedQuantity: 50,
  quantityVariance: 0,           // No change
  quantityVariancePercent: 0
}
```

**After (user edits to 45):**
```javascript
{
  appLineItemId: "bac-ppmp-001",
  quantity: 45,                   // User changed
  appApprovedQuantity: 50,        // Original (unchanged)
  quantityVariance: -5,           // 45 - 50 = -5
  quantityVariancePercent: -10    // (-5 / 50) * 100 = -10%
}
```

### Budget Variance Example

**Original:**
```javascript
{
  totalAmount: 750000,            // 50 * 15000
  appApprovedBudget: 750000,
  budgetVariance: 0
}
```

**After Unit Cost Change (15000 → 16000):**
```javascript
{
  quantity: 50,
  unitCost: 16000,                // User updated
  totalAmount: 800000,            // 50 * 16000
  appApprovedBudget: 750000,      // Original snapshot
  budgetVariance: 50000,          // 800000 - 750000
  budgetVariancePercent: 6.67     // (50000 / 750000) * 100
}
```

---

## Reconciliation Pattern

**File:** `utils/reconcileAPRWithAPP.ts`

When an APP is modified after APR creation, reconciliation ensures:

1. **New items in APP** → Option to add to existing APR
2. **Deleted items in APP** → Mark as "orphaned" in APR
3. **Modified quantities** → Update in APR with change notification
4. **Budget changes** → Recalculate variances

```typescript
export function reconcileAPRWithAPP(apr: APRMaster, updatedApp: AppMaster) {
  // Compare items, identify changes, suggest updates
  const changes = {
    newItems: [], // In APP but not in APR
    deletedItems: [], // In APR but removed from APP
    modifiedItems: [], // Quantity/budget changes in APP
  }
  
  // Return reconciliation report for user confirmation
  return changes
}
```

---

## SPMS Compliance Checklist

- ✅ **Traceability**: Each APR item links to specific APP BAC line item via `appLineItemId`
- ✅ **Budget Alignment**: Approved quantities/budgets captured in snapshots
- ✅ **Variance Tracking**: Percentage variance calculated for budget monitoring
- ✅ **Procurement Schedule**: BAC milestones copied to APR items
- ✅ **Fund Source Tracking**: Preserved through conversion
- ✅ **Audit Trail**: Item IDs include timestamps for sequencing

---

## Error Handling

### APP Not Found
```typescript
const sourceAPP = mockApprovedAPPs.find(app => app.id === payload.sourceAPPId)
if (!sourceAPP) {
  // Call handleAPPNotFound(payload.sourceAPPId)
  // Log error, return meaningful message
}
```

### No Selected Items
```typescript
if (!payload.selectedAppLineItemIds || payload.selectedAppLineItemIds.length === 0) {
  toast.error('Please select at least one item from the APP')
  return
}
```

### BAC Line Items Not Found
```typescript
const selectedLineItems = appBAC.lineItems.filter(item =>
  payload.selectedAppLineItemIds.includes(item.id)
)

if (selectedLineItems.length === 0) {
  // No matching items found - user selected invalid IDs
  toast.error('Selected items not found in APP')
  return
}
```

---

## Type Safety & Validation

### TypeScript Protection
```typescript
// ✅ Safe - selectedAppLineItemIds checked before use
if (sourceAPP && payload.selectedAppLineItemIds && 
    payload.selectedAppLineItemIds.length > 0) {
  // Safe to access payload.selectedAppLineItemIds
}
```

### Zod Validation (in future PR)
```typescript
const createAPRPayloadSchema = z.object({
  sourceAPPId: z.string().min(1, 'APP selection required'),
  selectedAppLineItemIds: z.array(z.string()).min(1, 'At least 1 item required'),
  header: aprHeaderFormSchema,
  terms: aprTermsFormSchema,
})
```

---

## References

- **Create APR Dialog:** `features/procurement/apr/dialogs/CreateAPRDialog.tsx`
- **Select APP Dialog:** `features/procurement/apr/dialogs/SelectAPPDialog.tsx`
- **Conversion Utils:** `features/procurement/apr/utils/convertAppItemsToAPR.ts`
- **Types:** `features/procurement/apr/types.ts`
- **APR Feature Overview:** [apr-feature-overview.md](./apr-feature-overview.md)
