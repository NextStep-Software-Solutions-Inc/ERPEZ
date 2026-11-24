using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ReturnAOB;

public class ReturnAOBCommandValidator : AbstractValidator<ReturnAOBCommand>
{
    public ReturnAOBCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty()
            .WithMessage("AOB ID is required.");

        RuleFor(x => x.Remarks)
            .NotEmpty()
            .WithMessage("Return remarks are required to provide feedback to Secretariat.");
    }
}
