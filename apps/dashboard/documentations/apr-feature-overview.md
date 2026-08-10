# APR (Agency Purchase Request) Feature - Complete Overview

**Date:** May 8, 2026  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Type:** Procurement Module Feature  

---

## Summary

The APR (Agency Purchase Request) feature enables government agencies to consolidate items from approved Annual Procurement Plans (APPs) into a formal purchase request document aligned with PS-DBM Form 002 specifications. APRs serve as the bridge between strategic procurement planning (APP) and actual procurement execution.

---

## Architecture & Components

### Folder Structure
```
src/features/procurement/apr/
├── atoms.ts                 # Jotai state management for dialogs & forms
├── types.ts                 # TypeScript interfaces & enums
├── components/              # Reusable UI components
├── dialogs/                 # Modal compositions (CreateAPR, SelectAPP)
├── forms/                   # Individual forms (Header, Terms, Validation)
├── handlers/                # API request blueprints (mutations/queries)
├── hooks/                   # Custom React hooks
├── mocks/                   # Mock data for development
├── tables/                  # Data display components
└── utils/                   # Utility functions (conversion, validation)
```

### Component Breakdown

#### **CreateAPRDialog.tsx** (192 lines)
- Multi-step wizard for APR creation
- Step 1: Select source APP and line items (SelectAPPDialog)
- Step 2: Configure header information (APRHeaderForm)
- Step 3: Configure terms & conditions (APRTermsForm)
- Uses Jotai for state management and TanStack Form for form handling
- Integrates `createMutationHookFromTemplate` for API calls

#### **SelectAPPDialog.tsx** (95 lines)
- Clean dialog composition for APP selection
- Fiscal year selector with 10-year range (current ±5 years)
- SelectAPPForm handles list of approved APPs and line item multi-select
- Returns selected APP ID and line item IDs to CreateAPRDialog

#### **APRHeaderForm.tsx**
- Agency Control Number (max 50 chars)
- Agency Account Code (max 50 chars)
- Description (5-500 chars)
- Request Date picker
- Fiscal Year selector
- Validation via Zod schema

#### **APRTermsForm.tsx**
- Mode of Delivery: FAST_LANE, SCHEDULED_PICKUP, DOOR_TO_DOOR
- Insufficient Funds Action: REDUCE_QUANTITY, BILL_US, CHARGE_TO_DEPOSIT
- Attachment Options: Observation Report, Collective Barter Agreement, Complete Specs
- Milestones (optional): Copied from APP BAC
- Remarks (optional)

---

## Data Model

### APRMaster (Root Document)
```typescript
interface APRMaster {
  id: string                          // Unique APR ID
  aprNumber: string                   // APR-YYYY-NNN format
  agencyControlNumber: string         // Agency identifier
  agencyAccountCode: string           // Budget account code
  status: APRStatus                   // DRAFT | FOR_APPROVAL | APPROVED | ...
  header: APRHeader                   // Metadata (date, entity, etc.)
  terms: APRTerms                     // Delivery mode, funds handling, milestones
  consolidatedItems: ConsolidatedAPRItem[]  // Line items (traced to APP)
  totalItemsCount: number             // Count of items
  totalAmount: number                 // Sum of item budgets
  createdBy: string                   // User who created APR
  createdAt: string                   // ISO timestamp
  updatedAt: string                   // ISO timestamp
}
```

### ConsolidatedAPRItem (Line Item with APP Traceability)
```typescript
interface ConsolidatedAPRItem {
  // Basic item information
  id: string
  itemCode: string
  description: string
  unit: string
  quantity: number
  unitCost: number
  totalAmount: number
  office: string
  fundSource: string
  
  // APP Reference (SPMS Compliance)
  appId: string                       // Source APP document ID
  appLineItemId: string               // Specific BAC line item ID
  appBACId: string                    // BAC workspace reference
  appApprovedQuantity: number         // Original APP quantity
  appApprovedBudget: number           // Original APP budget
  
  // Variance Tracking
  quantityVariance: number            // Current - Approved
  quantityVariancePercent: number     // Percentage difference
  budgetVariance: number              // Current - Approved
  budgetVariancePercent: number       // Percentage difference
  
  // Procurement details
  bacMilestones?: APRMilestones       // Advertisement, Submission, Award, Contract dates
  modeOfProcurement?: string          // From APP
  allotmentClass: 'CO' | 'MOOE'      // Capital Outlay or MOOE
  
  // PSDBM Integration
  psdbmMatches?: Array<{              // Catalog items matching this APR item
    itemCode: string
    description: string
    unitPrice: number
    unit: string
    availability: string
  }>
}
```

### APRTerms (Configuration)
```typescript
interface APRTerms {
  modeOfDelivery: ModeOfDelivery                    // Delivery method
  insufficientFundsAction: InsufficientFundsAction  // Budget handling
  attachments: AttachmentOptions                    // Required documents
  milestones?: APRMilestones                        // Procurement schedule
  remarks?: string                                  // Additional notes
}
```

---

## API Integration Pattern

### Request Handler (createAPRRequest.ts)
```typescript
export const createAPRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<APRMaster>,
  undefined,
  CreateAPRPayload
> = {
  endpoint: '/aprs',
  fetcher: async ({ payload }) => {
    // Mock implementation - Replace with real API when backend is ready
    // const response = await api.post<APIResponse<APRMaster>>('/aprs', payload)
    // return response.data
  }
}
```

### Hook Usage
```typescript
const useCreateAPR = createMutationHookFromTemplate(createAPRRequest)
const { mutateAsync: createAPR, isPending } = useCreateAPR()

await createAPR({
  pathParams: {},
  payload: createAPRPayload
})
```

---

## State Management (Jotai Atoms)

### Dialog State
- `createAPRDialogOpenAtom` - Main APR creation dialog visibility
- `selectAPPDialogOpenAtom` - APP selection dialog visibility
- `aprDetailsDialogOpenAtom` - APR view details modal
- `submitAPRDialogOpenAtom` - Submit for review modal
- `approveAPRDialogOpenAtom` - Approval confirmation modal

### Data State
- `currentAPRAtom` - Currently viewed/edited APR
- `aprListAtom` - List of all APRs
- `aprConsolidatedItemsAtom` - Items for current APR
- `aprTotalAmountAtom` - Total budget calculated

### Form State
- `aprHeaderFormAtom` - Header form values
- `aprTermsFormAtom` - Terms form values
- `aprConsolidationFilterAtom` - Item selection filters

---

## Utility Functions

### Item Conversion
**File:** `utils/convertAppItemsToAPR.ts`

```typescript
// Single item conversion
convertAppLineItemToAPRItem(
  lineItem: BACLineItem,
  appId: string,
  appBACId: string,
  index: number
): ConsolidatedAPRItem

// Batch conversion
convertAppLineItemsToAPRItems(
  lineItems: BACLineItem[],
  appId: string,
  appBACId: string
): ConsolidatedAPRItem[]
```

**Purpose:** Transform APP BAC line items into APR format with:
- SPMS compliance (APP references)
- Variance tracking initialization (starts at 0)
- Milestone copying from BAC
- Budget alignment metadata

### Validation Functions
- `validateAppForAPR()` - Checks if APP is valid for APR creation
- `validateAPRBeforeSubmission()` - Pre-submission validation
- `validateBudgetCeiling()` - Ensures budget doesn't exceed limits
- `reconcileAPRWithAPP()` - Sync changes with source APP
- `handleAPPNotFound()` - Error handling for missing APP

---

## Enums & Constants

### APRStatus
- `DRAFT` - Initial state
- `FOR_APPROVAL` - Submitted for review
- `RETURNED` - Sent back for changes
- `APPROVED` - Authorized by approver
- `PARTIALLY_AVAILABLE` - Some items out of stock
- `OUT_OF_STOCK` - All items unavailable

### ModeOfDelivery
- `FAST_LANE` - Express delivery
- `SCHEDULED_PICKUP` - Scheduled pickup
- `DOOR_TO_DOOR` - Door-to-door delivery

### InsufficientFundsAction
- `REDUCE_QUANTITY` - Reduce quantities proportionally
- `BILL_US` - Invoice agency for difference
- `CHARGE_TO_DEPOSIT` - Charge to deposit account

---

## SPMS Compliance

### APP-to-APR Traceability
Every APR item maintains complete reference to source APP:
- ✅ `appId` - Links to APP document
- ✅ `appLineItemId` - Links to specific BAC line item
- ✅ `appBACId` - Links to BAC workspace
- ✅ `appApprovedQuantity` - Original approved quantity
- ✅ `appApprovedBudget` - Original approved budget
- ✅ `bacMilestones` - Procurement schedule from BAC

### Variance Tracking
Enables budget alignment & change management:
- `quantityVariance` - Current vs. approved quantity difference
- `budgetVariance` - Current vs. approved budget difference
- `quantityVariancePercent` - Percentage variation
- `budgetVariancePercent` - Percentage variation

---

## Form Validation (Zod Schemas)

### aprHeaderFormSchema
- `agencyControlNumber`: 1-50 chars (required)
- `agencyAccountCode`: 1-50 chars (required)
- `description`: 5-500 chars (required)
- `requestDate`: Valid ISO date (required)
- `fiscalYear`: 2000-2100 (required)

### aprTermsFormSchema
- `modeOfDelivery`: Enum validation (required)
- `insufficientFundsAction`: Enum validation (required)
- `attachments`: Boolean flags
- `remarks`: Optional text
- `milestones`: Optional milestone dates

---

## Mock Data

### mockApprovedAPPs
Pre-populated with 5 sample APPs for development:
- APPs with various fiscal years (2023-2025)
- Multiple BAC line items per APP
- Different procurement modes & fund sources
- Complete milestone data

### Location
`mocks/mockApprovedAPPs.ts` - Reusable across feature

---

## Error Handling

### User-Facing Errors
- "No APP selected" - When submitting without APP selection
- "Failed to create APR" - Generic creation failure
- Toast notifications for success/error states

### Developer Errors
- `handleAPPNotFound()` - Handles missing APP in mock data
- Null-safe access to `selectedAppLineItemIds`
- Proper TypeScript typing prevents unsafe access

---

## Future Enhancements

1. **Backend API Integration**
   - Replace mock data with real `/aprs` endpoint
   - Connect to `/apps` for APP retrieval
   - Implement real validation on backend

2. **PSDBM Catalog Integration**
   - Fetch catalog items matching APR items
   - Display availability & pricing
   - Support catalog-to-APR mapping

3. **Workflow Engine**
   - Multi-level approval process
   - Email notifications for status changes
   - Audit trail logging

4. **Budget Reconciliation**
   - Real-time budget ceiling validation
   - Variance threshold alerts (10% default)
   - Automatic variance notifications

5. **Advanced Filtering**
   - Filter APRs by status, fiscal year, agency
   - Search by control number or description
   - Advanced date range filtering

---

## Testing Checklist

- [ ] APR creation flow works end-to-end
- [ ] APP selection dialog displays approved APPs
- [ ] Line item multi-select works correctly
- [ ] Form validation prevents invalid submissions
- [ ] Variance calculations are accurate
- [ ] BAC milestones copy correctly
- [ ] Mock data loads without errors
- [ ] Dialog state management is correct
- [ ] APR list updates after creation
- [ ] Fiscal year filter works in SelectAPPDialog

---

## References

- **Feature Structure:** [feature-structure-pattern.md](./feature-structure-pattern.md)
- **APP Consolidation:** Related to APP module (`app-consolidation` feature)
- **SPMS Compliance:** PS-DBM Form 002 specification
- **Related Types:** See [app-to-apr-integration.md](./app-to-apr-integration.md)
