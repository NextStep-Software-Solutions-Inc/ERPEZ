using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.CreateBudgetCall;

public class CreateBudgetCallCommandValidator : AbstractValidator<CreateBudgetCallCommand>
{
    public CreateBudgetCallCommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year ID is required.");

        RuleFor(x => x.Type)
            .Must(IsValidBudgetCallType)
            .When(x => !string.IsNullOrWhiteSpace(x.Type))
            .WithMessage("Type must be one of: InitialProposal, SupplementalBudget, BudgetRevision, MidYearReview, YearEndAdjustment.");

        RuleFor(x => x.SubmissionDeadline)
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
