using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.DeleteOfficeCeiling;

public class DeleteOfficeCeilingCommandValidator : AbstractValidator<DeleteOfficeCeilingCommand>
{
    public DeleteOfficeCeilingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}



