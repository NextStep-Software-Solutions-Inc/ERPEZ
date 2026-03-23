# KPI Carry-Over & Bulk Activation — Frontend Guide

## Overview

When planning a new fiscal year, administrators typically want to carry over the same KPIs that were active in the previous year rather than building the activation list from scratch. This guide explains how to build that UI using the enriched `GET /kpis` endpoint.

---

## Why This Approach (and Not "List All KPIs Per FY")

### The Naive Alternative

A straightforward approach would be to query `FYActiveKPI` records for both the source and target fiscal years, then show them side-by-side or in a merged list. The problem:

| Problem | Detail |
|---|---|
| **Name collision** | The same master KPI (e.g., "Vacancy Rate") exists under multiple FY snapshots with identical names. The user cannot tell which row to pick without cross-referencing the master. |
| **Duplicate confusion** | If `KPI X` was activated in FY2024, FY2025, and is being activated in FY2026, three rows with the same name appear. Users must manually deduplicate. |
| **Wrong ID in activation** | FYActiveKPI records expose `FYActiveKPIId`, but the activation endpoint requires `MasterKPIId`. Any UI built on FYActiveKPI data would send the wrong ID. |
| **Inflated response** | Full FYActiveKPI rows include targets, assignments, status, and measurement data — most of which is irrelevant to the activation decision. |
| **No single "activate" gate** | You would need separate logic to detect whether a given name is already activated in the target year, requiring a second query and client-side join. |

### The Efficient Approach: Enrich `GET /kpis`

The master KPI list (`GET /kpis`) is the single canonical source of truth. Every `FYActiveKPI` is derived from a master KPI. By asking the endpoint to annotate each master KPI with its activation status for a given fiscal year, the frontend receives:

1. **One response, two pieces of information** — "was this KPI active last year?" and "is it already active this year?" — resolved server-side in a single DB scan.
2. **Zero duplicate rows** — the master KPI list contains exactly one row per KPI, regardless of how many years it has been activated.
3. **Correct identity** — `id` on every row is always the `MasterKPIId`. You send it directly to the activation endpoint with no translation.
4. **Minimal payload** — the server only queries `FYActiveKPI` rows for the current page of master KPIs (not the entire table), making it safe at scale.

---

## API Reference

### Endpoint

```http
GET /kpis
```

### Query Parameters for Activation Context

| Parameter | Type | Description |
|---|---|---|
| `targetFiscalYearId` | `Guid` | The fiscal year you are **activating KPIs into**. |
| `sourceFiscalYearId` | `Guid` | A prior fiscal year to use as the **carry-over reference**. |
| `pageSize` | `int` | Page size for pagination. |
| `page` | `int` | Page number. |
| `filters` | `string` | Sieve filter string (e.g., `name@=Vacancy`). |
| `sorts` | `string` | Sieve sort string (e.g., `name`). |

> Both fiscal year parameters are **optional**. If omitted, the four activation context fields return `null` (backward-compatible with any existing KPI list UI).

### Example Request — Carry-Over Screen

```http
GET /kpis?targetFiscalYearId=<FY2026-GUID>&sourceFiscalYearId=<FY2025-GUID>&pageSize=50&page=1
```

### Response Shape (abbreviated)

```json
{
  "data": [
    {
      "id": "aaaa-1111-...",
      "name": "Vacancy Rate",
      "code": "HR-001",
      "status": "Active",
      "isActivatedForTargetFY": false,
      "targetFYActiveKPIId": null,
      "isActivatedForSourceFY": true,
      "sourceFYActiveKPIId": "bbbb-2222-..."
    },
    {
      "id": "cccc-3333-...",
      "name": "Budget Utilization Rate",
      "code": "FIN-002",
      "status": "Active",
      "isActivatedForTargetFY": true,
      "targetFYActiveKPIId": "dddd-4444-...",
      "isActivatedForSourceFY": true,
      "sourceFYActiveKPIId": "eeee-5555-..."
    },
    {
      "id": "ffff-6666-...",
      "name": "Training Hours Per Employee",
      "code": "HR-003",
      "status": "Active",
      "isActivatedForTargetFY": null,
      "targetFYActiveKPIId": null,
      "isActivatedForSourceFY": null,
      "sourceFYActiveKPIId": null
    }
  ],
  "pageNumber": 1,
  "pageSize": 50,
  "totalCount": 120
}
```

> Note: The third row has `null` values. This happens when neither fiscal year parameter is passed, or if this KPI was added after the query was cached. When both parameters are provided, expect `true`/`false` (never `null`) for those fields.

---

## Understanding the Four Activation Context Fields

| Field | Type | Meaning |
|---|---|---|
| `isActivatedForTargetFY` | `bool?` | `true` = already activated in the **target** year; `false` = not yet activated; `null` = no `targetFiscalYearId` was passed |
| `targetFYActiveKPIId` | `Guid?` | The `FYActiveKPIId` in the **target** year (populated only when `isActivatedForTargetFY === true`) |
| `isActivatedForSourceFY` | `bool?` | `true` = was activated in the **source** year; `false` = was not used last year; `null` = no `sourceFiscalYearId` was passed |
| `sourceFYActiveKPIId` | `Guid?` | The `FYActiveKPIId` in the **source** year (for audit/display; not used for activation) |

---

## ID Reference Table

| Field | What it is | Where it goes |
|---|---|---|
| `id` (on any KPI row) | `MasterKPIId` — the canonical KPI identity | `POST /fy-active-kpis/activate/bulk` → `"masterKPIId"` |
| `targetFYActiveKPIId` | `FYActiveKPIId` in the **target** year | `PUT /fy-active-kpis/targets/bulk`, assignment endpoints |
| `sourceFYActiveKPIId` | `FYActiveKPIId` in the **source** year | Display / audit trail only |

> **Never send `targetFYActiveKPIId` or `sourceFYActiveKPIId` as the input to an activation call.** Activation always takes the master `id`.

---

## Building the Carry-Over Screen

### Step 1 — Load the Enriched KPI List

Call `GET /kpis` with both fiscal year IDs:

```ts
const response = await api.get('/kpis', {
  params: {
    targetFiscalYearId: targetFY.id,   // FY2026
    sourceFiscalYearId: sourceFY.id,   // FY2025
    pageSize: 50,
    page: currentPage,
  },
});
```

### Step 2 — Build the Display Table

Render all returned KPIs in a table. Use the context fields to drive the UI state of each row:

```ts
// Carry-over candidates: active last year, not yet active this year
const isCarryOverCandidate =
  kpi.isActivatedForSourceFY === true &&
  kpi.isActivatedForTargetFY === false;

// Already activated: show a "Already Active" badge, disable checkbox
const isAlreadyActive = kpi.isActivatedForTargetFY === true;

// New KPI (not used last year): show an "New" badge, still selectable
const isNewThisYear =
  kpi.isActivatedForSourceFY === false &&
  kpi.isActivatedForTargetFY === false;
```

Recommended columns:

| Column | Source | Notes |
|---|---|---|
| Name | `kpi.name` | |
| Code | `kpi.code` | |
| Used in FY2025 | `kpi.isActivatedForSourceFY` | Checkbox / badge |
| Already in FY2026 | `kpi.isActivatedForTargetFY` | If `true`, show "Active" badge, disable row selection |
| Select | — | Show checkbox only when `isActivatedForTargetFY === false` |

### Step 3 — "Select All Carry-Over" Button

```ts
const carryOverCandidates = kpis.filter(
  kpi => kpi.isActivatedForSourceFY === true && kpi.isActivatedForTargetFY === false
);

function selectAllCarryOver() {
  setSelectedIds(carryOverCandidates.map(kpi => kpi.id)); // kpi.id = MasterKPIId
}
```

### Step 4 — Submit Activation

Send **`kpi.id`** (the `MasterKPIId`) for each selected row:

```ts
await api.post('/fy-active-kpis/activate/bulk', {
  fiscalYearId: targetFY.id,           // FY2026
  kpis: selectedIds.map(id => ({
    masterKPIId: id,                   // kpi.id — NOT targetFYActiveKPIId
  })),
});
```

After a successful response, re-fetch the KPI list — previously `false` rows for `isActivatedForTargetFY` will now return `true`.

---

## Complete Workflow Example

**Scenario:** FY2025 just closed. The planning team is setting up FY2026 and wants to carry over all KPIs that were active last year.

```
FY2025 (source)   ─────────────────────────────────────────────────────────
  FYActiveKPI #B  ←  MasterKPI "Vacancy Rate"         (id = aaaa-1111)
  FYActiveKPI #C  ←  MasterKPI "Budget Utilization"   (id = cccc-3333)

FY2026 (target)   ─────────────────────────────────────────────────────────
  FYActiveKPI #D  ←  MasterKPI "Budget Utilization"   (id = cccc-3333)  ✅ already done
  (empty)         ←  MasterKPI "Vacancy Rate"          (id = aaaa-1111)  ← needs activation
```

1. **Request:**
   ```
   GET /kpis?targetFiscalYearId=FY2026&sourceFiscalYearId=FY2025
   ```

2. **Response rows relevant to the scenario:**
   - `"Vacancy Rate"` → `isActivatedForSourceFY: true`, `isActivatedForTargetFY: false` → **candidate**
   - `"Budget Utilization"` → `isActivatedForSourceFY: true`, `isActivatedForTargetFY: true` → **skip**

3. **User clicks "Select All Carry-Over"** → only "Vacancy Rate" is selected.

4. **Submit:**
   ```json
   POST /fy-active-kpis/activate/bulk
   {
     "fiscalYearId": "<FY2026-GUID>",
     "kpis": [
       { "masterKPIId": "aaaa-1111-..." }
     ]
   }
   ```

5. **Result:** A new `FYActiveKPI` snapshot is created for "Vacancy Rate" in FY2026.

---

## Filtering on the Server Side (Optional)

To show **only carry-over candidates** (active in source, not yet in target) without client-side filtering, you can combine Sieve filters with the activation parameters. At this time, server-side `isActivatedForSourceFY`/`isActivatedForTargetFY` filters are not Sieve-exposed. Client-side filtering of the paginated response is the current approach.

If the KPI library is large, reduce noise by filtering master KPIs by `Status`:

```
GET /kpis?targetFiscalYearId=...&sourceFiscalYearId=...&filters=status==Active
```

---

## Error Cases

| Scenario | What happens |
|---|---|
| KPI already activated in target FY | `POST /fy-active-kpis/activate/bulk` returns `409 Conflict` for that KPI. The `isActivatedForTargetFY: true` check on the FE prevents this before submission. |
| `targetFiscalYearId` not provided | Activation context fields return `null`. The screen should require the user to select a target fiscal year before rendering the table. |
| Invalid fiscal year GUID | The handler returns an empty activation map — all rows show `isActivatedForTargetFY: false` and `isActivatedForSourceFY: false`. |

---

## Summary

```
GET /kpis
  ?targetFiscalYearId=<FY2026>     ← "where am I activating to?"
  &sourceFiscalYearId=<FY2025>     ← "what was used last year?"
```

- One request, zero joins required on the frontend.
- Rows with `isActivatedForSourceFY: true` and `isActivatedForTargetFY: false` are your carry-over list.
- Always send `kpi.id` (the `MasterKPIId`) to the activation endpoint — never the `FYActiveKPIId` variants.
