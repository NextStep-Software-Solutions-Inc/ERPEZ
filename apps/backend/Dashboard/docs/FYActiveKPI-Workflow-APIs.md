# FYActiveKPI Workflow APIs (Aligned to Current Backend)

## Implemented Endpoints

### 1) Activate FY KPIs
```http
POST /fy-active-kpis/activate/bulk
```
Creates FYActiveKPI snapshots from master KPI definitions.

Status behavior in current workflow:
- if target values are included at activation time, KPI can enter `TargetsSet`
- otherwise KPI remains `Draft` until target-setting is completed

---

### 2) Bulk Set FY Targets
```http
PUT /fy-active-kpis/targets/bulk
{
  "fiscalYearId": "...",
  "targets": [
    {
      "fyActiveKPIId": "...",
      "agencyTargetAnnual": 100,
      "agencyTargetQ1": 25,
      "agencyTargetQ2": 25,
      "agencyTargetQ3": 25,
      "agencyTargetQ4": 25
    },
    {
      "fyActiveKPIId": "...",
      "agencyTargetAnnual": 90
    }
  ]
}
```
Returns count of updated KPIs.

Enforced validations:
- KPI must exist
- all target items in the batch must belong to the same fiscal year
- cannot update targets when KPI already has office assignments
- quarterly values (if provided) must be non-negative
- distribution behavior quarterly validation is enforced
- successfully updated KPIs are set to `TargetsSet`

---

### 3) Validate Assignment Readiness
```http
GET /fy-active-kpis/validate-for-assignment?fiscalYearId=...
```
Returns summary of KPIs with/without targets for fiscal-year level readiness checks.

## Current Distribution Behavior Validation

### At FY Target-Setting Layer (`PUT /fy-active-kpis/targets/bulk`)
When quarterly values are provided:
- `Summation`: provided quarterly sum must be **<= annual**
- `Uniform`: each provided quarter must be **== annual**
- `Maximum`: each provided quarter must be **<= annual**
- `Minimum`: each provided quarter must be **>= annual**
- `Milestone`: flexible quarterly behavior

### At KPI Assignment Layer (Create / Bulk Create / Update)
Assignment operations validate against the parent FYActiveKPI behavior:
- `Summation`: cumulative assigned annual (`existing + new`) must be **<= agency annual**
- `Uniform`: assigned annual must be **== agency annual**
- `Maximum`: assigned annual must be **<= agency annual**
- `Minimum`: assigned annual must be **>= agency annual**
- `Milestone`: flexible annual validation

Uniform quarterly consistency in assignment:
- if quarter values are provided, each provided quarter must be **== assigned annual**

Percentage unit guard (assignment layer):
- when measurement unit is `Percentage`, annual and provided quarters must be **<= 100**

## Assignment Preconditions (Important)

Assignment create/bulk/update now requires:
- parent FYActiveKPI status is `TargetsSet`

Meaning:
- assigning `Draft` FYActiveKPIs is blocked
- no code toggles or manual uncommenting are required

## Practical Workflow

1. Activate FY KPIs
2. Set agency targets in bulk (or during activation)
3. Ensure KPIs move to `TargetsSet`
4. Run readiness validation endpoint as needed for UI gating
5. Create KPI assignments for offices

## Notes for Frontend Integration

- `AssignedTargetQ1..Q4` are optional in assignment requests
- for Uniform behavior, provided quarterly values must match annual exactly
- assignment query endpoints return nested `FYActiveKPI` and `Office` details (list and by-id)

## Build/Runtime Expectation

This document reflects the current handler and validator behavior implemented in:
- FYActiveKPI target setting
- KPI assignment create/bulk/update
- nested assignment query responses
