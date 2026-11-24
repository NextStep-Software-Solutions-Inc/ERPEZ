using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.ChangeBudgetCallStatus;

public class ChangeBudgetCallStatusCommandValidator : AbstractValidator<ChangeBudgetCallStatusCommand>
{
    public ChangeBudgetCallStatusCommandValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => Enum.TryParse<BudgetCallStatusEnum>(status, true, out _))
            .WithMessage($"Status must be one of the following: {string.Join(", ", Enum.GetNames<BudgetCallStatusEnum>())}.");
    }
}
