# PPMP Backend Gap Analysis

## Scope

This document captures the backend adjustments needed to align the PPMP API with the current frontend needs for the My PPMPs list page.

Scope boundaries:
- Focused on the list page only.
- Aligned to the current PPMP table, toolbar, and row actions.
- Excludes the full workflow detail contract unless it affects the list view.
- Treats missing list fields as backend contract gaps rather than frontend expansion items.

## Frontend Contract Summary

The current PPMP list UI consumes a lightweight row shape and renders only the fields needed for the table:
- Document name
- PPMP number
- Fiscal year
- Office / LIB labels for filtering and display
- Budget
- Status badge
- Current approval stage badge
- Created date
- Row actions

Frontend surfaces involved:
- [MyPpmpsPage.tsx](../pages/MyPpmpsPage.tsx)
- [columns.tsx](../components/table/columns.tsx)
- [Toolbar.tsx](../components/table/Toolbar.tsx)
- [ppmpListMapper.ts](../lib/ppmpListMapper.ts)
- [getPpmpsRequest.ts](../handlers/getPpmpsRequest.ts)

## Current API Shape Observed

The live `GET /ppmps` payload currently exposes a richer PPMP object shape than the list page needs.

Observed response fields include:
- `id`
- `ppmpNumber`
- `officeId`
- `officeName`
- `fiscalYearId`
- `fiscalYearName`
- `fundSourceId`
- `fundSourceName`
- `libId`
- `libName`
- `parentId`
- `version`
- `totalEstimatedBudget`
- `status`
- `submittedDate`
- `approvedDate`
- `consolidatedIntoId`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `ParentPPMP`
- `PPMPItems`
- `PPMPItemAllocations`
- `PPMPActivities`
- `ApprovalEvents`
- `ChildPPMPs`

## Backend Gaps and Adjustments Needed

### 1. Field naming and contract alignment

The frontend currently maps backend values into list-view names. The backend should consider standardizing or explicitly documenting these names.

Current mismatches:
- `status` in the API maps to `state` in the UI.
- `version` in the API maps to `amendmentVersion` in the UI.
- `consolidatedIntoId` in the API maps to `consolidatedToMasterId` in the UI.
- `ppmpNumber` is used by the frontend as the list display name fallback.

Recommended backend adjustment:
- Keep the backend names stable if they are already shared by other consumers, but document the intended UI mapping clearly.
- If the backend can support a list-specific DTO, expose names that match the list use case directly.

### 2. Missing explicit list fields

The frontend currently infers or remaps several values that would be better returned explicitly.

Recommended explicit list fields:
- `documentName` or a list-friendly display title
- `currentApprovalStage`
- `isMasterOffice`
- `officeName`
- `fundSourceName`
- `fiscalYearName`
- `updatedBy` if audit visibility is needed in the list later

Frontend workarounds currently in place:
- `documentName` falls back to `ppmpNumber`.
- `isMasterOffice` is inferred from `officeName`.
- `currentApprovalStage` is not yet derived from the backend list payload.

### 3. Pagination envelope mismatch

The frontend list flow expects a paginated response that can be consumed cleanly by the query hook and table shell.

The backend should return a clear pagination envelope such as:
- `data`
- `pageNumber`
- `pageSize`
- `totalPages`
- `totalCount`

If the backend uses different field names internally, the contract should document the mapping so the frontend does not have to guess.

### 4. Excess nested data in the list response

The current API payload includes nested arrays and related objects that are not required for the list page.

Examples:
- `ParentPPMP`
- `PPMPItems`
- `PPMPItemAllocations`
- `PPMPActivities`
- `ApprovalEvents`
- `ChildPPMPs`

Recommended backend adjustment:
- Exclude these nested graphs from the list endpoint.
- Keep them in a dedicated detail endpoint or retrieve them on demand.

### 5. Server-side filtering support

The toolbar currently exposes search and filter behavior that is applied on the client. That is acceptable for small datasets, but the backend should be able to support the same contract for larger result sets.

Frontend filters that should be supported by the backend list endpoint:
- `search`
- `status`
- `fiscalYear`
- `isMasterOffice`
- `officeId` if the list should be office-filterable server-side

Recommended backend adjustment:
- Accept these filters as query parameters on the list endpoint.
- Return paginated results after filtering.
- Keep the filtering semantics documented so the frontend can rely on them.

### 6. Approval stage and audit fields

The current list view renders an approval-stage badge, but the backend list response does not currently provide a simple stage field.

Recommended backend adjustment:
- Return `currentApprovalStage` directly in the list DTO, or
- Document a stable rule for deriving it from the latest approval event.

If the backend keeps approval history only in the detail payload, the list endpoint should still provide a compact stage summary for the table.

## Recommended Backend Shape

### List DTO

A list DTO should stay lean and only include fields required by the table and toolbar.

Suggested list DTO fields:
- `id`
- `documentName`
- `ppmpNumber`
- `officeId`
- `officeName`
- `fiscalYear`
- `fiscalYearName`
- `libName`
- `totalBudget`
- `state`
- `currentApprovalStage`
- `isMasterOffice`
- `consolidatedToMasterId`
- `amendmentVersion`
- `createdBy`
- `createdAt`
- `updatedAt`

### Detail DTO

A separate detail DTO should carry the heavier graph data that the list page does not need.

Suggested detail-only fields:
- `ParentPPMP`
- `PPMPItems`
- `PPMPItemAllocations`
- `PPMPActivities`
- `ApprovalEvents`
- `ChildPPMPs`
- Any other nested approval or line-item graph data

## Recommended Backend Notes

- Use a single canonical mapping for `status` and document it.
- Avoid forcing the frontend to infer master-office or approval-stage behavior from related text fields.
- Keep the list endpoint stable and compact.
- Keep the detail endpoint rich.
- If the backend cannot change immediately, document the contract explicitly so the frontend mapper remains the single translation layer.

## Suggested Backend Action Items

1. Confirm the canonical list DTO for `GET /ppmps`.
2. Decide whether `currentApprovalStage` will be explicit or derived.
3. Decide whether `isMasterOffice` will be explicit or inferred.
4. Confirm which filters the list endpoint supports server-side.
5. Remove nested graph fields from the list payload or move them to the detail endpoint.
6. Confirm pagination field names and default values.

## Notes

The current frontend already contains a mapper layer so the UI can adapt to the present payload. This document is intended to reduce that mapping burden over time by making the backend list contract more deliberate and lightweight.
