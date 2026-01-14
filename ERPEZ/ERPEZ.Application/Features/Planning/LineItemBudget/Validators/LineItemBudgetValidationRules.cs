using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.LineItemBudget.Validators;

/// <summary>
/// Contains all business validation rules for LineItemBudget entities.
/// These rules enforce the requirements specified in the LIB domain model.
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
    /// Validates that a Sub-DU LIB must reference a Parent DU's LIB for consolidation.
    /// Parent DU LIBs should not have a ParentLIBId.
    /// </summary>
    public static bool ValidateParentLIBForSubDeliveryUnit(
        bool isSubDeliveryUnit,
        Guid? parentLIBId)
    {
        if (isSubDeliveryUnit)
        {
            return parentLIBId.HasValue && parentLIBId.Value != Guid.Empty;
        }
        else
        {
            return !parentLIBId.HasValue; // Parent DU should not have ParentLIBId
        }
    }

    /// <summary>
    /// Validates one-to-one linking between Sub-DU and Parent LIB.
    /// A Sub-DU LIB cannot be consolidated into multiple Parent LIBs.
    /// </summary>
    public static bool ValidateOneToOneConsolidation(
        Guid subDULIBId,
        IEnumerable<Guid> existingParentLIBIds,
        Guid newParentLIBId)
    {
        // If the LIB already has consolidations, ensure we're not adding a different parent
        if (existingParentLIBIds != null && existingParentLIBIds.Any())
        {
            var firstParent = existingParentLIBIds.First();
            return firstParent == newParentLIBId;
        }
        return true;
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
    /// Validates that Parent LIB approval is required before Sub-DU can submit.
    /// </summary>
    public static bool ValidateParentApprovalBeforeSubDUSubmission(
        LIBStatus? parentLIBStatus)
    {
        if (!parentLIBStatus.HasValue)
        {
            return true; // No parent means this is a parent LIB or independent
        }

        return parentLIBStatus.Value == LIBStatus.Approved;
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
}
