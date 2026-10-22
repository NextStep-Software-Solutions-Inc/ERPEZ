using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitAOB;

public class SubmitAOBCommandValidator : AbstractValidator<SubmitAOBCommand>
{
    public SubmitAOBCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty()
            .WithMessage("AOB ID is required.");
    }
}
