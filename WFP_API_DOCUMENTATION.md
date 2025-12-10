# WFP API Documentation

This document describes the Work and Financial Plan (WFP) API endpoints, including CRUD operations for WFP, WFPObjective, WFPObjectiveTarget, WFPObjectiveTimeline, and ActivityBudgetRequirement entities.

## Table of Contents

- [WFP (Work and Financial Plan)](#wfp-work-and-financial-plan)
- [WFP Objectives](#wfp-objectives)
- [WFP Objective Targets (Activities)](#wfp-objective-targets-activities)
- [WFP Objective Timelines](#wfp-objective-timelines)
- [Activity Budget Requirements](#activity-budget-requirements)
- [Validation Rules](#validation-rules)

---

## WFP (Work and Financial Plan)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wfps` | Create a new WFP |
| GET | `/wfps` | Get all WFPs (paginated) |
| GET | `/wfps/{id}` | Get WFP by ID |
| PUT | `/wfps/{id}` | Update WFP |
| PATCH | `/wfps/{id}/status` | Update WFP status |
| DELETE | `/wfps/{id}` | Delete WFP |

### Create WFP

**Request Body:**

```json
{
  "deliveryUnitId": "guid",
  "projectTitle": "string (required, 5-250 chars)",
  "description": "string (optional, max 1000 chars)",
  "fiscalYear": "integer (optional)",
  "projectStartDate": "date (required)",
  "projectEndDate": "date (required, must be after start date)",
  "proposedBudget": "decimal (optional, auto-calculated from line items)",
  "generalObjective": "string (optional, max 1000 chars)",
  "status": "Draft|Submitted|Returned|Approved|Active|Archived (default: Draft)"
}
```

### Update WFP Status

**Request Body:**

```json
{
  "status": "Draft|Submitted|Returned|Approved|Active|Archived"
}
```

**Valid Status Transitions:**

| Current Status | Valid Transitions |
|---------------|-------------------|
| Draft | Submitted, Archived |
| Submitted | Approved, Returned, Archived |
| Returned | Draft, Submitted, Archived |
| Approved | Active, Returned, Archived |
| Active | Archived |
| Archived | Draft |

---

## WFP Objectives

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wfp-objectives` | Create a new objective |
| GET | `/wfp-objectives` | Get all objectives (paginated) |
| GET | `/wfp-objectives/{id}` | Get objective by ID |
| PUT | `/wfp-objectives/{id}` | Update objective |
| DELETE | `/wfp-objectives/{id}` | Delete objective |

### Create WFP Objective

**Request Body:**

```json
{
  "wfpId": "guid (required)",
  "description": "string (required, 10-1000 chars)",
  "weight": "decimal (required, 0.01-100)",
  "outcome": "decimal (optional)"
}
```

### Weight Validation Rules

- Total weight of all objectives for a WFP must not exceed 100%
- Creation is allowed even if total is below 100%
- Once total reaches 100%, no new objectives can be added
- Editing weights is allowed as long as the total doesn't exceed 100%

---

## WFP Objective Targets (Activities)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wfp-objective-targets` | Create a new activity |
| GET | `/wfp-objective-targets` | Get all activities (paginated) |
| GET | `/wfp-objective-targets/{id}` | Get activity by ID |
| PUT | `/wfp-objective-targets/{id}` | Update activity |
| DELETE | `/wfp-objective-targets/{id}` | Delete activity |

### Create WFP Objective Target (Activity)

**Request Body:**

```json
{
  "wfpObjectiveId": "guid (required)",
  "activityName": "string (required, 3-500 chars)",
  "indicator": "string (required, 3-500 chars)",
  "weight": "decimal (required, 0.01-100)"
}
```

### Weight Validation Rules

- Total weight of all targets for an objective must not exceed the parent objective's weight
- Example: If an objective has weight 20%, all its targets must total ≤ 20%
- Editing weights is allowed as long as total doesn't exceed parent weight

---

## WFP Objective Timelines

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wfp-objective-timelines` | Create a new timeline |
| GET | `/wfp-objective-timelines` | Get all timelines (paginated) |
| GET | `/wfp-objective-timelines/{id}` | Get timeline by ID |
| PUT | `/wfp-objective-timelines/{id}` | Update timeline |
| DELETE | `/wfp-objective-timelines/{id}` | Delete timeline |

### Create WFP Objective Timeline

**Request Body:**

```json
{
  "wfpObjectiveTargetId": "guid (required)",
  "startDate": "date (required)",
  "endDate": "date (required, must be after start date)",
  "targetValue": "decimal (required, must be > 0)"
}
```

### Timeline Types (Based on UI)

Timelines can be created with different granularities:

- **Daily** - Select specific days with target values
- **Weekly** - Select specific weeks with target values
- **Monthly** - Select specific months with target values
- **Quarterly** - Select Q1-Q4 with target values
- **Annually** - Select years with target values

Note: Only one timeline type per activity is supported.

---

## Activity Budget Requirements

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activity-budget-requirements` | Create a new budget requirement |
| GET | `/activity-budget-requirements` | Get all budget requirements (paginated) |
| GET | `/activity-budget-requirements/{id}` | Get budget requirement by ID |
| PUT | `/activity-budget-requirements/{id}` | Update budget requirement |
| DELETE | `/activity-budget-requirements/{id}` | Delete budget requirement |

### Create Activity Budget Requirement

**Request Body:**

```json
{
  "wfpObjectiveTargetId": "guid (required)",
  "objectId": "guid (required - Type of Expenditure)",
  "itemDescription": "string (required, 5-500 chars)",
  "quantity": "integer (required, must be > 0)",
  "costEstimates": "decimal (required, must be > 0)"
}
```

### Expenditure Types (Objects)

Objects represent types of expenditure and their line items:

- **PS** - Personal Services
  - Honorarium
  - Salary
  - Allowances
- **MOOE** - Maintenance and Other Operating Expenses
  - Utility Expenses
  - Communication Expenses
  - Representation Expense
- **CO** - Capital Outlay
  - Equipment
  - Building/Infrastructure

---

## Validation Rules

### General Rules

1. **ProposedBudget Calculation**: The WFP's ProposedBudget is optional and can be auto-calculated from the total of all ActivityBudgetRequirement line items.

2. **WFP Objective Weights**:
   - Sum of all objective weights must not exceed 100%
   - Objectives can be created if total is below 100%
   - No new objectives can be added when total reaches 100%
   - Editing is allowed as long as total stays ≤ 100%

3. **WFP Objective Target Weights**:
   - Sum of target weights must not exceed parent objective's weight
   - Example: If objective weight = 20%, targets must total ≤ 20%

4. **Timeline Overlap Prevention**:
   - Timeline periods cannot overlap for the same activity

5. **Status Transitions**:
   - Only valid status transitions are allowed (see status table above)

### Field Validations

| Entity | Field | Validation |
|--------|-------|------------|
| WFP | projectTitle | Required, 5-250 chars |
| WFP | description | Optional, max 1000 chars |
| WFP | projectEndDate | Must be after projectStartDate |
| WFP | proposedBudget | Optional, non-negative |
| WFPObjective | description | Required, 10-1000 chars |
| WFPObjective | weight | Required, 0.01-100 |
| WFPObjectiveTarget | activityName | Required, 3-500 chars |
| WFPObjectiveTarget | indicator | Required, 3-500 chars |
| WFPObjectiveTarget | weight | Required, 0.01-100 |
| WFPObjectiveTimeline | startDate | Required |
| WFPObjectiveTimeline | endDate | Required, after startDate |
| WFPObjectiveTimeline | targetValue | Required, > 0 |
| ActivityBudgetRequirement | itemDescription | Required, 5-500 chars |
| ActivityBudgetRequirement | quantity | Required, > 0 |
| ActivityBudgetRequirement | costEstimates | Required, > 0 |

---

## Query Parameters

All list endpoints support the following query parameters for pagination and filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| pageNumber | int | Page number (default: 1) |
| pageSize | int | Items per page (default: 10) |
| filters | string | Sieve filter string |
| sorts | string | Sieve sort string |

### Filter Examples

```
# Filter by WFP ID
?filters=wfpId==guid-here

# Filter by status
?filters=status==Draft

# Multiple filters
?filters=fiscalYear==2025,status==Approved
```

### Sort Examples

```
# Sort by created date descending
?sorts=-createdAt

# Sort by project title ascending
?sorts=projectTitle
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "succeeded": false,
  "message": "Error message here",
  "errors": ["List of validation errors"]
}
```

### Common Error Codes

- **400 Bad Request** - Validation errors or invalid input
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource exists
