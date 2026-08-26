using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Validators;

/// <summary>
/// Validates the MSF target linkage: mutual exclusivity, correct LIB scope,
/// and that the office context matches the target Line-Item Budget.
/// Called from Create, Update, and Link command handlers.
/// </summary>
internal static class MarketScopingTargetValidator
{
    public static async Task ValidateAsync(
        Guid? targetLineItemBudgetId,
        Guid? targetLineItemBudgetActivityId,
        Guid? callerOfficeId,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken,
        Guid? currentMarketScopingId = null)
    {
        // ── 1. Mutual exclusivity ─────────────────────────────────────────────
        if (targetLineItemBudgetId.HasValue && targetLineItemBudgetActivityId.HasValue)
        {
            throw new ValidationException(
                "An MSF cannot target both a Line-Item Budget and a LIB Activity simultaneously.");
        }

        // ── 2. Project-scope validation ───────────────────────────────────────
        if (targetLineItemBudgetId.HasValue)
        {
            var lib = await unitOfWork.LineItemBudgetRepository
                          .GetByIdAsync(targetLineItemBudgetId.Value, cancellationToken)
                      ?? throw new NotFoundException(
                             $"Line Item Budget with ID {targetLineItemBudgetId.Value} not found.");

            if (!IsProjectScope(lib.Scope))
            {
                throw new ValidationException(
                    "TargetLineItemBudgetId must reference a Project-scoped Line Item Budget.");
            }

            if (callerOfficeId.HasValue && callerOfficeId.Value != Guid.Empty &&
                lib.OfficeId.HasValue && lib.OfficeId.Value != callerOfficeId.Value)
            {
                throw new ValidationException(
                    "The selected Line-Item Budget does not belong to the selected office.");
            }

            var existing = await unitOfWork.MarketScopingRepository
                .FindAllAsync(ms => ms.TargetLineItemBudgetId == targetLineItemBudgetId.Value && !ms.IsDeleted, cancellationToken);
            if (existing.Any(ms => currentMarketScopingId == null || ms.Id != currentMarketScopingId.Value))
            {
                throw new ValidationException(
                    "A Market Scoping Form has already been created for this Project-scoped Line Item Budget.");
            }
        }

        // ── 3. Activity-scope validation ──────────────────────────────────────
        if (targetLineItemBudgetActivityId.HasValue)
        {
            var activity = await unitOfWork.LineItemBudgetActivityRepository
                               .GetByIdAsync(targetLineItemBudgetActivityId.Value, cancellationToken)
                           ?? throw new NotFoundException(
                                  $"Line Item Budget Activity with ID {targetLineItemBudgetActivityId.Value} not found.");

            var parentLib = await unitOfWork.LineItemBudgetRepository
                                .GetByIdAsync(activity.LineItemBudgetId, cancellationToken)
                            ?? throw new NotFoundException(
                                   $"Parent Line Item Budget for Activity {targetLineItemBudgetActivityId.Value} not found.");

            if (!IsActivityScope(parentLib.Scope))
            {
                throw new ValidationException(
                    "TargetLineItemBudgetActivityId must belong to an Activity-scoped Line Item Budget.");
            }

            if (callerOfficeId.HasValue && callerOfficeId.Value != Guid.Empty &&
                parentLib.OfficeId.HasValue && parentLib.OfficeId.Value != callerOfficeId.Value)
            {
                throw new ValidationException(
                    "The selected Line-Item Budget Activity does not belong to the selected office.");
            }

            var existing = await unitOfWork.MarketScopingRepository
                .FindAllAsync(ms => ms.TargetLineItemBudgetActivityId == targetLineItemBudgetActivityId.Value && !ms.IsDeleted, cancellationToken);
            if (existing.Any(ms => currentMarketScopingId == null || ms.Id != currentMarketScopingId.Value))
            {
                throw new ValidationException(
                    "A Market Scoping Form has already been created for this Line Item Budget Activity.");
            }
        }
    }

    private static bool IsProjectScope(string? scope) =>
        string.Equals(scope, "Project", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(scope, "ProjectLevel", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(scope, nameof(BudgetScope.ProjectLevel), StringComparison.OrdinalIgnoreCase);

    private static bool IsActivityScope(string? scope) =>
        string.Equals(scope, "Activity", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(scope, "ActivityLevel", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(scope, nameof(BudgetScope.ActivityLevel), StringComparison.OrdinalIgnoreCase);
}
