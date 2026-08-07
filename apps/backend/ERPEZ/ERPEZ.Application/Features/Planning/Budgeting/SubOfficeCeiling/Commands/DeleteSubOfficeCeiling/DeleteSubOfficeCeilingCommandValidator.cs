using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.DeleteSubOfficeCeiling;

public class DeleteSubOfficeCeilingCommandValidator : AbstractValidator<DeleteSubOfficeCeilingCommand>
{
    public DeleteSubOfficeCeilingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}



