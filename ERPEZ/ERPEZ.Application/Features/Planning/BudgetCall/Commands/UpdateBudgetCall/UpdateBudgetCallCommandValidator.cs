using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.UpdateBudgetCall;

public class UpdateBudgetCallCommandValidator : AbstractValidator<UpdateBudgetCallCommand>
{
    public UpdateBudgetCallCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Budget call ID is required.");

        RuleFor(x => x.UpdateBudgetCall.Type)
            .Must(IsValidBudgetCallType)
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateBudgetCall.Type))
            .WithMessage("Type must be one of: InitialProposal, SupplementalBudget, BudgetRevision, MidYearReview, YearEndAdjustment.");

        RuleFor(x => x.UpdateBudgetCall.SubmissionDeadline)
            .NotEmpty()
            .WithMessage("Submission deadline is required.")
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Submission deadline must be in the future.");
    }

    private static bool IsValidBudgetCallType(string? type)
    {
        return Enum.TryParse<BudgetCallTypeEnum>(type, ignoreCase: true, out _);
    }
}
