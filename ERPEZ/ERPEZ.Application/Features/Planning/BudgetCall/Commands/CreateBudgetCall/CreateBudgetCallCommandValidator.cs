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
            .NotEmpty()
            .WithMessage("Budget call type is required.")
            .MaximumLength(100)
            .WithMessage("Budget call type cannot exceed 100 characters.");

        RuleFor(x => x.SubmissionDeadline)
            .NotEmpty()
            .WithMessage("Submission deadline is required.")
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Submission deadline must be in the future.");
    }
}
