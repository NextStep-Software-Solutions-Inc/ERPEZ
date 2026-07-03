using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.DeleteAOB;

public class DeleteAOBCommandValidator : AbstractValidator<DeleteAOBCommand>
{
    public DeleteAOBCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("AOB ID is required.");
    }
}
