# BAC Multi-Source Procurement Workflow Implementation Plan

This plan details the end-to-end refactoring of the Bids and Awards Committee (BAC) and Procurement Project workflow. It introduces support for creating a BAC Resolution directly from an approved APP Item (Path A) or from a Consolidated Purchase Request (Path B), while preserving the CSE / APR workflow (Path C) outside the BAC chain.

---

## User Review Required

> [!IMPORTANT]
> **Data Migration Integrity**
>
> Existing `ProcurementProject` records do not have a `SourceType`, `OfficeId`, or `FundSourceId`. To ensure backward compatibility, the migration script will:
>
> - Set `SourceType = ProcurementProjectSourceType.ConsolidatedPR` for all existing projects
> - Keep `ConsolidatedPRId` as-is
> - Populate `OfficeId` and `FundSourceId` by resolving them from the linked `ConsolidatedPR` (aggregating from child Purchase Request items)
> - Handle resolution failures gracefully with logging and nullable defaults

> [!WARNING]
> **Enforcing 1:1 Project-to-Resolution Cardinality**
>
> A unique EF Core index will be added to `BACResolution.ProcurementProjectId` to prevent multiple active resolutions per project. If duplicate resolutions exist in the database before migration, the migration will fail until manual data cleanup is performed. Backup the database before running the migration.

---

## Open Questions

> [!NOTE]
> **Resolved:** All architectural decisions regarding source types, data snapshot strategy, cardinality enforcement, PDF generation backend location, and WHEREAS clause immutability have been finalized via pair-programming design sessions.
>
> **Pending Implementation Clarifications:** See below under each component for file-level implementation questions.

---

## Proposed Changes

### Component: Backend Domain & Database Layer

We will define source type enums, snapshot fields, and configure the database mappings to enforce cardinality and immutability.

#### [NEW] `ProcurementProjectSourceType.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Enums/ProcurementProjectSourceType.cs`

- Create enum with two values:
  - `AppItem = 0` � Procurement originated from an approved APP Item (Path A)
  - `ConsolidatedPR = 1` � Procurement originated from a Consolidated PR (Path B, traditional flow)

#### [MODIFY] `ProcurementProject.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Entities/Procurement/ProcurementProject.cs`

- Add `ProcurementProjectSourceType SourceType { get; set; }` � Immutable; set at creation
- Add `Guid? APPItemId { get; set; }` and navigation `public virtual APPItem? APPItem { get; set; }` � Populated only if SourceType = AppItem
- Add snapshot fields:
  - `Guid OfficeId { get; set; }` � Resolved from source at creation; immutable
  - `Guid FundSourceId { get; set; }` � Resolved from source at creation; immutable
  - `public virtual Office Office { get; set; }` and `public virtual FundSource FundSource { get; set; }` � Navigation properties for eager loading
- Add `ProcurementProjectStatus Status { get; set; }` � Tracks lifecycle (Draft, Active, Cancelled, Completed)
- Keep existing `ConsolidatedPRId` unchanged (backward compatibility)
- Add navigation `public virtual List<PurchaseRequest> PurchaseRequests { get; set; }` � For Path A downstream traceability

#### [NEW] `ProcurementProjectStatus.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Enums/ProcurementProjectStatus.cs`

- Create enum with four values:
  - `Draft = 0` � Project being prepared; BAC not created or still in draft
  - `Active = 1` � Project active with approved BAC Resolution
  - `Cancelled = 2` � Project cancelled before approval
  - `Completed = 3` � Project closed; historical reference only

#### [NEW] `BACResolutionClause.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Entities/Procurement/BACResolutionClause.cs`

- Create entity to store WHEREAS clauses:
  - `Guid BACResolutionId` � FK to parent BACResolution
  - `Guid? TemplateClauseId` � Optional FK to template (null for custom clauses)
  - `string ClauseText` � **Snapshot** of clause text at BAC creation time (immutable)
  - `int DisplayOrder` � Order in which clauses appear in document
  - `bool IsCustom` � Flag distinguishing template vs. custom clauses
  - Navigation `public virtual BACResolution BACResolution` and `public virtual BACResolutionWhereAsTemplate? TemplateClause`

#### [MODIFY] `BACResolution.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Entities/Procurement/BACResolution.cs`

- Add `Guid ProcurementProjectId { get; set; }` � Unique FK enforcing 1:1 cardinality
- Add navigation `public virtual ProcurementProject ProcurementProject { get; set; }`
- Add `public virtual List<BACResolutionClause> SelectedClauses { get; set; } = []` � Collection of WHEREAS clauses
- Add or verify `string Status { get; set; }` � Tracks BAC lifecycle (Draft, Approved, Executed)

#### [MODIFY] `PurchaseRequest.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Domain/Entities/Procurement/PurchaseRequest.cs`

- Add `Guid? ProcurementProjectId { get; set; }` � Optional FK (populated for Path A PRs)
- Add navigation `public virtual ProcurementProject? ProcurementProject { get; set; }` � Enables traceability: PR ? Project ? BAC ? APP Item

#### [MODIFY] `ApplicationDbContext.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Infrastructure/Persistence/ApplicationDbContext.cs`

In `OnModelCreating()`, configure:

**ProcurementProject entity:**

- Enum conversions: `.Property(e => e.SourceType).HasConversion<string>()`
- Enum conversions: `.Property(e => e.Status).HasConversion<string>()`
- FK to APPItem: `.HasOne(e => e.APPItem).WithMany().HasForeignKey(e => e.APPItemId).OnDelete(DeleteBehavior.Restrict)`
- FK to Office: `.HasOne(e => e.Office).WithMany().HasForeignKey(e => e.OfficeId).OnDelete(DeleteBehavior.Restrict)`
- FK to FundSource: `.HasOne(e => e.FundSource).WithMany().HasForeignKey(e => e.FundSourceId).OnDelete(DeleteBehavior.Restrict)`
- 1:1 to BACResolution: `.HasOne(e => e.BACResolution).WithOne(b => b.ProcurementProject).HasForeignKey<BACResolution>(b => b.ProcurementProjectId).OnDelete(DeleteBehavior.Cascade)`
- 1:Many to PurchaseRequest: `.HasMany(e => e.PurchaseRequests).WithOne(pr => pr.ProcurementProject).HasForeignKey(pr => pr.ProcurementProjectId).OnDelete(DeleteBehavior.Restrict)`

**BACResolution entity:**

- Unique index on `ProcurementProjectId` with soft-delete filter: `.HasIndex(e => e.ProcurementProjectId).IsUnique().HasFilter(@"""IsDeleted"" = false")`
- 1:Many to BACResolutionClause: `.HasMany(e => e.SelectedClauses).WithOne(c => c.BACResolution).HasForeignKey(c => c.BACResolutionId).OnDelete(DeleteBehavior.Cascade)`

**BACResolutionClause entity:**

- FK to TemplateClause: `.HasOne(e => e.TemplateClause).WithMany().HasForeignKey(e => e.TemplateClauseId).OnDelete(DeleteBehavior.Restrict)`
- Index for ordering: `.HasIndex(e => new { e.BACResolutionId, e.DisplayOrder })`

**PurchaseRequest entity:**

- FK to ProcurementProject: `.HasOne(e => e.ProcurementProject).WithMany(p => p.PurchaseRequests).HasForeignKey(e => e.ProcurementProjectId).OnDelete(DeleteBehavior.Restrict)`

---

### Component: Backend Application & API Layer

Extend command handlers, validations, and API controllers to support creation with business validation, data resolution, and PDF generation.

#### [MODIFY] `CreateProcurementProjectCommand.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Application/Features/Procurement/Projects/Commands/CreateProcurementProject/CreateProcurementProjectCommand.cs`

- Update to accept:
  - `ProcurementProjectSourceType SourceType` � Source indicator
  - `Guid? APPItemId` � ID of source APP Item (if SourceType = AppItem)
  - `Guid? ConsolidatedPRId` � ID of source Consolidated PR (if SourceType = ConsolidatedPR)
  - `string ResolutionType` � Type/category of resolution
  - `string ResolutionNumber` � Unique identifier for BAC Resolution
  - `DateTime DateResolved` � Date BAC was approved
  - `string ResolvedLocation` � Location of BAC meeting
  - `List<Guid> SelectedTemplateClauseIds` � Template clauses to include (in order)
  - `List<string> CustomClauses` � Custom WHEREAS clauses entered by user
  - `Guid? EndUserRepresentativeId` and `Guid? TechRepresentativeId` � BAC member references
  - Metadata: `Guid UserId`, `DateTime CreatedAt`

#### [NEW] `CreateProcurementProjectCommandValidator.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Application/Features/Procurement/Projects/Commands/CreateProcurementProject/CreateProcurementProjectCommandValidator.cs`

- Implement `AbstractValidator<CreateProcurementProjectCommand>` with rules:

  **Rule 1: Source Selection (Exactly One)**
  - Validate that either `APPItemId` or `ConsolidatedPRId` is provided, but not both
  - Error: "Either APP Item or Consolidated PR may be specified, but not both."

  **Rule 2: SourceType Consistency**
  - If `APPItemId` provided: SourceType must equal `ProcurementProjectSourceType.AppItem`
  - If `ConsolidatedPRId` provided: SourceType must equal `ProcurementProjectSourceType.ConsolidatedPR`
  - Error: "SourceType must match the provided source identifier."

  **Rule 3a: APP Item Eligibility**
  - Verify APP Item exists
  - Verify APP Item status = "Approved"
  - Verify parent APP status = "Approved"
  - Errors: Clear messages per check

  **Rule 3b: Consolidated PR Eligibility**
  - Verify Consolidated PR exists
  - Verify Consolidated PR status = "Approved"
  - Errors: Clear messages per check

  **Rule 4a: Prevent Duplicate Projects (APP Item)**
  - Check for existing active/draft project with same `APPItemId`
  - Error: "An active or draft Procurement Project already exists for this APP Item."

  **Rule 4b: Prevent Duplicate Projects (Consolidated PR)**
  - Check for existing active/draft project with same `ConsolidatedPRId`
  - Error: "An active or draft Procurement Project already exists for this Consolidated PR."

  **Rule 5: BAC Details Validation**
  - `ResolutionNumber`: Required, 3�50 characters
  - `ResolutionType`: Required, max 50 characters
  - `DateResolved`: Required, not in future
  - `ResolvedLocation`: Required, max 200 characters
  - `UserId`: Required (audit trail)

#### [NEW] `CreateProcurementProjectCommandHandler.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Application/Features/Procurement/Projects/Commands/CreateProcurementProject/CreateProcurementProjectCommandHandler.cs`

- Implement `IRequestHandler<CreateProcurementProjectCommand, ApiResponse<Guid>>` with logic:
  1. **Start transaction** (all-or-nothing)
  2. **Resolve procurement data** based on source:
     - **If AppItem:** Copy `OfficeId`, `FundSourceId`, `ProcurementModeId`, `ABC` from APP Item
     - **If ConsolidatedPR:** Aggregate from PR items:
       - Sum `ABC` from all items
       - Detect distinct (Office, FundSource) combinations
       - If single combination: snapshot it
       - If multiple combinations: snapshot primary; document generation handles display
  3. **Create ProcurementProject** with snapshotted fields (immutable after creation)
  4. **Create linked BACResolution** in same transaction
  5. **Create BACResolutionClauses** from template IDs and custom text:
     - Preserve template reference
     - Store text snapshot
     - Maintain display order
  6. **Commit transaction** or **rollback on error** (prevents orphaned projects)
  7. Return project ID in response

#### [NEW] `BACResolutionPDFGenerator.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Infrastructure/Services/BACResolutionPDFGenerator.cs`

- Implement QuestPDF-based document renderer:
  - **Header section:**
    - Title: "BIDS AND AWARDS COMMITTEE RESOLUTION"
    - Resolution Number, Date, Location
  - **WHEREAS clauses section:**
    - Render clauses in order (DisplayOrder ascending)
    - Use snapshot text (not template text)
  - **NOW, THEREFORE section:**
    - Formal recommendation language
    - Project title
    - Procurement mode
  - **Procurement Information Table:**
    - Columns: Office / Implementing Unit (2), Procurement Mode (4), Source of Fund (9), ABC (10)
    - For single office/fund: one row with aggregated ABC
    - For multiple combinations: one row per distinct combination
  - **Signature block:**
    - Blanks for BAC Chairperson and members
    - Date and location line
  - **Footer:** Generation timestamp

- Public method: `Task<byte[]> GeneratePDFAsync(Guid procurementProjectId, CancellationToken cancellationToken)`

#### [MODIFY] `BACProjectController.cs`

**Path:** `apps/backend/Dashboard/Dashboard.Api/Controllers/BACProjectController.cs`

- Add new endpoint:
  - `GET /api/bac-projects/{procurementProjectId}/print`
  - Calls `BACResolutionPDFGenerator.GeneratePDFAsync(procurementProjectId)`
  - Returns: `File(pdfBytes, "application/pdf", fileName)`
  - Errors: 404 if BAC not found, 500 if generation fails

---

### Component: Frontend UI Layer

Provide source selection, entity search/selection, metadata preview, and form submission for BAC creation.

#### [MODIFY] `types/index.ts`

**Path:** `apps/dashboard/src/features/procurement/bac-resolution/types/index.ts`

- Update `CreateBacResolutionPayload` type to include:
  - `sourceType: ProcurementProjectSourceType` (enum: 'AppItem' | 'ConsolidatedPR')
  - `appItemId?: Guid` (populated if sourceType = 'AppItem')
  - `consolidatedPRId?: Guid` (populated if sourceType = 'ConsolidatedPR')
  - Existing fields: `resolutionType`, `resolutionNumber`, `dateResolved`, `resolvedLocation`, `whereAsClauses`, `endUserRepresentativeId`, `techRepresentativeId`

#### [MODIFY] `CreateBacResolutionForm.tsx`

**Path:** `apps/dashboard/src/features/procurement/bac-resolution/forms/CreateBacResolutionForm.tsx`

- Redesign as 4-step multi-step form:

  **Step 1 � Source Selection:**
  - Radio or select group: "Select Procurement Source"
  - Option A: "APP Item"
  - Option B: "Consolidated Purchase Request"
  - Next button to proceed

  **Step 2 � Entity Selection:**
  - **If APP Item selected:**
    - Search/select box listing approved APP Items
    - Display: Project Name, Item Description, Unit, Quantity, ABC, Office, Procurement Mode
    - Allow filtering by status, office
  - **If Consolidated PR selected:**
    - Search/select box listing approved Consolidated PRs
    - Display: CPR Number, Description, Item Count, Total ABC, Office (if single), Procurement Mode
    - Allow filtering by status, office
  - Selected entity stored in form state
  - Next button proceeds to preview

  **Step 3 � Metadata Preview (Read-Only):**
  - Display resolved and snapshotted data:
    - Title (from source)
    - Implementing Unit / Office
    - Procurement Mode
    - Source of Fund
    - Total ABC (aggregated if applicable)
  - "This data will be locked when the BAC Resolution is created"
  - Next button proceeds to details

  **Step 4 � BAC Resolution Details:**
  - Input fields:
    - Resolution Type (text, 50 char max)
    - Resolution Number (text, 3�50 chars, required)
    - Resolved Date (date picker, not future)
    - Resolved Location (text, 200 char max)
    - WHEREAS Clauses:
      - Checkbox list of available templates
      - Textarea for custom clauses (one per line or separate entries)
    - BAC Members (optional):
      - End User Representative (select)
      - Technical Representative (select)
  - Submit button calls API with payload containing source type and entity ID

#### [MODIFY] `CreateBacResolutionDialog.tsx`

**Path:** `apps/dashboard/src/features/procurement/bac-resolution/dialogs/CreateBacResolutionDialog.tsx`

- Wire the 4-step form into dialog layout
- On submit: Call `POST /api/bac-projects` with `CreateBacResolutionPayload`
- On success: Close dialog, refresh list, show success toast
- On error: Display error message, allow retry

#### [MODIFY] `printBacResolutionRequest.ts`

**Path:** `apps/dashboard/src/features/procurement/bac-resolution/handlers/printBacResolutionRequest.ts`

- Update print handler:
  - Remove local mock PDF generation
  - Call `GET /api/bac-projects/{projectId}/print`
  - Download returned PDF file with name: `BAC-Resolution-{projectId}.pdf`
  - Error handling: Show message if download fails

---

## Verification Plan

### Automated Tests

Run backend unit and integration tests to verify business logic and database constraints:

```bash
# Unit tests (validation rules, domain logic)
dotnet test --filter Category=Unit

# Integration tests (end-to-end command handling, DB constraints)
dotnet test --filter Category=Integration
```

**Coverage:**

- APP Item source validation (eligibility, duplicate prevention)
- Consolidated PR source validation (eligibility, duplicate prevention)
- Data resolution logic (office/fund aggregation)
- Atomic transaction rollback on error
- WHEREAS clause storage with snapshots
- PDF generation correctness

### Manual Verification

1. **Path A (APP-driven):**
   - Create new BAC project from approved APP Item
   - Verify OfficeId, FundSourceId, ABC snapshotted correctly
   - Verify no duplicate projects allowed for same APP Item
   - Verify option to create PR with prefilled procurement data

2. **Path B (PR-driven):**
   - Create new BAC project from approved Consolidated PR
   - If PR has multiple items with same office/fund: verify aggregation
   - If PR has multiple items with different office/fund: verify preview shows all
   - Verify no duplicate projects allowed for same Consolidated PR

3. **Print Document:**
   - Create BAC project from both sources
   - Trigger Print PDF on draft project
   - Verify QuestPDF output includes:
     - Columns 2, 4, 9, 10 (Office, Mode, Fund, ABC)
     - WHEREAS clauses in correct order
     - Signature block at bottom
     - Resolution number, date, location

4. **Independent APR Flow:**
   - Verify CSE/APR workflow continues to work
   - Verify APR projects do NOT require BAC Resolution
   - Verify no unintended changes to CSE/APR entities

5. **Data Migration:**
   - Backup database before migration
   - Run migration on staging environment
   - Verify existing projects have SourceType = ConsolidatedPR
   - Verify OfficeId and FundSourceId populated from ConsolidatedPR items
   - Verify unique index on BACResolution.ProcurementProjectId created successfully
   - Verify soft-delete filter applied correctly

---

## Implementation Phases

| Phase | Components                                  | Effort   | Dependencies                        |
| ----- | ------------------------------------------- | -------- | ----------------------------------- |
| 1     | Domain entities, enums, DB context mappings | 1–2 days | None                                |
| 2     | Command, Validator, Handler                 | 2–3 days | Phase 1 complete                    |
| 3     | PDF Generator, API endpoint                 | 1–2 days | Phase 2 complete                    |
| 4     | Database Migration                          | 1 day    | Phase 1 complete, tested in staging |
| 5     | Frontend: 4-step form, print handler        | 2–3 days | Phase 3 complete                    |

**Total Estimated Effort:** 7–11 days

---

## Deployment Checklist

- [ ] All unit and integration tests passing
- [ ] Database migration tested on staging environment
- [ ] Backup taken before production migration
- [ ] Existing BAC projects verified after migration (sample spot-check)
- [ ] Frontend 4-step form tested end-to-end
- [ ] Print PDF tested on multiple resolutions
- [ ] APR/CSE workflow regression tested
- [ ] Performance monitoring enabled for PDF generation
- [ ] Deployment notes communicated to support team
