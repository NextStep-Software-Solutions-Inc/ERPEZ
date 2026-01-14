using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.LineItemBudget.Validators;

/// <summary>
/// Service interface for LineItemBudget validation operations.
/// Provides validation methods that require database access.
/// </summary>
public interface ILineItemBudgetValidationService
{
    /// <summary>
    /// Validates all business rules for creating a new LineItemBudget.
    /// </summary>
    Task<ValidationResult> ValidateCreateAsync(
        Guid deliveryUnitId,
        SourceType sourceType,
        Guid? sourceId,
        BudgetScope scope,
        int fiscalYear,
        Guid? duAllocationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates all business rules for updating an existing LineItemBudget.
    /// </summary>
    Task<ValidationResult> ValidateUpdateAsync(
        Guid lineItemBudgetId,
        SourceType sourceType,
        Guid? sourceId,
        BudgetScope scope,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that an activity can be added to a LineItemBudget.
    /// </summary>
    Task<ValidationResult> ValidateAddActivityAsync(
        Guid lineItemBudgetId,
        Guid? wfpObjectiveTargetId,
        Guid? opcrActivityId,
        string activityName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that a detail can be added to a LineItemBudget.
    /// </summary>
    Task<ValidationResult> ValidateAddDetailAsync(
        Guid lineItemBudgetId,
        Guid? lineItemBudgetActivityId,
        Guid? wfpObjectiveTargetExpenditureId,
        decimal budget,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that a LineItemBudget can be submitted.
    /// </summary>
    Task<ValidationResult> ValidateSubmissionAsync(
        Guid lineItemBudgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that a LineItemBudget can be approved.
    /// </summary>
    Task<ValidationResult> ValidateApprovalAsync(
        Guid lineItemBudgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates consolidation rules for a Sub-DU LineItemBudget.
    /// </summary>
    Task<ValidationResult> ValidateConsolidationAsync(
        Guid subDULineItemBudgetId,
        Guid parentLineItemBudgetId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Represents the result of a validation operation.
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = [];

    public static ValidationResult Success() => new() { IsValid = true };

    public static ValidationResult Failure(string error) => new()
    {
        IsValid = false,
        Errors = [error]
    };

    public static ValidationResult Failure(List<string> errors) => new()
    {
        IsValid = false,
        Errors = errors
    };

    public void AddError(string error)
    {
        IsValid = false;
        Errors.Add(error);
    }
}
