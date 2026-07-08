using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.LinkCeilingToLIB;

public class LinkCeilingToLIBCommandValidator : AbstractValidator<LinkCeilingToLIBCommand>
{
    public LinkCeilingToLIBCommandValidator()
    {
        RuleFor(x => x.LIBId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.AgencyMasterBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}
