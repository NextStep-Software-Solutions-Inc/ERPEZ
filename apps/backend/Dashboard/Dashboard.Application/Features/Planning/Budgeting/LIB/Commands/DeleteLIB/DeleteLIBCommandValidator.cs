using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.DeleteLIB;

public class DeleteLIBCommandValidator : AbstractValidator<DeleteLIBCommand>
{
    public DeleteLIBCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}



