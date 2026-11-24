# WorkflowMatrix API - Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Business Logic](#architecture--business-logic)
3. [API Endpoint Details](#api-endpoint-details)
4. [Prerequisites](#prerequisites)
5. [Test Scenarios](#test-scenarios)
6. [Sample Test Data](#sample-test-data)
7. [Validation Rules](#validation-rules)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**WorkflowMatrix** defines approval workflows for documents within your ERP system. Each matrix specifies:
- **Which fiscal year** the workflow applies to
- **Which office** owns the workflow
- **What document type** it handles (optional - null means applies to all documents)
- **Who recommends** approval (via Position, resolved to User at runtime)
- **Who gives final approval** (via Position, resolved to User at runtime)

### Key Innovation: Position-Based Approvals
Instead of hardcoding user IDs, approvals are tied to **Positions** (e.g., "Budget Officer", "Finance Director"). The system automatically resolves the current person in that position via `PersonnelPosition` lookups.

**Benefits:**
- Workflows remain stable when personnel changes
- No need to update workflows when someone is promoted/transferred
- Organizational structure drives approval routing

---

## Architecture & Business Logic

### Entity Structure
```csharp
WorkflowMatrix
├── Id (Guid)
├── FiscalYearId (Guid) → FiscalYear
├── OfficeId (Guid) → Office
├── DocumentType (string?) - nullable, null = applies to all documents
├── Status (string) - "Active", "Inactive", "Pending", etc.
├── RecommendingApproverPositionId (Guid) → Position
└── FinalApproverPositionId (Guid) → Position
```

### Approval Flow
```
Document Submitted
    ↓
Recommending Approver (Position) → Resolved to User via PersonnelPosition
    ↓
Final Approver (Position) → Resolved to User via PersonnelPosition
    ↓
Approved/Rejected
```

### Runtime User Resolution
1. **System stores**: Position IDs (stable organizational structure)
2. **At runtime**: Lookup `PersonnelPosition` where `PositionId` matches and `IsActive = true`
3. **Get User**: From `PersonnelPosition.UserId`
4. **If vacant**: Position has no active personnel, approver fields are `null`

### Business Rules
1. **Uniqueness**: Only one workflow per `FiscalYear + Office + DocumentType` combination
2. **Cross-office approvals allowed**: Final approver can be from a different office (e.g., Head Office VP approving regional documents)
3. **Recommending approver**: Should typically be from the same office (logged but not blocked)
4. **Positions must exist**: Both positions must exist in the database
5. **FiscalYear & Office must exist**: Validated on creation

---

## API Endpoint Details

### Create WorkflowMatrix

**Endpoint**: `POST /api/workflow-matrices`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {your-jwt-token}
```

**Request Body**:
```json
{
  "fiscalYearId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "officeId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "documentType": "WFP",
  "recommendingApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "finalApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa9"
}
```

**Response** (201 Created):
```json
{
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afb0",
  "succeeded": true,
  "errors": [],
  "message": null
}
```

**Location Header**:
```
Location: /api/workflow-matrices/3fa85f64-5717-4562-b3fc-2c963f66afb0
```

---

## Prerequisites

Before testing, ensure you have:

### 1. **Valid Fiscal Year**
```sql
SELECT "Id", "Year", "Status" 
FROM planning."FiscalYears" 
WHERE "IsDeleted" = false 
LIMIT 5;
```

### 2. **Valid Office**
```sql
SELECT "Id", "Name", "Code" 
FROM planning."Offices" 
WHERE "IsDeleted" = false 
LIMIT 5;
```

### 3. **Valid Positions**
```sql
SELECT p."Id", p."Title", p."OfficeId", o."Name" as "OfficeName"
FROM planning."Positions" p
JOIN planning."Offices" o ON p."OfficeId" = o."Id"
WHERE p."IsDeleted" = false
LIMIT 10;
```

### 4. **Optional: Personnel Positions (for user resolution)**
```sql
SELECT pp."Id", pp."PositionId", pp."UserId", pp."IsActive",
       p."Title" as "PositionTitle",
       u."FirstName" || ' ' || u."LastName" as "UserName"
FROM planning."PersonnelPositions" pp
JOIN planning."Positions" p ON pp."PositionId" = p."Id"
JOIN "Users" u ON pp."UserId" = u."Id"
WHERE pp."IsActive" = true;
```

---

## Test Scenarios

### ✅ Scenario 1: Happy Path - Create Valid Workflow Matrix

**Test Case**: Create workflow for Finance Office WFP approval

**Setup**:
1. Get a valid `FiscalYearId` (e.g., Year 2026)
2. Get Finance Office `OfficeId`
3. Get "Budget Officer" `PositionId` (recommending approver)
4. Get "Finance Director" `PositionId` (final approver)

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "{fiscal-year-2026-id}",
  "officeId": "{finance-office-id}",
  "documentType": "WFP",
  "status": "Active",
  "recommendingApproverPositionId": "{budget-officer-position-id}",
  "finalApproverPositionId": "{finance-director-position-id}"
}
```

**Expected Result**:
- ✅ Status Code: `201 Created`
- ✅ Response contains new workflow matrix ID
- ✅ `Location` header points to new resource

**Verification**:
```sql
SELECT * FROM planning."WorkflowMatrices" 
WHERE "FiscalYearId" = '{fiscal-year-2026-id}' 
  AND "OfficeId" = '{finance-office-id}'
  AND "DocumentType" = 'WFP';
```

---

### ✅ Scenario 2: Cross-Office Hierarchical Approval

**Test Case**: Regional office WFPs approved by Head Office VP

**Setup**:
1. Get Regional Office `OfficeId`
2. Get "Regional Director" `PositionId` (in Regional Office)
3. Get "Vice President" `PositionId` (in Head Office)

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "{fiscal-year-id}",
  "officeId": "{regional-office-id}",
  "documentType": "WFP",
  "status": "Active",
  "recommendingApproverPositionId": "{regional-director-position-id}",
  "finalApproverPositionId": "{vp-position-id-from-head-office}"
}
```

**Expected Result**:
- ✅ Status Code: `201 Created`
- ✅ System allows cross-office final approver (valid business scenario)

---

### ✅ Scenario 3: Null DocumentType (Applies to All Documents)

**Test Case**: Create workflow that applies to all document types

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "{fiscal-year-id}",
  "officeId": "{office-id}",
  "documentType": null,
  "status": "Active",
  "recommendingApproverPositionId": "{position-id-1}",
  "finalApproverPositionId": "{position-id-2}"
}
```

**Expected Result**:
- ✅ Status Code: `201 Created`
- ✅ Workflow applies to all document types for this office/fiscal year

---

### ❌ Scenario 4: Duplicate Workflow (Validation Error)

**Test Case**: Attempt to create duplicate workflow

**Setup**:
1. Create a workflow (use Scenario 1 data)
2. Attempt to create the same workflow again


**Request**: (Same as Scenario 1)x`

**Expected Result**:
- ❌ Status Code: `400 Bad Request` or `409 Conflict`
- ❌ Error message: "A Workflow Matrix for this Fiscal Year, Office, and Document Type already exists."

---

### ❌ Scenario 5: Invalid Fiscal Year

**Test Case**: Use non-existent Fiscal Year ID

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "00000000-0000-0000-0000-000000000000",
  "officeId": "{valid-office-id}",
  "documentType": "WFP",
  "status": "Active",
  "recommendingApproverPositionId": "{valid-position-id-1}",
  "finalApproverPositionId": "{valid-position-id-2}"
}
```

**Expected Result**:
- ❌ Status Code: `404 Not Found`
- ❌ Error message: "Fiscal Year not found."

---

### ❌ Scenario 6: Invalid Office

**Test Case**: Use non-existent Office ID

**Expected Result**:
- ❌ Status Code: `404 Not Found`
- ❌ Error message: "Office not found."

---

### ❌ Scenario 7: Invalid Position

**Test Case**: Use non-existent Position ID for approvers

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "{valid-fiscal-year-id}",
  "officeId": "{valid-office-id}",
  "documentType": "WFP",
  "status": "Active",
  "recommendingApproverPositionId": "00000000-0000-0000-0000-000000000000",
  "finalApproverPositionId": "{valid-position-id}"
}
```

**Expected Result**:
- ❌ Status Code: `404 Not Found`
- ❌ Error message: "Recommending Approver Position not found."

---

### ❌ Scenario 8: Missing Required Fields

**Test Case**: Omit required fields

**Request**:
```json
POST /api/workflow-matrices
{
  "fiscalYearId": "{fiscal-year-id}",
  "officeId": "{office-id}"
  // Missing status and position IDs
}
```

**Expected Result**:
- ❌ Status Code: `400 Bad Request`
- ❌ Validation errors for missing fields

---

## Sample Test Data

### Create Sample Fiscal Year
```sql
INSERT INTO planning."FiscalYears" ("Id", "Year", "Status", "StartDate", "EndDate", "IsLocked", "CreatedAt", "CreatedBy", "IsDeleted")
VALUES 
  (gen_random_uuid(), 2026, 'Active', '2026-01-01', '2026-12-31', false, NOW(), 'test-user', false);
```

### Create Sample Office
```sql
INSERT INTO planning."Offices" ("Id", "Name", "Code", "Type", "CreatedAt", "CreatedBy", "IsDeleted")
VALUES 
  (gen_random_uuid(), 'Finance Department', 'FIN', 'Department', NOW(), 'test-user', false);
```

### Create Sample Positions
```sql
-- Budget Officer
INSERT INTO planning."Positions" ("Id", "Title", "Code", "OfficeId", "PlantillaTypeId", "SalaryGrade", "CreatedAt", "CreatedBy", "IsDeleted")
VALUES 
  (gen_random_uuid(), 'Budget Officer', 'BUDG-OFF', '{finance-office-id}', null, 15, NOW(), 'test-user', false);

-- Finance Director
INSERT INTO planning."Positions" ("Id", "Title", "Code", "OfficeId", "PlantillaTypeId", "SalaryGrade", "CreatedAt", "CreatedBy", "IsDeleted")
VALUES 
  (gen_random_uuid(), 'Finance Director', 'FIN-DIR', '{finance-office-id}', null, 24, NOW(), 'test-user', false);
```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `fiscalYearId` | Required, must exist | "Fiscal Year is required." / "Fiscal Year not found." |
| `officeId` | Required, must exist | "Office is required." / "Office not found." |
| `documentType` | Optional (nullable) | - |
| `recommendingApproverPositionId` | Required, must exist | "Recommending Approver Position is required." / "Recommending Approver Position not found." |
| `finalApproverPositionId` | Required, must exist | "Final Approver Position is required." / "Final Approver Position not found." |
| **Uniqueness** | FiscalYear + Office + DocumentType must be unique | "A Workflow Matrix for this Fiscal Year, Office, and Document Type already exists." |

---

## Testing with Postman/cURL

### Postman Collection Setup

1. **Base URL**: `http://localhost:5000/api` (or your dev server)
2. **Environment Variables**:
   - `baseUrl`: `http://localhost:5000/api`
   - `fiscalYearId`: `{your-fiscal-year-id}`
   - `officeId`: `{your-office-id}`
   - `positionId1`: `{budget-officer-position-id}`
   - `positionId2`: `{finance-director-position-id}`

### cURL Example

```bash
curl -X POST "http://localhost:5000/api/workflow-matrices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-token}" \
  -d '{
    "fiscalYearId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "officeId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "documentType": "WFP",
    "recommendingApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "finalApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa9"
  }'
```

---

## Verification Steps

### 1. Verify Created Workflow Matrix
```http
GET /api/workflow-matrices/{id}
```

**Expected Response**:
```json
{
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afb0",
    "fiscalYearId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fiscalYear": 2026,
    "officeId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "officeName": "Finance Department",
    "documentType": "WFP",
    
    "recommendingApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "recommendingApproverPositionTitle": "Budget Officer",
    "recommendingApproverId": "user-id-or-null",
    "recommendingApproverName": "John Doe or null",
    
    "finalApproverPositionId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
    "finalApproverPositionTitle": "Finance Director",
    "finalApproverId": "user-id-or-null",
    "finalApproverName": "Jane Smith or null",
    
    "createdAt": "2026-03-09T09:48:45.123Z",
    "createdBy": "test-user"
  },
  "succeeded": true,
  "errors": [],
  "message": null
}
```

### 2. Verify Database Record
```sql
SELECT wm."Id", 
       wm."FiscalYearId", fy."Year" as "FiscalYear",
       wm."OfficeId", o."Name" as "OfficeName",
       wm."DocumentType",
       wm."Status",
       wm."RecommendingApproverPositionId", rp."Title" as "RecommendingPositionTitle",
       wm."FinalApproverPositionId", fp."Title" as "FinalPositionTitle",
       wm."CreatedAt", wm."CreatedBy"
FROM planning."WorkflowMatrices" wm
JOIN planning."FiscalYears" fy ON wm."FiscalYearId" = fy."Id"
JOIN planning."Offices" o ON wm."OfficeId" = o."Id"
JOIN planning."Positions" rp ON wm."RecommendingApproverPositionId" = rp."Id"
JOIN planning."Positions" fp ON wm."FinalApproverPositionId" = fp."Id"
WHERE wm."IsDeleted" = false
ORDER BY wm."CreatedAt" DESC;
```

### 3. Verify User Resolution (if Personnel Positions exist)
```sql
SELECT wm."Id",
       -- Recommending Approver
       rp."Title" as "RecommendingPosition",
       rpp."UserId" as "RecommendingUserId",
       ru."FirstName" || ' ' || ru."LastName" as "RecommendingUserName",
       rpp."IsActive" as "RecommendingIsActive",
       
       -- Final Approver
       fp."Title" as "FinalPosition",
       fpp."UserId" as "FinalUserId",
       fu."FirstName" || ' ' || fu."LastName" as "FinalUserName",
       fpp."IsActive" as "FinalIsActive"
       
FROM planning."WorkflowMatrices" wm
JOIN planning."Positions" rp ON wm."RecommendingApproverPositionId" = rp."Id"
JOIN planning."Positions" fp ON wm."FinalApproverPositionId" = fp."Id"
LEFT JOIN planning."PersonnelPositions" rpp ON rp."Id" = rpp."PositionId" AND rpp."IsActive" = true
LEFT JOIN "Users" ru ON rpp."UserId" = ru."Id"
LEFT JOIN planning."PersonnelPositions" fpp ON fp."Id" = fpp."PositionId" AND fpp."IsActive" = true
LEFT JOIN "Users" fu ON fpp."UserId" = fu."Id"
WHERE wm."IsDeleted" = false;
```

---

## Troubleshooting

### Issue 1: "Workflow Matrix already exists"
**Cause**: Duplicate FiscalYear + Office + DocumentType combination

**Solution**:
1. Check existing workflows:
   ```sql
   SELECT * FROM planning."WorkflowMatrices" 
   WHERE "FiscalYearId" = '{your-fiscal-year-id}' 
     AND "OfficeId" = '{your-office-id}'
     AND "DocumentType" = 'WFP';
   ```
2. Either:
   - Use a different `documentType`
   - Use a different `officeId`
   - Use a different `fiscalYearId`
   - Delete the existing workflow if it's a test record

### Issue 2: "Position not found"
**Cause**: Invalid Position ID or Position was soft-deleted

**Solution**:
1. Verify Position exists:
   ```sql
   SELECT * FROM planning."Positions" 
   WHERE "Id" = '{position-id}' AND "IsDeleted" = false;
   ```
2. If not found, create position or use valid Position ID

### Issue 3: User resolution returns null
**Cause**: Position exists but has no active PersonnelPosition assigned

**Solution**:
1. Check PersonnelPosition:
   ```sql
   SELECT * FROM planning."PersonnelPositions" 
   WHERE "PositionId" = '{position-id}' AND "IsActive" = true;
   ```
2. If none found, assign a user to the position:
   ```sql
   INSERT INTO planning."PersonnelPositions" 
   ("Id", "PositionId", "UserId", "AssignmentType", "IsActive", "StartDate", "CreatedAt", "CreatedBy", "IsDeleted")
   VALUES 
   (gen_random_uuid(), '{position-id}', '{user-id}', 'Permanent', true, NOW(), NOW(), 'test-user', false);
   ```

### Issue 4: Cross-office approval concerns
**Cause**: Confusion about whether cross-office approvals are allowed

**Clarification**:
- ✅ **Allowed**: Final approver can be from different office (e.g., Head Office approving regional documents)
- ⚠️ **Warning logged**: If recommending approver is from different office (unusual but not blocked)

---

## Integration Test Example (xUnit + C#)

```csharp
[Fact]
public async Task CreateWorkflowMatrix_ValidData_ReturnsCreated()
{
    // Arrange
    var command = new CreateWorkflowMatrixCommand
    {
        FiscalYearId = _testFiscalYearId,
        OfficeId = _testOfficeId,
        DocumentType = "WFP",
        RecommendingApproverPositionId = _testPositionId1,
        FinalApproverPositionId = _testPositionId2
    };

    // Act
    var response = await _client.PostAsJsonAsync("/api/workflow-matrices", command);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.Created);
    var result = await response.Content.ReadFromJsonAsync<ApiResponse<Guid>>();
    result.Succeeded.Should().BeTrue();
    result.Data.Should().NotBeEmpty();
}
```

---

## Summary

**WorkflowMatrix Testing Checklist**:
- ✅ Valid fiscal year, office, and positions exist
- ✅ Create workflow with all required fields
- ✅ Verify unique constraint enforcement
- ✅ Test cross-office hierarchical approvals
- ✅ Test null documentType (applies to all)
- ✅ Test validation errors (missing fields, non-existent references)
- ✅ Verify user resolution via PersonnelPosition
- ✅ Test GET endpoint to retrieve created workflow

**Key Takeaways**:
1. Workflows are **position-based**, not user-based
2. System resolves users **at runtime** via PersonnelPosition
3. Cross-office approvals are **valid** (hierarchical workflows)
4. DocumentType **nullable** = applies to all document types
5. Unique constraint: **FiscalYear + Office + DocumentType**
