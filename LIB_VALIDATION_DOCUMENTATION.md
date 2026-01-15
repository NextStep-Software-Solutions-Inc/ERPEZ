# LineItemBudget Validation Rules and Business Logic

## Overview

This document describes the comprehensive validation rules implemented for the LineItemBudget (LIB) domain entities as part of the LIB Entity Model and Backend Validation Refactor.

## Entity Model Changes

### 1. LineItemBudget (Header)

**New/Updated Properties:**

- `IsConsolidated` - New **boolean** flag (default: false) to identify consolidated LIBs from child delivery units
- `SourceId` - Now **nullable** (required for WFP/OPCR, null for Independent)

**Removed Properties:**

- `ParentLIBId` - **REMOVED** (no longer needed, uses DeliveryUnit hierarchy instead)
- `ParentLIB` - **REMOVED** navigation property
- `ChildLIBs` - **REMOVED** navigation property

**Index Added:**

- Index on `IsConsolidated` for efficient queries on consolidated LIBs

### 2. LineItemBudgetDetail

**Property Changes:**

- `LIBId` - **REMOVED** (duplicate, use `LineItemBudgetId` instead)
- `WFPExpenditureId` - **RENAMED** to `WFPObjectiveTargetExpenditureId` for clarity
- `WFPExpenditure` navigation - **RENAMED** to `WFPObjectiveTargetExpenditure`

### 3. LineItemBudgetActivity

**No changes** - Already correctly structured with:

- Nullable `WFPObjectiveTargetId`
- Nullable `OPCRActivityId`
- Required `Name` (mandatory for ad-hoc activities)

## Database Migration

**Migration 1:** `UpdateLIBEntityModelWithParentAndRenamedProperties`

- Makes `LineItemBudgets.SourceId` nullable
- Adds `LineItemBudgets.ParentLIBId` with self-referencing FK (temporary)
- Removes duplicate `LineItemBudgetDetails.LIBId` column
- Renames `LineItemBudgetDetails.WFPExpenditureId` to `WFPObjectiveTargetExpenditureId`

**Migration 2:** `ReplaceParentLIBIdWithIsConsolidatedFlag`

- Removes `ParentLIBId` foreign key constraint
- Removes `ParentLIBId` column
- Adds `IsConsolidated` boolean column with default false
- Adds index on `IsConsolidated` for query performance

## Validation Rules Reference

### Rule Categories

#### 1. Source Type Validation

**ValidateSourceIdRequirement**

- **Rule:** WFP and OPCR source types require a valid SourceId
- **Rule:** Independent source type must NOT have a SourceId
- **Use Case:** Create/Update LIB operations
- **Error Messages:**
  - "Source ID (WFP) is required for WFP source type."
  - "Source ID (OPCR) is required for OPCR source type."
  - "Source ID should not be provided for Independent source type."

**ValidateSourceBelongsToDeliveryUnit**

- **Rule:** The referenced WFP/OPCR must belong to the same Delivery Unit as the LIB
- **Use Case:** Create/Update LIB operations
- **Error Message:** "Source does not belong to the specified Delivery Unit."

#### 2. Scope Validation (Activity-Level vs Project-Level)

**ValidateScopeActivityRequirement**

- **Rule:** Activity-Level budgets MUST have at least one activity
- **Rule:** Project-Level budgets can optionally have activities
- **Use Case:** Create/Update LIB operations when setting Scope
- **Error Message:** "Activity-level budget must have at least one activity."

**ValidateDetailActivityRequirement**

- **Rule:** Activity-Level budget details MUST reference a LineItemBudgetActivity
- **Rule:** Project-Level budget details can be attached directly to the header
- **Use Case:** Create budget detail operations
- **Error Message:** "Activity-level budget details must reference an activity."

#### 3. Activity Source Exclusivity and Consistency

**ValidateActivitySourceExclusivity**

- **Rule:** An activity cannot reference both WFP and OPCR sources simultaneously
- **Rule:** Either `WFPObjectiveTargetId` OR `OPCRActivityId` can be set, not both
- **Use Case:** Create/Update activity operations
- **Error Message:** "Activity cannot reference both WFP and OPCR sources."

**ValidateActivitySourceConsistency**

- **Rule:** If LIB is OPCR-sourced, activities must link to OPCR activities
- **Rule:** If LIB is WFP-sourced, activities must link to WFP targets
- **Rule:** If LIB is Independent, activities must have a user-provided name
- **Use Case:** Create/Update activity operations
- **Error Messages:**
  - "OPCR-sourced budget requires activities to link to OPCR activities."
  - "WFP-sourced budget requires activities to link to WFP targets."
  - "Independent budget activities must have a name."

#### 4. Budget and Timeline Constraints

**ValidateBudgetCeiling**

- **Rule:** Detail budget amount cannot exceed the source's budget/cost estimate
- **Use Case:** Create/Update detail operations linked to WFP expenditures
- **Error Message:** "Budget amount (X) exceeds the source cost estimate (Y)."

**ValidateTimelineWithinSource**

- **Rule:** Detail start/end dates must fall within the source timeline
- **Rule:** Detail start date must be <= end date
- **Use Case:** Create/Update detail operations
- **Error Message:** "Detail timeline must fall within the source timeline."

**ValidateTotalDetailsBudgetWithinActivity**

- **Rule:** Sum of all detail budgets cannot exceed the activity budget
- **Use Case:** Create detail operations
- **Error Message:** "Total detail budget exceeds activity budget."

#### 5. Status and Workflow Validation

**ValidateSubmissionAllowed**

- **Rule:** Only LIBs with status = Draft can be submitted
- **Use Case:** Submit LIB operation
- **Error Message:** "Only Draft Line Item Budgets can be submitted."

**ValidateApprovalAllowed**

- **Rule:** Only LIBs with status = Submitted can be approved
- **Use Case:** Approve LIB operation
- **Error Message:** "Only Submitted Line Item Budgets can be approved."

**ValidateModificationAllowed**

- **Rule:** LIBs with status = Consolidated cannot be modified
- **Use Case:** All Update operations
- **Error Message:** "Cannot modify a consolidated Line Item Budget."

#### 6. Consolidation Rules (Independent Workflow)

**ValidateConsolidationDeliveryUnitHierarchy**

- **Rule:** A consolidated LIB must belong to a parent DeliveryUnit
- **Rule:** Only parent DUs can create consolidated LIBs
- **Use Case:** Create/Update LIB with IsConsolidated = true
- **Error Message:** "Only parent Delivery Units can create consolidated Line Item Budgets."

**ValidateConsolidationStatus**

- **Rule:** If `IsConsolidated = true`, LIB status must equal `Consolidated`
- **Rule:** If `IsConsolidated = false`, LIB status cannot be `Consolidated`
- **Use Case:** Create/Update LIB status transitions
- **Error Message:** "Consolidated flag must match LIB status."

**ValidateConsolidatedLIBCanBeModified**

- **Rule:** LIBs with both `IsConsolidated = true` AND `Status = Consolidated` are immutable
- **Use Case:** All Update operations on consolidated LIBs
- **Error Message:** "Consolidated Line Item Budgets cannot be modified."

**ValidateSubDUCanCreateIndependentLIB**

- **Rule:** Sub-DU can create its own LIB independently (no parent LIB dependency)
- **Rule:** Sub-DU LIBs do not require ParentLIBId
- **Use Case:** Create LIB operations for Sub-DUs
- **Impact:** Enables flexible timeline - sub-DUs work before parent consolidates

**ValidateParentDUCanCreateConsolidatedLIB**

- **Rule:** Only parent DUs (those with SubDeliveryUnits) can set `IsConsolidated = true`
- **Rule:** Parent DU must reference valid child DU LIBs for consolidation
- **Use Case:** Create consolidated LIB operations
- **Error Message:** "Only parent Delivery Units can create consolidated Line Item Budgets."

**ValidateConsolidationSequence**

- **Rule:** Consolidated LIB should be created after child DU LIBs are submitted/approved
- **Rule:** Validates timing of consolidation operations
- **Use Case:** Consolidate LIB operations
- **Error Message:** "Child Delivery Unit Line Item Budgets must be submitted before consolidation."

#### 7. OPCR-Specific Rules

**ValidateOPCRActivityNameIsReadOnly**

- **Rule:** Activity names linked to OPCR activities are read-only
- **Rule:** Name must match the source OPCR activity name exactly
- **Rule:** Users cannot modify these names
- **Use Case:** Create/Update activity operations for OPCR-linked activities
- **Error Message:** "OPCR activity name must match the source activity name and cannot be modified."

#### 8. WFP-Specific Rules

**ValidateWFPExpenditureConsistency**

- **Rule:** If `WFPObjectiveTargetExpenditureId` is provided, it must belong to the same WFP Objective Target as the activity
- **Use Case:** Create/Update detail operations with WFP expenditure links
- **Error Message:** "WFP expenditure must belong to the same WFP Objective Target as the activity."

#### 9. Fiscal Year Consistency

**ValidateFiscalYearConsistency**

- **Rule:** LIB fiscal year must match the source (WFP/OPCR) fiscal year if present
- **Rule:** LIB fiscal year must match the DU Allocation fiscal year if present
- **Use Case:** Create/Update LIB operations
- **Error Message:** "Fiscal year must match the source fiscal year."

## Consolidation Workflow: Independent-First Approach

### Previous Workflow (ParentLIBId-based)

Sub-DUs were tightly coupled to parent LIBs:

```
1. Parent DU creates LIB
   ↓
2. Sub-DU creates LIB with ParentLIBId = Parent LIB ID
   ↓
3. Consolidation happens automatically
```

**Issues:**

- Sub-DU blocked until parent creates its LIB
- Tight coupling between parent and child
- Limited flexibility in timeline

### New Workflow (IsConsolidated Flag with DeliveryUnit Hierarchy)

Sub-DUs work independently, parent consolidates later:

```
Phase 1: Sub-DU creates own LIB independently
         (IsConsolidated = false, no parent reference needed)
   ↓
Phase 2: Sub-DU submits and approves its LIB
   ↓
Phase 3: Parent DU creates consolidated LIB
         (IsConsolidated = true, Status = Consolidated)
         Data aggregated from child DUs via DeliveryUnit hierarchy
   ↓
Phase 4: Consolidated LIB becomes immutable
         (Cannot be modified once Status = Consolidated)
```

**Key Benefits:**

- ✅ **Independent Work:** Sub-DUs create LIBs without waiting for parent
- ✅ **Flexible Timeline:** Consolidation can happen anytime after child LIBs are ready
- ✅ **Clear Hierarchy:** Uses DeliveryUnit relationships instead of LIB relationships
- ✅ **Data Integrity:** Consolidated LIBs are immutable
- ✅ **Decoupled Dependencies:** No blocking relationships between DUs

---

## How to Use This Implementation

1. **LineItemBudgetValidationRules.cs** (358 lines)
   - Static class with pure validation logic methods
   - 21+ validation rules including new consolidation workflow
   - No dependencies, fully testable
   - Returns boolean results
   - Can be used in FluentValidation validators or service methods
   - **New Methods:**
     - `ValidateSubDUCanCreateIndependentLIB()` - Enable independent sub-DU creation
     - `ValidateParentDUCanCreateConsolidatedLIB()` - Restrict consolidation to parents
     - `ValidateConsolidationSequence()` - Validate consolidation timing

2. **ILineItemBudgetValidationService.cs** (95 lines)
   - Service interface for database-dependent validations
   - Defines methods for complex validation scenarios
   - Returns `ValidationResult` with error messages
   - **Updated Consolidation Method:**
     - `ValidateConsolidationAsync(libId, markAsConsolidated, parentDUId)` - New signature for independent workflow

3. **LineItemBudgetValidationService.cs** (217 lines)
   - Implementation of validation service (placeholder)
   - Requires repositories to be added to IUnitOfWork
   - Will perform database lookups and aggregate validations
   - **Updated consolidation validation** to support new workflow

### Usage Patterns

#### In FluentValidation Validators

```csharp
public class CreateLineItemBudgetCommandValidator : AbstractValidator<CreateLineItemBudgetCommand>
{
    public CreateLineItemBudgetCommandValidator()
    {
        RuleFor(x => x)
            .Must(cmd => LineItemBudgetValidationRules.ValidateSourceIdRequirement(
                cmd.SourceType, cmd.SourceId))
            .WithMessage("Source ID validation failed.");
            
        RuleFor(x => x.Scope)
            .NotEmpty()
            .WithMessage("Scope is required.")
            .IsInEnum()
            .WithMessage("Invalid budget scope.");
    }
}
```

#### In Command Handlers

```csharp
public class CreateLineItemBudgetCommandHandler : IRequestHandler<CreateLineItemBudgetCommand, ApiResponse<Guid>>
{
    private readonly ILineItemBudgetValidationService _validationService;
    private readonly IUnitOfWork _unitOfWork;
    
    public async Task<ApiResponse<Guid>> Handle(CreateLineItemBudgetCommand request, CancellationToken cancellationToken)
    {
        // Perform complex validation
        var validationResult = await _validationService.ValidateCreateAsync(
            request.DeliveryUnitId,
            request.SourceType,
            request.SourceId,
            request.Scope,
            request.FiscalYear,
            request.DUAllocationId,
            cancellationToken);
        
        if (!validationResult.IsValid)
        {
            throw new ValidationException(string.Join("; ", validationResult.Errors));
        }
        
        // Create entity...
    }
}
```

## Testing Considerations

### Unit Tests for Validation Rules

Each validation rule should have unit tests covering:

- Happy path (valid inputs)
- Edge cases (boundary conditions)
- Error cases (invalid inputs)
- Null/empty scenarios

Example:

```csharp
[Fact]
public void ValidateSourceIdRequirement_WFPSourceType_RequiresSourceId()
{
    // Arrange
    var sourceType = SourceType.WFP;
    Guid? sourceId = null;
    
    // Act
    var result = LineItemBudgetValidationRules.ValidateSourceIdRequirement(sourceType, sourceId);
    
    // Assert
    Assert.False(result);
}
```

### Integration Tests for Validation Service

Test validation service with actual database context:

- Verify foreign key validations
- Test cascade scenarios
- Verify parent/child relationships
- Test consolidation workflows

## Future Enhancements

### Repository Implementation Required

Before the validation service can be fully functional, the following must be added to `IUnitOfWork`:

```csharp
public interface IUnitOfWork
{
    // ... existing repositories ...
    
    ILineItemBudgetRepository LineItemBudgetRepository { get; }
    ILineItemBudgetActivityRepository LineItemBudgetActivityRepository { get; }
    ILineItemBudgetDetailRepository LineItemBudgetDetailRepository { get; }
    
    // ... rest of interface ...
}
```

### Command Implementation

Create the following command handlers:

1. **CreateLineItemBudgetCommand** - Create new LIB with validation
2. **UpdateLineItemBudgetCommand** - Update LIB properties
3. **AddLineItemBudgetActivityCommand** - Add activity to LIB
4. **AddLineItemBudgetDetailCommand** - Add detail/line item
5. **SubmitLineItemBudgetCommand** - Submit LIB for approval
6. **ApproveLineItemBudgetCommand** - Approve submitted LIB
7. **ConsolidateLineItemBudgetCommand** - Consolidate Sub-DU LIB to Parent
8. **ReturnLineItemBudgetCommand** - Return LIB to Draft status

### DTO Implementation

Create request/response DTOs:

- `LineItemBudgetRequest` / `LineItemBudgetResponse`
- `LineItemBudgetActivityRequest` / `LineItemBudgetActivityResponse`
- `LineItemBudgetDetailRequest` / `LineItemBudgetDetailResponse`

### Query Implementation

Create query handlers for:

1. **GetLineItemBudgetByIdQuery** - Retrieve single LIB with details
2. **GetAllLineItemBudgetsQuery** - List LIBs with filtering/sorting
3. **GetLineItemBudgetsByDeliveryUnitQuery** - LIBs for specific DU
4. **GetConsolidatedBudgetQuery** - Parent LIB with consolidated children

## References

- **Issue:** LIB Entity Model and Backend Validation Refactor (Header, Activity, Detail)
- **Migration:** `20260114091542_UpdateLIBEntityModelWithParentAndRenamedProperties`
- **Entities:** `LineItemBudget`, `LineItemBudgetActivity`, `LineItemBudgetDetail`
- **Enums:** `SourceType`, `BudgetScope`, `LIBStatus`

## Conclusion

This validation framework establishes comprehensive business rules for the LineItemBudget domain with an **independent-first consolidation workflow**:

### What's New

1. **Independent LIB Creation** - Sub-DUs can create LIBs without parent dependency
2. **IsConsolidated Flag** - Simple boolean to identify consolidated LIBs
3. **DeliveryUnit Hierarchy** - Uses existing DU relationships instead of LIB self-reference
4. **Immutable Consolidated LIBs** - Data integrity through immutability
5. **Flexible Timeline** - Consolidation decoupled from initial creation

### Validation Framework Provides

1. **Clearly Defined Rules** - 21+ business rules documented with use cases
2. **Centralized Logic** - Reusable validation methods in `LineItemBudgetValidationRules`
3. **Testable Design** - Pure functions for unit testing
4. **Service Integration** - Database-aware validations via `ILineItemBudgetValidationService`
5. **Consistent Enforcement** - Same rules apply across all operations

### Usage

- **FluentValidation:** Apply rules in command validators
- **Command Handlers:** Call service methods for complex validations
- **Custom Logic:** Use validation rules in business logic layers

This framework ensures data integrity and enforces complex business logic for activity-level and project-level budget tracking across WFP, OPCR, and Independent sources, with flexible parent/child delivery unit consolidation scenarios using the new independent-first workflow.
