# KPI Version 2 Guide (Aligned to Current Backend)

## 1) Registry Layer (Master KPI Library)

### Entity: KPI
- `Id` (UUID, PK)
- `ParentKPIId` (UUID, FK, nullable)
- `MFOPAPId` (UUID, FK)
- `Name`, `Code`, `Description`
- `MeasurementUnit` (Enum: `Number`, `Percentage`, `Currency`)
- `DistributionBehavior` (Enum: `Summation`, `Uniform`, `Maximum`, `Minimum`, `Milestone`)
- `FunctionCategory` (Enum: `Strategic`, `Core`, `Support`)
- `MonitoringFrequency` (Enum: `Quarterly`, `Semi-Annual`, `Annual`, optional)
- `IsOptInAvailable`, `IsGAD`
- `Status` (`Active` / `Inactive`)

### Entity: KPIMeasurement
- `Id` (UUID, PK)
- `KPIId` (UUID, FK)
- `Dimension` (Enum: `Quantity`, `Quality`, `Timeliness`)
- `RatingTemplateId` (UUID, FK)
- `MOVs` (array)
- `IsMOVEditable`, `IsScaleEditable`

## 2) Annual Snapshot Layer (FY Active)

Activation copies KPI metadata and measurements into FY-specific records.

### Entity: FYActiveKPI
- `Id` (UUID, PK)
- `FiscalYearId` (UUID, FK)
- `MasterKPIId` (UUID, FK)
- Snapshotted metadata from KPI (`Name`, `Code`, `MeasurementUnit`, `DistributionBehavior`, etc.)
- `AgencyTargetAnnual` (decimal)
- `AgencyTargetQ1..Q4` (decimal?, optional)
- `Status` (notably `Draft` or `TargetsSet` in current workflow)

### Entity: FYActiveKPIMeasurement
- `Id` (UUID, PK)
- `FYActiveKPIId` (UUID, FK)
- Snapshotted measurement fields from master

## 3) Assignment Layer (Office Targets)

### Entity: KPIAssignment
- `Id` (UUID, PK)
- `FYActiveKPIId` (UUID, FK)
- `OfficeId` (UUID, FK)
- `AssignedTargetAnnual` (decimal)
- `AssignedTargetQ1..Q4` (decimal?, optional)
- `IsLocked` (bool)

## 4) Enforced Workflow Rules

1. **Assign only after targets are set**
   - Create/Update/Bulk assignment requires parent FYActiveKPI status = `TargetsSet`.
2. **No target changes after assignment starts**
   - Bulk FY target setting rejects updates for KPIs already assigned to any office.
3. **Same fiscal year per bulk target update**
   - All items in `PUT /fy-active-kpis/targets/bulk` must belong to one fiscal year.

## 5) Target Behavior Rules (Current)

### FY Active Target-Setting (`PUT /fy-active-kpis/targets/bulk`)
If quarterly values are provided:
- `Summation`: sum of provided quarterly values must be **<= annual**
- `Uniform`: each provided quarterly value must be **== annual**
- `Maximum`: each provided quarterly value must be **<= annual**
- `Minimum`: each provided quarterly value must be **>= annual**
- `Milestone`: flexible quarterly validation

Also enforced:
- quarterly values (if provided) must be non-negative

### KPI Assignment Create/Update/Bulk
- `Summation`: cumulative office assigned annual (`existing + new`) must be **<= agency annual**
- `Uniform`: each office assigned annual must be **== agency annual**
- `Maximum`: each office assigned annual must be **<= agency annual**
- `Minimum`: each office assigned annual must be **>= agency annual**
- `Milestone`: flexible annual assignment validation

Uniform quarterly consistency at assignment level:
- if `AssignedTargetQ1..Q4` values are provided, each provided quarter must be **== assigned annual**

Percentage unit rule at assignment level:
- when `MeasurementUnit = Percentage`, annual and any provided quarters must be **<= 100**

## 6) Quarterly Proposal Behavior

- `AssignedTargetQ1..Q4` are optional in KPI assignment.
- If left null by Planning, office-level proposal flows can still phase targets later.
- For Uniform behavior, once quarter values are provided, strict equality to annual is enforced.

## 7) Assignment Query Payload Shape (Current)

`GetKPIAssignments` and `GetKPIAssignmentById` now return nested:
- `FYActiveKPI` (full relevant snapshot details, measurements, MFOPAP, attributes, SDGs)
- `Office` (full relevant office details including parent entities)

This supports frontend screens without additional lookup chaining.

## 8) Developer Definition of Done

- Master KPI edits do not mutate existing FY snapshots.
- Assignment is blocked until FY target-setting is complete (`TargetsSet`).
- Behavior validation is consistent across create, bulk create, and update flows.
- Uniform quarterly consistency is enforced at FY target-setting and assignment layers.
- API responses for assignment screens include nested FYActiveKPI and Office details.
