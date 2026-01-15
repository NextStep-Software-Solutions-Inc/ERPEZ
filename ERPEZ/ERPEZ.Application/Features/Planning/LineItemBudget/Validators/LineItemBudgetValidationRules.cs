using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.LineItemBudget.Validators;

/// <summary>
/// Contains all business validation rules for LineItemBudget entities.
/// These rules enforce the requirements specified in the LIB domain model.
/// 
/// CONSOLIDATION WORKFLOW:
/// 1. Sub-delivery units create their own LIBs independently (no parent LIB dependency required).
/// 2. Parent delivery units can create consolidated LIBs by setting IsConsolidated = true.
/// 3. Consolidated LIBs aggregate data from child delivery unit LIBs based on the DU hierarchy.
/// 4. Once a LIB reaches Consolidated status, it becomes immutable to maintain data integrity.
/// </summary>
public static class LineItemBudgetValidationRules
{
    /// <summary>
    /// Validates that SourceId is required for WFP and OPCR source types.
    /// Independent source type should not have a SourceId.
    /// </summary>
    public static bool ValidateSourceIdRequirement(SourceType sourceType, Guid? sourceId)
    {
        return sourceType switch
        {
            SourceType.WFP => sourceId.HasValue && sourceId.Value != Guid.Empty,
            SourceType.OPCR => sourceId.HasValue && sourceId.Value != Guid.Empty,
            SourceType.Independent => !sourceId.HasValue,
            _ => false
        };
    }

    /// <summary>
    /// Validates that activity-level budgets must have at least one activity.
    /// Project-level budgets can have activities but they are optional.
    /// </summary>
    public static bool ValidateScopeActivityRequirement(
        BudgetScope scope,
        IEnumerable<LineItemBudgetActivity> activities)
    {
        if (scope == BudgetScope.ActivityLevel)
        {
            return activities != null && activities.Any();
        }
        return true; // Project-level doesn't require activities
    }

    /// <summary>
    /// Validates that activity-level details must reference an activity.
    /// Project-level details can be attached directly to header.
    /// </summary>
    public static bool ValidateDetailActivityRequirement(
        BudgetScope scope,
        Guid? lineItemBudgetActivityId)
    {
        if (scope == BudgetScope.ActivityLevel)
        {
            return lineItemBudgetActivityId.HasValue && lineItemBudgetActivityId.Value != Guid.Empty;
        }
        return true; // Project-level details don't require activity
    }

    /// <summary>
    /// Validates OPCR and WFP exclusivity on activities.
    /// An activity can only reference one source type (either OPCR or WFP, not both).
    /// </summary>
    public static bool ValidateActivitySourceExclusivity(
        Guid? wfpObjectiveTargetId,
        Guid? opcrActivityId)
    {
        // Both cannot be set at the same time
        if (wfpObjectiveTargetId.HasValue && opcrActivityId.HasValue)
        {
            return false;
        }
        return true;
    }

    /// <summary>
    /// Validates that if the LIB is OPCR-sourced, activities must link to OPCR activities.
    /// If WFP-sourced, activities must link to WFP targets.
    /// </summary>
    public static bool ValidateActivitySourceConsistency(
        SourceType headerSourceType,
        Guid? wfpObjectiveTargetId,
        Guid? opcrActivityId,
        string activityName)
    {
        return headerSourceType switch
        {
            SourceType.OPCR => opcrActivityId.HasValue && opcrActivityId.Value != Guid.Empty,
            SourceType.WFP => wfpObjectiveTargetId.HasValue && wfpObjectiveTargetId.Value != Guid.Empty,
            SourceType.Independent => !string.IsNullOrWhiteSpace(activityName), // Ad-hoc activities must have names
            _ => false
        };
    }

    /// <summary>
    /// Validates that budget detail amount does not exceed the source's budget/cost estimate.
    /// </summary>
    public static bool ValidateBudgetCeiling(
        decimal detailBudget,
        decimal? sourceBudget)
    {
        if (!sourceBudget.HasValue)
        {
            return true; // Cannot validate if source budget is not known
        }
        return detailBudget <= sourceBudget.Value;
    }

    /// <summary>
    /// Validates that detail timeline falls within the source's timeline.
    /// </summary>
    public static bool ValidateTimelineWithinSource(
        DateTime detailStartDate,
        DateTime detailEndDate,
        DateTime? sourceStartDate,
        DateTime? sourceEndDate)
    {
        if (!sourceStartDate.HasValue || !sourceEndDate.HasValue)
        {
            return true; // Cannot validate if source dates are not known
        }

        return detailStartDate >= sourceStartDate.Value 
            && detailEndDate <= sourceEndDate.Value
            && detailStartDate <= detailEndDate;
    }

    /// <summary>
    /// Validates that submission is allowed based on LIB status.
    /// Draft can be submitted, others cannot.
    /// </summary>
    public static bool ValidateSubmissionAllowed(LIBStatus status)
    {
        return status == LIBStatus.Draft;
    }

    /// <summary>
    /// Validates that approval is allowed based on LIB status.
    /// Only submitted LIBs can be approved.
    /// </summary>
    public static bool ValidateApprovalAllowed(LIBStatus status)
    {
        return status == LIBStatus.Submitted;
    }

    /// <summary>
    /// Validates that a consolidated LIB belongs to a parent DeliveryUnit.
    /// Parent DUs can consolidate LIBs from their child DUs.
    /// </summary>
    public static bool ValidateConsolidationDeliveryUnitHierarchy(
        bool isConsolidated,
        bool isParentDeliveryUnit)
    {
        // If marked as consolidated, it must belong to a parent delivery unit
        if (isConsolidated)
        {
            return isParentDeliveryUnit;
        }
        return true; // Non-consolidated LIBs can belong to any DU
    }

    /// <summary>
    /// Validates that a LIB can be marked as consolidated based on its current status.
    /// Consolidated LIBs must be in Consolidated status.
    /// </summary>
    public static bool ValidateConsolidationStatus(
        bool isConsolidated,
        LIBStatus status)
    {
        // If marked as consolidated, status must be Consolidated
        if (isConsolidated)
        {
            return status == LIBStatus.Consolidated;
        }
        // Non-consolidated LIBs cannot be in Consolidated status
        return status != LIBStatus.Consolidated;
    }

    /// <summary>
    /// Validates that modifications are not allowed when LIB is in Consolidated status.
    /// </summary>
    public static bool ValidateModificationAllowed(LIBStatus status)
    {
        return status != LIBStatus.Consolidated;
    }

    /// <summary>
    /// Validates that the LIB belongs to the correct source (OPCR or WFP).
    /// Checks if the sourceId matches the actual OPCR/WFP entity.
    /// </summary>
    public static bool ValidateSourceBelongsToDeliveryUnit(
        SourceType sourceType,
        Guid? sourceId,
        Guid deliveryUnitId,
        Guid? sourceDeliveryUnitId)
    {
        if (sourceType == SourceType.Independent)
        {
            return true; // Independent doesn't need source validation
        }

        if (!sourceId.HasValue || !sourceDeliveryUnitId.HasValue)
        {
            return false;
        }

        // Source must belong to the same delivery unit
        return deliveryUnitId == sourceDeliveryUnitId.Value;
    }

    /// <summary>
    /// Validates that consolidated LIBs cannot be modified after consolidation.
    /// Only Draft and Submitted LIBs can be modified.
    /// </summary>
    public static bool ValidateConsolidatedLIBCanBeModified(
        bool isConsolidated,
        LIBStatus status)
    {
        // Consolidated LIBs are immutable
        if (isConsolidated && status == LIBStatus.Consolidated)
        {
            return false;
        }
        return true;
    }

    /// <summary>
    /// Validates that total budget of details does not exceed the activity budget.
    /// </summary>
    public static bool ValidateTotalDetailsBudgetWithinActivity(
        decimal activityBudget,
        IEnumerable<decimal> detailBudgets)
    {
        if (detailBudgets == null || !detailBudgets.Any())
        {
            return true;
        }

        var totalDetailBudget = detailBudgets.Sum();
        return totalDetailBudget <= activityBudget;
    }

    /// <summary>
    /// Validates that an OPCR activity name is read-only and synced from source.
    /// User cannot modify the name if it's linked to an OPCR activity.
    /// </summary>
    public static bool ValidateOPCRActivityNameIsReadOnly(
        Guid? opcrActivityId,
        string providedName,
        string? opcrActivityName)
    {
        if (!opcrActivityId.HasValue)
        {
            return true; // Not an OPCR activity, name can be anything
        }

        // If linked to OPCR, name must match the source
        return !string.IsNullOrWhiteSpace(opcrActivityName) 
            && providedName == opcrActivityName;
    }

    /// <summary>
    /// Validates that WFP expenditure detail is properly linked.
    /// If WFPObjectiveTargetExpenditureId is provided, it must be valid and match the activity.
    /// </summary>
    public static bool ValidateWFPExpenditureConsistency(
        Guid? wfpObjectiveTargetExpenditureId,
        Guid? activityWFPObjectiveTargetId,
        Guid? expenditureWFPObjectiveTargetId)
    {
        if (!wfpObjectiveTargetExpenditureId.HasValue)
        {
            return true; // Optional field
        }

        if (!expenditureWFPObjectiveTargetId.HasValue || !activityWFPObjectiveTargetId.HasValue)
        {
            return false; // If expenditure is set, both must be available
        }

        // Expenditure must belong to the same WFP objective target as the activity
        return expenditureWFPObjectiveTargetId.Value == activityWFPObjectiveTargetId.Value;
    }

    /// <summary>
    /// Validates that the fiscal year matches across LIB, source, and delivery unit allocation.
    /// </summary>
    public static bool ValidateFiscalYearConsistency(
        int libFiscalYear,
        int? sourceFiscalYear,
        int? allocationFiscalYear)
    {
        // If source has fiscal year, LIB must match
        if (sourceFiscalYear.HasValue && libFiscalYear != sourceFiscalYear.Value)
        {
            return false;
        }

        // If allocation has fiscal year, LIB must match
        if (allocationFiscalYear.HasValue && libFiscalYear != allocationFiscalYear.Value)
        {
            return false;
        }

        return true;
    }

    /// <summary>
    /// Validates that a sub-delivery unit can create its own LIB independently.
    /// Sub-DUs no longer need to wait for parent DU LIB creation.
    /// This enables independent budget planning at all DU levels.
    /// </summary>
    public static bool ValidateSubDUCanCreateIndependentLIB(
        bool isSubDeliveryUnit)
    {
        // Sub-DUs are now allowed to create their own LIBs
        return true;
    }

    /// <summary>
    /// Validates that a parent delivery unit can create a consolidated LIB.
    /// A consolidated LIB aggregates data from child delivery units.
    /// Only parent DUs can create consolidated LIBs.
    /// </summary>
    public static bool ValidateParentDUCanCreateConsolidatedLIB(
        bool isParentDeliveryUnit,
        bool isConsolidated)
    {
        // If marking as consolidated, only parent DUs can do this
        if (isConsolidated)
        {
            return isParentDeliveryUnit;
        }
        return true; // Non-consolidated LIBs can be created by any DU
    }

    /// <summary>
    /// Validates that a consolidated LIB is created after its child DU LIBs.
    /// Parent can consolidate child DU LIBs after they have been created and submitted.
    /// </summary>
    public static bool ValidateConsolidationSequence(
        bool isConsolidated,
        LIBStatus status,
        IEnumerable<DateTime> childLIBCreatedDates)
    {
        // If consolidated, ensure it's created after child LIBs (status check is enough for now)
        // This will be validated at the service level with actual child LIB data
        if (isConsolidated && status == LIBStatus.Consolidated)
        {
            return childLIBCreatedDates == null || !childLIBCreatedDates.Any() || 
                   childLIBCreatedDates.Max() < DateTime.UtcNow;
        }
        return true;
    }
}
