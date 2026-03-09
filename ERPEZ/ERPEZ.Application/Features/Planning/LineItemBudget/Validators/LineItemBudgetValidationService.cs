using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Application.Features.Planning.LineItemBudget.Validators;

/// <summary>
/// Implementation of LineItemBudget validation service with database access.
/// 
/// CONSOLIDATION WORKFLOW SUPPORT:
/// - Sub-delivery units can now create LIBs independently without waiting for parent DU LIB.
/// - Parent delivery units can create consolidated LIBs (IsConsolidated = true) that aggregate child DU LIBs.
/// - Consolidated LIBs are immutable once in Consolidated status.
/// 
/// NOTE: This service requires repositories to be added to IUnitOfWork.
/// Repositories needed: ILineItemBudgetRepository, and existing repositories for related entities.
/// </summary>
public class LineItemBudgetValidationService : ILineItemBudgetValidationService
{
    private readonly IUnitOfWork unitOfWork;

    public LineItemBudgetValidationService(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ValidationResult> ValidateCreateAsync(
        Guid deliveryUnitId,
        SourceType sourceType,
        Guid? sourceId,
        BudgetScope scope,
        int fiscalYear,
        Guid? duAllocationId,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // Validate DeliveryUnit exists
        var deliveryUnit = await unitOfWork.DeliveryUnitRepository
            .GetByIdAsync(deliveryUnitId, cancellationToken);
        
        if (deliveryUnit == null)
        {
            result.AddError("Delivery Unit not found.");
            return result;
        }

        // Validate SourceId requirement
        if (!LineItemBudgetValidationRules.ValidateSourceIdRequirement(sourceType, sourceId))
        {
            result.AddError(sourceType switch
            {
                SourceType.WFP => "Source ID (WFP) is required for WFP source type.",
                SourceType.OPCR => "Source ID (OPCR) is required for OPCR source type.",
                SourceType.Independent => "Source ID should not be provided for Independent source type.",
                _ => "Invalid source type."
            });
        }

        // Validate source exists and belongs to the delivery unit
        if (sourceId.HasValue)
        {
            if (sourceType == SourceType.WFP)
            {
                var wfp = await unitOfWork.WFPRepository.GetByIdAsync(sourceId.Value, cancellationToken);
                if (wfp == null)
                {
                    result.AddError("Work and Financial Plan not found.");
                }
                else if (wfp.OfficeId != deliveryUnit.OfficeId)
                {
                    result.AddError("Work and Financial Plan does not belong to the specified Delivery Unit.");
                }
                else
                {
                    // Validate fiscal year consistency
                    var wfpFiscalYear = wfp.FiscalYearId.HasValue 
                        ? (await unitOfWork.FiscalYearRepository.GetByIdAsync(wfp.FiscalYearId.Value, cancellationToken))?.Year
                        : null;
                    
                    if (!LineItemBudgetValidationRules.ValidateFiscalYearConsistency(
                        fiscalYear, wfpFiscalYear, null))
                    {
                        result.AddError("Fiscal year must match the Work and Financial Plan fiscal year.");
                    }
                }
            }
            else if (sourceType == SourceType.OPCR)
            {
                var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(sourceId.Value, cancellationToken);
                if (opcr == null)
                {
                    result.AddError("OPCR not found.");
                }
                else if (!LineItemBudgetValidationRules.ValidateSourceBelongsToDeliveryUnit(
                    sourceType, sourceId, deliveryUnitId, opcr.DeliveryUnitId))
                {
                    result.AddError("OPCR does not belong to the specified Delivery Unit.");
                }
                else
                {
                    // Validate fiscal year consistency
                    // Note: OPCR.FiscalYearId is non-nullable Guid, always has a value
                    var opcrFiscalYear = (await unitOfWork.FiscalYearRepository.GetByIdAsync(opcr.FiscalYearId, cancellationToken))?.Year;
                    
                    if (!LineItemBudgetValidationRules.ValidateFiscalYearConsistency(
                        fiscalYear, opcrFiscalYear, null))
                    {
                        result.AddError("Fiscal year must match the OPCR fiscal year.");
                    }
                }
            }
        }

        return result;
    }

    public async Task<ValidationResult> ValidateUpdateAsync(
        Guid lineItemBudgetId,
        SourceType sourceType,
        Guid? sourceId,
        BudgetScope scope,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Get the existing LIB
        // For now, this is a placeholder until the repository is added
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }

    public async Task<ValidationResult> ValidateAddActivityAsync(
        Guid lineItemBudgetId,
        Guid? wfpObjectiveTargetId,
        Guid? opcrActivityId,
        string activityName,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Get the LIB - placeholder until repository is implemented
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }

    public async Task<ValidationResult> ValidateAddDetailAsync(
        Guid lineItemBudgetId,
        Guid? lineItemBudgetActivityId,
        Guid? wfpObjectiveTargetExpenditureId,
        decimal budget,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Get the LIB - placeholder until repository is implemented
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }

    public async Task<ValidationResult> ValidateSubmissionAsync(
        Guid lineItemBudgetId,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Get the LIB - placeholder until repository is implemented
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }

    public async Task<ValidationResult> ValidateApprovalAsync(
        Guid lineItemBudgetId,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Get the LIB - placeholder until repository is implemented
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }

    public async Task<ValidationResult> ValidateConsolidationAsync(
        Guid lineItemBudgetId,
        bool markAsConsolidated,
        Guid? parentDeliveryUnitId,
        CancellationToken cancellationToken = default)
    {
        var result = new ValidationResult { IsValid = true };

        // TODO: Add ILineItemBudgetRepository to IUnitOfWork
        // Implementation steps:
        // 1. Get the LIB and its DeliveryUnit
        // 2. If marking as consolidated:
        //    a. Verify the DeliveryUnit is a parent DU (has SubDeliveryUnits)
        //    b. Verify the LIB status can be set to Consolidated
        //    c. Verify child DU LIBs exist and are submitted/approved
        //    d. Validate consolidation hierarchy if parentDeliveryUnitId is provided
        // 3. Return validation errors if any checks fail
        
        result.AddError("LineItemBudget repository not yet implemented in IUnitOfWork.");
        return result;
    }
}
