# KPI Planning — Frontend Integration Guide

**Version:** 1.0  
**Target Framework:** .NET 10 / ASP.NET Core  
**Base URL:** `/` (prefix all routes with your API base URL)

---

## Architecture Overview

The KPI planning workflow spans **three layers**, each served by distinct endpoints:

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1 — Master KPI Registry                               │
│  GET/POST/PUT/DELETE  /kpis                                  │
│  Canonical KPI definitions; fiscal-year agnostic.           │
└───────────────────────────┬──────────────────────────────────┘
                            │ cloned at activation
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2 — FY Snapshot (FYActiveKPI)                         │
│  POST   /fy-active-kpis/activate/bulk                        │
│  PUT    /fy-active-kpis/targets/bulk                         │
│  GET    /fy-active-kpis                                      │
│  GET    /fy-active-kpis/{id}                                 │
│  PUT    /fy-active-kpis/{id}  (edit snapshot metadata)       │
│  DELETE /fy-active-kpis/{id}                                 │
│  Year-specific copy of KPI with agency-level targets.        │
└───────────────────────────┬──────────────────────────────────┘
                            │ assigned after targets set
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 3 — KPI Assignments (Office Targets)                  │
│  POST  /kpi-assignments           (single)                   │
│  POST  /kpi-assignments/bulk      (multi-office per KPI)     │
│  PUT   /kpi-assignments/{id}      (update)                   │
│  PUT   /kpi-assignments/lock-status/bulk                     │
│  DELETE /kpi-assignments/{id}                                │
│  GET   /kpi-assignments                                      │
│  GET   /kpi-assignments/{id}                                 │
│  Office-level target distribution for a given FYActiveKPI.  │
└──────────────────────────────────────────────────────────────┘
```

### Mandatory Workflow Order

```
Activate KPIs  →  Set Agency Targets  →  (Optional) Validate  →  Assign to Offices
```

Jumping ahead is blocked by the server:
- Assignment requires parent `FYActiveKPI.Status === "TargetsSet"`.
- Target updates are blocked once a KPI has any office assignment.

---

## Phase 1 — Browse the Master KPI Catalog

Use this to present a searchable, filterable KPI list to the user before any fiscal-year operations.

### Endpoint

```http
GET /kpis
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | `int` | Page number (1-based) |
| `pageSize` | `int` | Items per page |
| `sorts` | `string` | Sieve sort string — e.g., `name`, `-createdAt` |
| `filters` | `string` | Sieve filter string — e.g., `status==Active`, `name@=Vacancy` |
| `targetFiscalYearId` | `Guid?` | Annotate each KPI with activation status for this FY |
| `sourceFiscalYearId` | `Guid?` | Annotate each KPI with activation status for a prior/reference FY |

> Both fiscal year parameters are optional. Omit them for a plain KPI library view.

### Example — Plain List

```http
GET /kpis?pageSize=20&page=1&sorts=name&filters=status==Active
```

### Example — With Fiscal Year Activation Context (Carry-Over Use Case)

```http
GET /kpis?targetFiscalYearId=<FY2026-ID>&sourceFiscalYearId=<FY2025-ID>&pageSize=50&page=1
```

### Response Shape

```json
{
  "data": [
    {
      "id": "aaaa-1111-...",            // MasterKPIId — always use this for activation
      "parentKPIId": null,
      "ParentKPI": null,
      "mfopapId": "...",
      "name": "Vacancy Rate",
      "code": "HR-001",
      "description": "...",
      "measurementUnit": "Percentage",
      "distributionBehavior": "Summation",
      "functionCategory": "Core",
      "monitoringFrequency": "Quarterly",
      "isOptInAvailable": true,
      "isGAD": false,
      "status": "Active",

      // Populated only when targetFiscalYearId is provided
      "isActivatedForTargetFY": false,
      "targetFYActiveKPIId": null,

      // Populated only when sourceFiscalYearId is provided
      "isActivatedForSourceFY": true,
      "sourceFYActiveKPIId": "bbbb-2222-...",

      "createdAt": "2025-01-01T00:00:00Z",
      "createdBy": "admin",
      "KPIMeasurements": [ ... ],
      "KPITargets": [ ... ]
    }
  ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 120
}
```

### Activation Context Fields Quick Reference

| Field | `true` | `false` | `null` |
|---|---|---|---|
| `isActivatedForTargetFY` | Already activated in target FY | Not yet activated | `targetFiscalYearId` not provided |
| `targetFYActiveKPIId` | FYActiveKPI ID in target FY | `null` | `null` |
| `isActivatedForSourceFY` | Was active in source/prior FY | Was not active | `sourceFiscalYearId` not provided |
| `sourceFYActiveKPIId` | FYActiveKPI ID in source FY | `null` | `null` |

---

## Phase 2 — Activate KPIs for a Fiscal Year

Creates `FYActiveKPI` snapshots from the master KPI library. Two modes are supported.

### Endpoint

```http
POST /fy-active-kpis/activate/bulk
```

### Request Body

```json
{
  "fiscalYearId": "<target-FY-GUID>",
  "cloneMode": "Master",
  "sourceFiscalYearId": null,
  "kpis": [
    { "masterKPIId": "<MasterKPI-GUID>" },
    { "masterKPIId": "<MasterKPI-GUID>" }
  ]
}
```

### `cloneMode` Values

| Value | When to use | `sourceFiscalYearId` |
|---|---|---|
| `"Master"` | Standard activation — clone from master KPI definition (default) | Not required |
| `"SourceFY"` | Carry-over — clone from an existing FY snapshot (preserves edits made to that snapshot) | **Required** |

> Always send `masterKPIId` in the `kpis` array, regardless of `cloneMode`. The backend resolves which snapshot to clone from on the server side.

### Mode A — Standard Activation (Master Clone)

The snapshot will use the current master KPI name, description, measurements, and metadata.

```json
{
  "fiscalYearId": "<FY2026-ID>",
  "cloneMode": "Master",
  "kpis": [
    { "masterKPIId": "aaaa-1111-..." },
    { "masterKPIId": "cccc-3333-..." }
  ]
}
```

### Mode B — Carry-Over Activation (Source FY Clone)

The snapshot will use the name, description, measurements, and metadata **as they were modified in the source FY**, not the current master definition. This is the "carry-over with FY edits" path.

```json
{
  "fiscalYearId": "<FY2026-ID>",
  "cloneMode": "SourceFY",
  "sourceFiscalYearId": "<FY2025-ID>",
  "kpis": [
    { "masterKPIId": "aaaa-1111-..." },
    { "masterKPIId": "cccc-3333-..." }
  ]
}
```

> **Note:** If a KPI in `kpis[]` was not activated in the `sourceFiscalYearId` year, the backend falls back to cloning from the master definition automatically.

### Response — `201 Created`

```json
{
  "data": [
    {
      "id": "<FYActiveKPI-GUID>",       // Use this for target-setting and assignments
      "fiscalYearId": "<FY2026-ID>",
      "masterKPIId": "aaaa-1111-...",
      "name": "Vacancy Rate",
      "status": "Draft",
      "agencyTargetAnnual": 0,
      "isOptInAvailable": true,
      ...
    }
  ],
  "succeeded": true
}
```

### Carry-Over Screen: How to Tie Phase 1 and Phase 2 Together

```ts
// 1. Load enriched KPI list
const { data: kpis } = await api.get('/kpis', {
  params: { targetFiscalYearId: FY2026.id, sourceFiscalYearId: FY2025.id, pageSize: 50, page: 1 }
});

// 2. Identify carry-over candidates
const candidates = kpis.filter(
  k => k.isActivatedForSourceFY === true && k.isActivatedForTargetFY === false
);

// 3. Activate (standard mode — use master definitions)
await api.post('/fy-active-kpis/activate/bulk', {
  fiscalYearId: FY2026.id,
  cloneMode: 'Master',
  kpis: candidates.map(k => ({ masterKPIId: k.id })),
});

// --- OR: carry-over with FY2025 snapshot edits ---
await api.post('/fy-active-kpis/activate/bulk', {
  fiscalYearId: FY2026.id,
  cloneMode: 'SourceFY',
  sourceFiscalYearId: FY2025.id,
  kpis: candidates.map(k => ({ masterKPIId: k.id })),
});
```

---

## Phase 3 — Set Agency-Level Targets

After activation, KPIs are in `Draft` status. Set the agency targets to move them to `TargetsSet` (which is required before assignment).

### Endpoint

```http
PUT /fy-active-kpis/targets/bulk
```

### Request Body

All items must belong to the **same fiscal year**.

```json
[
  {
    "fyActiveKPIId": "<FYActiveKPI-GUID>",
    "agencyTargetAnnual": 100,
    "agencyTargetQ1": 25,
    "agencyTargetQ2": 25,
    "agencyTargetQ3": 25,
    "agencyTargetQ4": 25
  },
  {
    "fyActiveKPIId": "<FYActiveKPI-GUID>",
    "agencyTargetAnnual": 90
  }
]
```

> Quarterly values (`agencyTargetQ1`–`Q4`) are optional. Omit them if the KPI does not have quarterly monitoring.

### Quarterly Validation Rules by `distributionBehavior`

| Behavior | Rule |
|---|---|
| `Summation` | Sum of provided quarterly values ≤ annual |
| `Uniform` | Each provided quarterly value == annual |
| `Maximum` | Each provided quarterly value ≤ annual |
| `Minimum` | Each provided quarterly value ≥ annual |
| `Milestone` | No special quarterly constraint |

### Other Enforced Rules

- Cannot update targets for a KPI that already has **any** office assignment. Unassign first.
- Quarterly values (if provided) must be non-negative.

### Response — `200 OK`

```json
{
  "data": 5,
  "succeeded": true,
  "message": "5 targets updated successfully."
}
```

---

## Phase 4 — Validate Assignment Readiness (Optional)

Use this to gate the UI before showing the assignment screen. Returns a summary of which KPIs are ready.

### Endpoint

```http
GET /fy-active-kpis/validate-for-assignment?fiscalYearId=<FY-GUID>
```

### Response — `200 OK`

```json
{
  "data": {
    "isReadyForAssignment": false,
    "totalKPIs": 10,
    "kpisWithTargets": 7,
    "kpisWithoutTargets": 3
  },
  "succeeded": true
}
```

Use `isReadyForAssignment` to enable/disable the "Proceed to Assignment" button.

---

## Phase 5 — Assign KPIs to Offices

### 5A — Bulk Assignment (Planning assigns targets to offices)

The primary assignment path. Assigns multiple offices from multiple KPIs in one call.

#### Endpoint

```http
POST /kpi-assignments/bulk
```

#### Request Body

```json
[
  {
    "fyActiveKPIId": "<FYActiveKPI-GUID>",
    "officeAssignments": [
      {
        "officeId": "<Office-GUID>",
        "source": "Assigned",
        "assignedTargetAnnual": 50,
        "assignedTargetQ1": 12,
        "assignedTargetQ2": 13,
        "assignedTargetQ3": 12,
        "assignedTargetQ4": 13,
        "isLocked": false
      },
      {
        "officeId": "<another-Office-GUID>",
        "source": "Assigned",
        "assignedTargetAnnual": 50,
        "isLocked": false
      }
    ]
  }
]
```

#### `source` Values

| Value | Meaning | `assignedTargetAnnual` | Quarterly targets |
|---|---|---|---|
| `"Assigned"` | Planning sets the target for the office | **Required** (> 0) | Optional |
| `"Shopped"` | Office opts in — target set by the office later | **Must be null** | **Must be null** |

#### Quarterly Validation for `Assigned` Source

The same `distributionBehavior` rules from Phase 3 apply at the assignment level, but against the agency target. For example, for `Summation`:

```
(existing cumulative assigned + new assignedTargetAnnual) ≤ agencyTargetAnnual
```

Additional rule — when `measurementUnit === "Percentage"`:
- `assignedTargetAnnual` and all provided quarterly values must be ≤ 100.

#### Response — `200 OK`

```json
{
  "data": {
    "totalKPIsProcessed": 2,
    "totalOfficesAssigned": 4,
    "createdAssignmentIds": ["<id1>", "<id2>", "<id3>", "<id4>"]
  },
  "succeeded": true
}
```

---

### 5B — Single Assignment

Use this when assigning one KPI to one office (e.g., from an office detail page).

#### Endpoint

```http
POST /kpi-assignments
```

#### Request Body

```json
{
  "fyActiveKPIId": "<FYActiveKPI-GUID>",
  "officeId": "<Office-GUID>",
  "source": "Assigned",
  "assignedTargetAnnual": 50,
  "assignedTargetQ1": 12.5,
  "assignedTargetQ2": 12.5,
  "assignedTargetQ3": 12.5,
  "assignedTargetQ4": 12.5,
  "isLocked": false
}
```

#### Response — `201 Created`

```json
{
  "data": "<new-KPIAssignment-GUID>",
  "succeeded": true
}
```

---

### 5C — Shopping (Office Self-Enrollment)

An office can shop/opt into a KPI without a pre-assigned target. The office sets its own target value after enrolling.

#### Step 1 — Get Available (Shoppable) KPIs for an Office

Returns `FYActiveKPI` records that:
1. Have `isOptInAvailable === true`
2. Have not yet been assigned or shopped by the given office

```http
GET /fy-active-kpis?AvailableForOfficeId=<Office-GUID>&fiscalYearId=<FY-GUID>&pageSize=20&page=1
```

#### Step 2 — Create a "Shopped" Assignment

```json
POST /kpi-assignments
{
  "fyActiveKPIId": "<FYActiveKPI-GUID>",
  "officeId": "<Office-GUID>",
  "source": "Shopped",
  "assignedTargetAnnual": null,
  "assignedTargetQ1": null,
  "assignedTargetQ2": null,
  "assignedTargetQ3": null,
  "assignedTargetQ4": null,
  "isLocked": false
}
```

> With `source: "Shopped"`, all target fields **must be null** at creation. The office sets its targets via `PUT /kpi-assignments/{id}` later.

---

## Phase 6 — Supporting Assignment Operations

### Update an Assignment

```http
PUT /kpi-assignments/{id}
```

Same body shape as single create. Use this for:
- Setting targets on a "Shopped" assignment
- Adjusting target values (while the parent FYActiveKPI has no locked assignments)

### Bulk Lock/Unlock Assignments

Locks prevent further edits to an assignment. Typically applied once planning is finalized.

```http
PUT /kpi-assignments/lock-status/bulk
```

```json
[
  {
    "fyActiveKPIId": "<FYActiveKPI-GUID>",
    "officeLockStatuses": [
      { "officeId": "<Office-GUID>", "isLocked": true },
      { "officeId": "<Office-GUID>", "isLocked": false }
    ]
  }
]
```

### Delete an Assignment

```http
DELETE /kpi-assignments/{id}
```

Response: `204 No Content`

### Query Assignments

```http
GET /kpi-assignments?page=1&pageSize=20&filters=officeId==<GUID>&sorts=-createdAt
```

The response for each item includes the nested `FYActiveKPI` and `Office` objects.

```json
{
  "data": [
    {
      "id": "<KPIAssignment-GUID>",
      "fyActiveKPIId": "<FYActiveKPI-GUID>",
      "officeId": "<Office-GUID>",
      "officeName": "Finance Office",
      "source": "Assigned",
      "assignedTargetAnnual": 50,
      "assignedTargetQ1": 12.5,
      "assignedTargetQ2": 12.5,
      "assignedTargetQ3": 12.5,
      "assignedTargetQ4": 12.5,
      "isLocked": false,
      "FYActiveKPI": { ... },
      "Office": { ... },
      "createdAt": "...",
      "createdBy": "..."
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 42
}
```

---

## FYActiveKPI Read Endpoints

### List

```http
GET /fy-active-kpis?fiscalYearId=<FY-GUID>&pageSize=20&page=1
```

Use the `AvailableForOfficeId` query param to filter to shoppable KPIs only (see Phase 5C).

### By ID

```http
GET /fy-active-kpis/{id}
```

Returns `FYActiveKPIDetails` — full detail including measurements, attributes, and SDGs.

### Edit Snapshot Metadata

```http
PUT /fy-active-kpis/{id}
```

Edits the FY-specific snapshot without touching the master KPI definition. Useful for adjusting a KPI's name/description/measurements for a specific fiscal year.

> These edits are preserved when using `cloneMode: "SourceFY"` in the next year's activation.

### Delete Snapshot

```http
DELETE /fy-active-kpis/{id}
```

Response: `204 No Content`

---

## Response Wrapper Format

All endpoints return one of these wrappers:

### `ApiResponse<T>` (single result)

```json
{
  "data": <T>,
  "succeeded": true,
  "message": null,
  "errors": []
}
```

### `PaginatedApiResponse<T>` (list result)

```json
{
  "data": [ <T>, ... ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 120,
  "succeeded": true
}
```

### Error Response

```json
{
  "data": null,
  "succeeded": false,
  "message": "Validation failed.",
  "errors": [
    "AssignedTargetAnnual is required when Source is 'Assigned'.",
    "FYActiveKPI must be in TargetsSet status before assigning."
  ]
}
```

Always check `succeeded` before consuming `data`. Display `errors[]` as a list for form validation feedback.

---

## Common Errors & How to Handle Them

| HTTP Status | Scenario | FE Action |
|---|---|---|
| `400 Bad Request` | Validation failed (see `errors[]`) | Display error messages from `errors` array |
| `404 Not Found` | Entity not found (invalid GUID) | Show "not found" message; refresh the list |
| `409 Conflict` | KPI already activated in target FY | Filter out already-activated rows (`isActivatedForTargetFY: true`) before submitting |
| `409 Conflict` | Duplicate office assignment | Prevent duplicate mapping in the UI before submitting |

---

## Full End-to-End Flow Summary

```
1. GET /kpis?targetFiscalYearId=FY2026&sourceFiscalYearId=FY2025
   └─ Identify carry-over candidates (isActivatedForSourceFY=true, isActivatedForTargetFY=false)

2. POST /fy-active-kpis/activate/bulk
   └─ cloneMode: "Master" (or "SourceFY" to preserve FY2025 edits)
   └─ kpis: [{ masterKPIId }]  ← always masterKPIId, never FYActiveKPIId

3. PUT /fy-active-kpis/targets/bulk
   └─ Set agencyTargetAnnual (+ optional quarterly) per FYActiveKPI
   └─ On success, KPIs transition from "Draft" → "TargetsSet"

4. GET /fy-active-kpis/validate-for-assignment?fiscalYearId=FY2026
   └─ Gate the UI: only proceed when isReadyForAssignment = true

5. POST /kpi-assignments/bulk
   └─ source: "Assigned" — provide assignedTargetAnnual + optional quarters
   └─ source: "Shopped"  — all target fields null; office fills in later

6. (Optional) PUT /kpi-assignments/lock-status/bulk
   └─ Lock assignments once planning is finalized
```

---

## Key ID Reference

| Field name | What it is | Where to send it |
|---|---|---|
| `kpi.id` | `MasterKPIId` — permanent identity | `POST /fy-active-kpis/activate/bulk` → `kpis[].masterKPIId` |
| `fyActiveKPI.id` | `FYActiveKPIId` — year-specific snapshot | `PUT /fy-active-kpis/targets/bulk` → `fyActiveKPIId`; `POST /kpi-assignments` → `fyActiveKPIId` |
| `kpiAssignment.id` | `KPIAssignmentId` | `PUT/DELETE /kpi-assignments/{id}` |
| `kpi.targetFYActiveKPIId` | `FYActiveKPIId` in **target** FY | Read-only; use for navigating to the snapshot detail |
| `kpi.sourceFYActiveKPIId` | `FYActiveKPIId` in **source** FY | Read-only; audit/display only — do not send to activation |

> **Never send `targetFYActiveKPIId` or `sourceFYActiveKPIId` as input to the activation endpoint.** Activation always takes the master `kpi.id`.

---

## Related Documentation

| Guide | Description |
|---|---|
| [KPI-Carry-Over-Frontend-Guide.md](./KPI-Carry-Over-Frontend-Guide.md) | Deep-dive on the carry-over UI with code samples |
| [FYActiveKPI-Workflow-APIs.md](./FYActiveKPI-Workflow-APIs.md) | Distribution behavior rules, target validation details |
| [KPI-Version-2-Guide.md](./KPI-Version-2-Guide.md) | Entity schema reference for all three layers |
