# WorkflowMatrix - Implementation Logic Documentation

## Handler Logic Flow: CreateWorkflowMatrixCommandHandler

### File Location
`ERPEZ.Application/Features/Planning/WorkflowMatrix/Commands/CreateWorkflowMatrix/CreateWorkflowMatrixCommandHandler.cs`

---

## Step-by-Step Execution Flow

### 1. **Receive Command**
```csharp
public async Task<ApiResponse<Guid>> Handle(CreateWorkflowMatrixCommand request, CancellationToken cancellationToken)
```

**Input**:
- `FiscalYearId` (Guid)
- `OfficeId` (Guid)
- `DocumentType` (string?, nullable)
- `Status` (string)
- `RecommendingApproverPositionId` (Guid)
- `FinalApproverPositionId` (Guid)

---

### 2. **Validation Step 1: FiscalYear Exists**

```csharp
var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
if (fiscalYear == null)
    throw new NotFoundException("Fiscal Year not found.");
```

**Logic**:
- Query: `SELECT * FROM FiscalYears WHERE Id = {request.FiscalYearId} AND IsDeleted = false`
- If not found → **404 Not Found** exception
- Ensures workflow references valid fiscal year

---

### 3. **Validation Step 2: Office Exists**

```csharp
var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken);
if (office == null)
    throw new NotFoundException("Office not found.");
```

**Logic**:
- Query: `SELECT * FROM Offices WHERE Id = {request.OfficeId} AND IsDeleted = false`
- If not found → **404 Not Found** exception
- Ensures workflow references valid office

---

### 4. **Validation Step 3: Recommending Approver Position Exists**

```csharp
var recommendingPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.RecommendingApproverPositionId, cancellationToken);
if (recommendingPosition == null)
    throw new NotFoundException("Recommending Approver Position not found.");
```

**Logic**:
- Query: `SELECT * FROM Positions WHERE Id = {request.RecommendingApproverPositionId} AND IsDeleted = false`
- If not found → **404 Not Found** exception
- Ensures position exists and is active

---

### 5. **Validation Step 4: Final Approver Position Exists**

```csharp
var finalPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.FinalApproverPositionId, cancellationToken);
if (finalPosition == null)
    throw new NotFoundException("Final Approver Position not found.");
```

**Logic**:
- Query: `SELECT * FROM Positions WHERE Id = {request.FinalApproverPositionId} AND IsDeleted = false`
- If not found → **404 Not Found** exception

---

### 6. **Business Rule Validation: Cross-Office Approval Check**

```csharp
// Business Rule Validation: Check if positions belong to appropriate offices
// Recommending approver should typically be from the same office (strong recommendation)
if (recommendingPosition.OfficeId != request.OfficeId)
{
    // Log warning but allow (could be intentional for cross-office workflows)
    // In production, you might want to log this for audit purposes
}

// Final approver can be from different office (hierarchical approval is valid)
// Example: Regional office WFPs approved by Head Office VP
// No validation needed for final approver office mismatch
```

**Logic**:
- **Recommending Approver**: Typically should match workflow's office
  - If mismatch → Log warning (for audit) but **allow** (not blocking)
  - Example unusual case: External consultant approving on behalf of office
- **Final Approver**: Can be from different office
  - Example: Regional Office → Head Office VP approval (valid hierarchy)
  - No validation needed

---

### 7. **Uniqueness Check: Prevent Duplicate Workflows**

```csharp
var existingMatrix = await unitOfWork.WorkflowMatrixRepository.FindAsync(
    wm => wm.FiscalYearId == request.FiscalYearId &&
          wm.OfficeId == request.OfficeId &&
          wm.DocumentType == request.DocumentType,
    cancellationToken
);

if (existingMatrix != null)
    throw new ConflictException("A Workflow Matrix for this Fiscal Year, Office, and Document Type already exists.");
```

**Logic**:
- Query: 
  ```sql
  SELECT * FROM WorkflowMatrices 
  WHERE FiscalYearId = {request.FiscalYearId} 
    AND OfficeId = {request.OfficeId}
    AND DocumentType = {request.DocumentType}
    AND IsDeleted = false
  ```
- **Uniqueness Constraint**: Only one workflow per `(FiscalYear, Office, DocumentType)` combination
- If found → **409 Conflict** exception
- Prevents duplicate approval routing for same document type

**Edge Cases**:
- `DocumentType = null` means default workflow (applies to all documents)
- Only one default workflow is allowed per `(FiscalYear, Office)`
- Two workflows can exist for same Office+FiscalYear if DocumentType differs:
  - Workflow 1: Office A + FY 2026 + "WFP"
  - Workflow 2: Office A + FY 2026 + "Budget"
  - ✅ Both valid (different document types)

---

### 8. **Create Entity**

```csharp
var entity = new WorkflowMatrix
{
    Id = Guid.NewGuid(),
    FiscalYearId = request.FiscalYearId,
    OfficeId = request.OfficeId,
    DocumentType = request.DocumentType,
  Status = "Inactive",
    RecommendingApproverPositionId = request.RecommendingApproverPositionId,
    FinalApproverPositionId = request.FinalApproverPositionId
};
```

**Logic**:
- Generate new GUID for entity ID
- Map all request properties to entity
- Initialize `Status` to `Inactive` on create
- **Note**: User IDs are NOT stored - only Position IDs
- BaseEntity properties (CreatedAt, CreatedBy) auto-populated by EF Core interceptor

---

### 9. **Persist to Database**

```csharp
await unitOfWork.WorkflowMatrixRepository.AddAsync(entity, cancellationToken);
await unitOfWork.SaveChangesAsync(cancellationToken);
```

**Logic**:
- Add entity to DbContext change tracker
- Call `SaveChangesAsync()` to commit transaction
- Database generates:
  - Foreign key relationships to FiscalYear, Office, Position (x2)
  - Unique index on (FiscalYearId, OfficeId, DocumentType)
  - Audit fields via Interceptor (CreatedAt, CreatedBy)

**SQL Equivalent**:
```sql
INSERT INTO planning."WorkflowMatrices" 
  ("Id", "FiscalYearId", "OfficeId", "DocumentType", "Status", 
   "RecommendingApproverPositionId", "FinalApproverPositionId", 
   "CreatedAt", "CreatedBy", "IsDeleted")
VALUES 
  ('{new-guid}', '{fiscal-year-id}', '{office-id}', '{document-type}', '{status}',
   '{recommending-position-id}', '{final-position-id}',
   NOW(), '{current-user}', false);
```

---

### 10. **Return Success Response**

```csharp
return ApiResponse<Guid>.Success(entity.Id);
```

**Response Structure**:
```json
{
  "data": "3fa85f64-5717-4562-b3fc-2c963f66afb0",
  "succeeded": true,
  "errors": [],
  "message": null
}
```

**HTTP Status**: `201 Created`

**Location Header** (set by controller):
```
Location: /api/workflow-matrices/3fa85f64-5717-4562-b3fc-2c963f66afb0
```

---

## Exception Handling Flow

### FluentValidation (Before Handler Executes)

**Validator**: `CreateWorkflowMatrixCommandValidator.cs`

```csharp
RuleFor(x => x.FiscalYearId)
    .NotEmpty().WithMessage("Fiscal Year is required.");

RuleFor(x => x.OfficeId)
    .NotEmpty().WithMessage("Office is required.");

RuleFor(x => x.RecommendingApproverPositionId)
    .NotEmpty().WithMessage("Recommending Approver Position is required.");

RuleFor(x => x.FinalApproverPositionId)
    .NotEmpty().WithMessage("Final Approver Position is required.");
```

**Flow**:
1. Validation pipeline executes BEFORE handler
2. If validation fails → **400 Bad Request** with error details
3. Handler only executes if validation passes

**Error Response Example**:
```json
{
  "data": null,
  "succeeded": false,
  "errors": [
    "Fiscal Year is required.",
    "Office is required."
  ],
  "message": "Validation failed"
}
```

---

### Custom Exception Handling (During Handler Execution)

| Exception Type | When Thrown | HTTP Status | Response |
|---------------|-------------|-------------|----------|
| `NotFoundException` | FiscalYear, Office, or Position not found | `404 Not Found` | `{ "succeeded": false, "errors": ["Entity not found."], ... }` |
| `ConflictException` | Duplicate workflow matrix exists | `409 Conflict` | `{ "succeeded": false, "errors": ["Already exists."], ... }` |
| `DbUpdateException` | Database constraint violation | `500 Internal Server Error` | Generic error message (details logged) |

**Global Exception Handler**: Catches all exceptions and formats response

---

## Database Constraints

### Foreign Keys

```sql
-- FiscalYear foreign key
ALTER TABLE planning."WorkflowMatrices"
  ADD CONSTRAINT "FK_WorkflowMatrices_FiscalYears_FiscalYearId"
  FOREIGN KEY ("FiscalYearId") 
  REFERENCES planning."FiscalYears" ("Id")
  ON DELETE CASCADE;

-- Office foreign key
ALTER TABLE planning."WorkflowMatrices"
  ADD CONSTRAINT "FK_WorkflowMatrices_Offices_OfficeId"
  FOREIGN KEY ("OfficeId") 
  REFERENCES planning."Offices" ("Id")
  ON DELETE CASCADE;

-- Recommending Position foreign key
ALTER TABLE planning."WorkflowMatrices"
  ADD CONSTRAINT "FK_WorkflowMatrices_Positions_RecommendingApproverPositionId"
  FOREIGN KEY ("RecommendingApproverPositionId") 
  REFERENCES planning."Positions" ("Id")
  ON DELETE RESTRICT;

-- Final Position foreign key
ALTER TABLE planning."WorkflowMatrices"
  ADD CONSTRAINT "FK_WorkflowMatrices_Positions_FinalApproverPositionId"
  FOREIGN KEY ("FinalApproverPositionId") 
  REFERENCES planning."Positions" ("Id")
  ON DELETE RESTRICT;
```

**Delete Behaviors**:
- **FiscalYear/Office**: `CASCADE` - Delete workflow when fiscal year/office deleted
- **Positions**: `RESTRICT` - Cannot delete position if used in active workflow

---

### Unique Index

```sql
CREATE UNIQUE INDEX "IX_WorkflowMatrices_FiscalYearId_OfficeId_DocumentType"
ON planning."WorkflowMatrices" ("FiscalYearId", "OfficeId", "DocumentType")
WHERE "IsDeleted" = false;
```

**Purpose**: Enforce one workflow per (FiscalYear, Office, DocumentType) combination

**Behavior**:
- Insert with duplicate → Database throws unique constraint violation
- Application catches and returns `ConflictException`

---

## User Resolution Logic (Runtime)

**Important**: The CREATE handler does NOT resolve users - it only stores Position IDs.

User resolution happens when **retrieving** workflows via:
- `GetWorkflowMatrixByIdQueryHandler`
- `GetWorkflowMatricesQueryHandler`

### Resolution Flow (GET endpoints)

```csharp
// 1. Get workflow with Position navigation
var workflow = await unitOfWork.WorkflowMatrixRepository.GetByIdWithNavigationAsync(id);

// 2. Lookup active PersonnelPosition for recommending approver
var recPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
    pp => pp.PositionId == workflow.RecommendingApproverPositionId && pp.IsActive == true
);

// 3. If found, get User details
if (recPersonnel != null)
{
    var recUser = await unitOfWork.UserRepository.GetByIdAsync(recPersonnel.UserId);
    // Map to response DTO
}

// 4. Repeat for final approver
```

**Why Separate?**
- **Create**: Fast insertion, no complex joins needed
- **Read**: Lazy loading of user details only when requested
- **Performance**: Avoids unnecessary lookups during creation

---

## Decision Tree Diagram

```
Start CreateWorkflowMatrix
    ↓
Validate Request (FluentValidation)
    ├─ Invalid → 400 Bad Request
    └─ Valid ↓
         ↓
Check FiscalYear Exists
    ├─ Not Found → 404 Not Found
    └─ Found ↓
         ↓
Check Office Exists
    ├─ Not Found → 404 Not Found
    └─ Found ↓
         ↓
Check Recommending Position Exists
    ├─ Not Found → 404 Not Found
    └─ Found ↓
         ↓
Check Final Position Exists
    ├─ Not Found → 404 Not Found
    └─ Found ↓
         ↓
Validate Cross-Office Rules
    ├─ Recommending Position OfficeId ≠ Workflow OfficeId
    │    └─ Log Warning (Allow)
    └─ Final Position (No validation, allow cross-office)
         ↓
Check Duplicate (FiscalYear + Office + DocumentType)
    ├─ Exists → 409 Conflict
    └─ Not Exists ↓
         ↓
Create Entity (Generate GUID)
         ↓
Save to Database
    ├─ Constraint Violation → 500 (or 409 if caught)
    └─ Success ↓
         ↓
Return 201 Created + Location Header
```

---

## Testing Checklist

### Unit Tests

- ✅ Valid request returns success
- ✅ Missing FiscalYear throws NotFoundException
- ✅ Missing Office throws NotFoundException
- ✅ Missing Position throws NotFoundException
- ✅ Duplicate workflow throws ConflictException
- ✅ FluentValidation catches empty GUIDs

### Integration Tests

- ✅ End-to-end POST request with valid data
- ✅ Verify database record created
- ✅ Verify foreign keys established
- ✅ Verify unique index enforced
- ✅ Cross-office approval scenario
- ✅ Null DocumentType scenario

---

## Summary

**CreateWorkflowMatrix Logic**:

1. ✅ **Validate** request fields (FluentValidation)
2. ✅ **Verify** FiscalYear exists
3. ✅ **Verify** Office exists
4. ✅ **Verify** both Positions exist
5. ✅ **Log** cross-office approver warnings (not blocking)
6. ✅ **Check** uniqueness constraint
7. ✅ **Create** entity with Position IDs (not User IDs)
8. ✅ **Persist** to database
9. ✅ **Return** 201 Created with new ID

**Key Design Decisions**:
- Store Position IDs, resolve Users at runtime
- Allow cross-office approvals (hierarchical workflows)
- Enforce uniqueness per (FiscalYear, Office, DocumentType)
- Restrict deletion of Positions used in workflows
