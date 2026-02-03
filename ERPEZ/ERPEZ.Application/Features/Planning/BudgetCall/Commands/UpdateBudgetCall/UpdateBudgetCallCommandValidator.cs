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
            .NotEmpty()
            .WithMessage("Budget call type is required.")
            .MaximumLength(100)
            .WithMessage("Budget call type cannot exceed 100 characters.");

        RuleFor(x => x.UpdateBudgetCall.SubmissionDeadline)
            .NotEmpty()
            .WithMessage("Submission deadline is required.")
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Submission deadline must be in the future.");
    }
}
