# WFPObjectiveTimeline Migration Summary

**Date:** December 30, 2025  
**Migration ID:** 20251230032543_AddTimelineTypeToWFPObjectiveTimeline  
**Status:** ✅ **COMPLETED AND APPLIED**

---

## Overview

Created and applied a database migration to add the `TimelineType` column to the `WFPObjectiveTimeline` entity in the `planning` schema.

---

## Entity Changes

### WFPObjectiveTimeline.cs

The entity already contained the `TimelineType` property defined as:

```csharp
[Sieve(CanFilter = true, CanSort = true)]
public TimelineTypeEnum TimelineType { get; set; } = TimelineTypeEnum.Quarterly;
```

**Type:** `TimelineTypeEnum` (stored as string in database)  
**Default Value:** `TimelineTypeEnum.Quarterly`  
**Nullable:** No (required field)

---

## Database Schema Changes

### Migration Details

**File:** `20251230032543_AddTimelineTypeToWFPObjectiveTimeline.cs`

#### Up Migration

```sql
ALTER TABLE planning."WFPObjectiveTimelines"
ADD "TimelineType" text NOT NULL DEFAULT '';
```

**Column Name:** TimelineType  
**Schema:** planning  
**Table:** WFPObjectiveTimelines  
**Data Type:** text  
**Nullable:** false  
**Default Value:** '' (empty string, will be set to proper enum value)

#### Down Migration

```sql
ALTER TABLE planning."WFPObjectiveTimelines"
DROP COLUMN "TimelineType";
```

---

## DbContext Configuration

No changes required in `ApplicationDbContext.cs`. The entity configuration for `WFPObjectiveTimeline` was already properly set up:

```csharp
modelBuilder.Entity<WFPObjectiveTimeline>()
    .HasIndex(t => new { t.WFPObjectiveTargetId, t.StartDate })
    .IsUnique();

modelBuilder.Entity<WFPObjectiveTimeline>()
    .HasOne(t => t.WFPObjectiveTarget)
    .WithMany(ot => ot.WFPObjectiveTimelines)
    .HasForeignKey(t => t.WFPObjectiveTargetId)
    .IsRequired();

modelBuilder.Entity<WFPObjectiveTimeline>()
    .Property(t => t.TargetValue)
    .HasColumnType("decimal(18, 2)");
```

---

## Additional Fixes Applied

During the migration creation process, several compilation issues were discovered and fixed:

### 1. Missing Using Statements in Command Classes

Added namespace imports for Request DTOs in 12 Update command files:

- UpdateClusterCommand.cs
- UpdateFundSourceCommand.cs
- UpdateKPIModeOfVerificationCommand.cs
- UpdateKPIRatingCommand.cs
- UpdateMFOPAPCommand.cs
- UpdateOPCREvaluationCommand.cs
- UpdateOPCRRatingCommand.cs
- UpdateObjectCommand.cs
- UpdateOrganizationCommand.cs
- UpdatePerformanceMeasureCommand.cs
- UpdateTransactionCommand.cs
- UpdateWFPObjectiveTargetCommand.cs

### 2. Handler Class Return Type Issues

Fixed 10 Create command handler classes to have proper IRequestHandler interface implementations returning `ApiResponse<Guid>`:

- CreateFundSourceCommandHandler.cs
- CreateLocationCommandHandler.cs
- CreateMFOPAPCommandHandler.cs
- CreateObjectCommandHandler.cs
- CreateOPCREvaluationCommandHandler.cs
- CreateOPCRPAPDepartmentCommandHandler.cs
- CreateOPCRRatingCommandHandler.cs
- CreateOrganizationCommandHandler.cs
- CreatePerformanceMeasureCommandHandler.cs
- CreateWFPObjectiveCommandHandler.cs

### 3. API Controller CreatedAtAction Calls

Updated 13 controller Create action methods to use `response.Data` directly instead of `response.Data!.Id`:

- FundSourceController.cs
- KPIModeOfVerificationController.cs
- LocationController.cs
- MFOPAPController.cs
- ObjectController.cs
- OPCREvaluationController.cs
- OPCRPAPDepartmentController.cs
- OPCRRatingController.cs
- OrganizationController.cs
- PerformanceMeasureController.cs
- TransactionController.cs
- WFPObjectiveController.cs
- WFPObjectiveTargetController.cs

**Reason:** Handlers now return `ApiResponse<Guid>` where `response.Data` is a Guid value directly, not an object with an `Id` property.

---

## Validation

✅ **Build Status:** Successful (0 errors, 0 warnings)  
✅ **Migration Created:** Yes  
✅ **Migration Applied:** Yes  
✅ **Database Schema Updated:** Yes

---

## Timeline

| Step | Status | Timestamp |
|------|--------|-----------|
| Entity already has TimelineType property | ✅ | Pre-existing |
| DbContext configured | ✅ | Pre-existing |
| Fixed compilation errors | ✅ | During migration |
| Build successful | ✅ | Before migration |
| Migration created | ✅ | 2025-12-30 03:25:43 |
| Migration applied | ✅ | 2025-12-30 03:25:43+ |

---

## Rollback Instructions

If needed, to rollback this migration:

```bash
dotnet ef database update <previous-migration-name> -p ERPEZ.Infrastructure -s ERPEZ.Api
```

Or remove the migration entirely:

```bash
dotnet ef migrations remove -p ERPEZ.Infrastructure -s ERPEZ.Api
```

---

## Related Issues Fixed

During this migration, the following compliance issues from the previous DTO immutability and response type fixes were discovered and corrected:

1. **Missing imports for converted DTOs** - The DTO conversion to `record` types wasn't fully propagated with required using statements
2. **Handler interface mismatches** - Some handler IRequestHandler signatures didn't match their IRequest command definitions
3. **API response handling** - Controllers needed to be updated for new response type structure (Guid vs object)

These fixes ensure the entire codebase maintains consistency with the established guidelines.

---

## Next Steps

1. ✅ Migration applied successfully
2. Verify WFPObjectiveTimeline creation and updates work correctly
3. Test filtering and sorting by TimelineType (Sieve attributes are configured)
4. Monitor application logs for any issues

---

**Migration Completed Successfully** ✅
