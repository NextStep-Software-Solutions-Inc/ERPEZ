# API Contract Changes - KPI Rating to Rating Refactoring

## Overview

The KPIRating domain entity has been refactored to be named `Rating`, and the API naming conventions have been updated to align with the entity name. A join entity `KPIPerformanceMeasure` was introduced to explicitly manage the relationship between KPI and PerformanceMeasure, with Rating now holding an explicit FK to this join.

## Database Schema Changes

### Table Renames

- `KPIRatings` → `Ratings` (EF Core auto-naming from DbSet)
- New table: `KPIPerformanceMeasures` (explicit join entity)

### Column Changes in `Ratings` Table

**Removed (replaced with explicit FK to join):**

- `KPIId` (was explicit FK)
- `PerformanceMeasureId` (was explicit FK)

**Added:**

- `KPIPerformanceMeasureId` (new explicit FK to `KPIPerformanceMeasures`)

### New Table: `KPIPerformanceMeasures`

- `Id` (Guid, PK)
- `KPIId` (Guid, FK to KPI)
- `PerformanceMeasureId` (Guid, FK to PerformanceMeasure)
- Unique index: `(KPIId, PerformanceMeasureId)`

### Unique Constraints

- Old: `Ratings(KPIId, PerformanceMeasureId, NumericalRating)` (composite)
- New: `Ratings(KPIPerformanceMeasureId, NumericalRating)` (simpler, via join)

---

## API Endpoint Changes

### Endpoint Base Route

- Old: `POST/GET/PUT/DELETE /kpiratings`
- New: `POST/GET/PUT/DELETE /ratings`

| Operation | Old Endpoint | New Endpoint |
|-----------|--------------|--------------|
| Create | `POST /kpiratings` | `POST /ratings` |
| List | `GET /kpiratings?...` | `GET /ratings?...` |
| Get by ID | `GET /kpiratings/{id}` | `GET /ratings/{id}` |
| Update | `PUT /kpiratings/{id}` | `PUT /ratings/{id}` |
| Delete | `DELETE /kpiratings/{id}` | `DELETE /ratings/{id}` |

---

## Request/Response DTO Changes

### DTO Class Rename

- Old: `KPIRatingResponse`
- New: `RatingResponse`

### DTO Shape (UNCHANGED)

Both old and new DTOs maintain the same field structure for API contract stability:

```csharp
public class RatingResponse
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }                  // Still exposed for clients
    public Guid PerformanceMeasureId { get; set; }   // Still exposed for clients
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
}
```

**Note:** Although the internal schema uses a join entity, handlers project `KPIId` and `PerformanceMeasureId` from the `KPIPerformanceMeasure` navigation, so the external API contract is identical.

---

## Command/Query Class Renames

### Commands

| Old | New |
|-----|-----|
| `CreateKPIRatingCommand` | `CreateRatingCommand` |
| `UpdateKPIRatingCommand` | `UpdateRatingCommand` |
| `DeleteKPIRatingCommand` | `DeleteRatingCommand` |

### Queries

| Old | New |
|-----|-----|
| `GetKPIRatingsQuery` | `GetRatingsQuery` |
| `GetKPIRatingByIdQuery` | `GetRatingByIdQuery` |

### Namespace Updates

All feature folders renamed:

- `ERPEZ.Application.Features.Planning.KPIRating.*` → `ERPEZ.Application.Features.Planning.Rating.*`

---

## Repository Interface Changes

- Old: `IKPIRatingRepository : IRepository<Rating>`
- New: `IRatingRepository : IRepository<Rating>`

### New Repository Method

Added to support join entity:

```csharp
Task<Rating?> GetByIdWithJoinAsync(Guid id, CancellationToken cancellationToken = default);
```

---

## Domain Model Changes

### New Entity: `KPIPerformanceMeasure`

```csharp
public class KPIPerformanceMeasure : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }

    public virtual KPI? KPI { get; set; }
    public virtual PerformanceMeasure? PerformanceMeasure { get; set; }
    public virtual List<Rating> Ratings { get; set; } = [];
}
```

### Entity: `Rating` (Renamed, Link Structure Updated)

**Before:**

```csharp
public class KPIRating : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}
```

**After:**

```csharp
public class Rating : BaseEntity
{
    public Guid KPIPerformanceMeasureId { get; set; }  // Explicit FK to join
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }

    public virtual KPIPerformanceMeasure? KPIPerformanceMeasure { get; set; }
}
```

---

## Navigation Property Changes

### KPI Entity

- Old: `public virtual List<Rating> KPIRatings { get; set; }`
- New: `public virtual List<KPIPerformanceMeasure> KPIPerformanceMeasures { get; set; }`
- Access: `kpi.KPIPerformanceMeasures.SelectMany(kpm => kpm.Ratings)`

### PerformanceMeasure Entity

- Old: `public virtual List<Rating> KPIRatings { get; set; }`
- New: `public virtual List<KPIPerformanceMeasure> KPIPerformanceMeasures { get; set; }`

---

## Backward Compatibility

### Client Applications

1. **Endpoint URLs:** Update from `/kpiratings` to `/ratings`
2. **DTO imports:** Update references from `KPIRatingResponse` to `RatingResponse`
3. **Request/Response shape:** No changes—identical structure preserved

### API Response Format

All response payloads remain identical in shape and content:

- `KPIId` and `PerformanceMeasureId` are still included in `RatingResponse`
- Pagination and error responses unchanged

---

## Migration Path

### For Development Environments

1. Generate EF migration: `dotnet ef migrations add RefactorRatingJoin --project ERPEZ.Infrastructure --startup-project ERPEZ.Api`
2. Migrations will:
   - Create `KPIPerformanceMeasures` table
   - Add `KPIPerformanceMeasureId` column to `Ratings`
   - Backfill `KPIPerformanceMeasures` from distinct (KPIId, PerformanceMeasureId) pairs
   - Populate `Ratings.KPIPerformanceMeasureId` with matching join row IDs
   - Update indexes and constraints
3. Apply: `dotnet ef database update`

### For Production Environments

- Recommend a staged approach: deploy code first, then run migrations during maintenance window
- Ensure backups before running destructive migrations
- Validate data integrity post-migration

---

## Summary

This refactoring **does not break the API contract** for consumers. All endpoints, request/response DTOs, and field names remain consistent. The internal data model has been reorganized to use an explicit join entity for cleaner separation of concerns and improved database normalization.

---

## Response Format Standardization (Dec 2025)

To enforce consistent API responses across the platform, endpoints now follow these rules:

- POST: returns `ApiResponse<Guid>` and 201 Created (Location header via `CreatedAtAction`).
- GET by id: returns `ApiResponse<...DetailedResponse>` and 200 OK; 404 NotFound on missing.
- PUT: returns `ApiResponse<Unit>` and 200 OK; 400/404 on error.
- DELETE: returns 204 No Content with no response body; 404 on missing.

### Affected Endpoints (implemented)

- Ratings
  - POST `/ratings`: `ApiResponse<Guid>`
  - GET `/ratings/{id}`: `ApiResponse<RatingDetailedResponse>`
  - PUT `/ratings/{id}`: `ApiResponse<Unit>`
  - DELETE `/ratings/{id}`: 204 No Content

- KPI
  - PUT `/kpis/{id}`: `ApiResponse<Unit>`

- Clusters
  - POST `/clusters`: `ApiResponse<Guid>`
  - GET `/clusters/{id}`: `ApiResponse<ClusterDetailedResponse>` (new DTO)
  - PUT `/clusters/{id}`: `ApiResponse<Unit>`
  - DELETE `/clusters/{id}`: 204 No Content

- Tenant Management (Tenants, Modules)
  - POST now returns `ApiResponse<Guid>`
  - PUT now returns `ApiResponse<Unit>`
  - DELETE returns 204 No Content

### Controller Behavior Changes

- Controllers now pass handler results directly (no double-wrapping). Examples:
  - `return BadRequest(result);` instead of `ApiResponse<T>.Fail(...)` wrappers.
  - `return CreatedAtAction(..., result);` with `result.Data` being the Guid for POSTs.

### DTO Additions

- Added `ClusterDetailedResponse` under `ERPEZ.Application.Features.Planning.Cluster.Dtos`.
- Existing `RatingDetailedResponse` is used for GET-by-id in Ratings.

### Command Signatures

- Update commands return `IRequest<ApiResponse<Unit>>` (e.g., `UpdateKPICommand`).
- Create commands return `IRequest<ApiResponse<Guid>>` (e.g., `CreateRatingCommand`).
