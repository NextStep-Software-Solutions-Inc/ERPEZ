using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.ChangeBudgetCallStatus;

public class ChangeBudgetCallStatusCommandValidator : AbstractValidator<ChangeBudgetCallStatusCommand>
{
    public ChangeBudgetCallStatusCommandValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(IsValidBudgetCallStatus)
            .WithMessage("Status must be one of: Draft, Active, Closed.");
    }

    private static bool IsValidBudgetCallStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return false;
        var validStatuses = new[] { "Draft", "Active", "Closed" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}
