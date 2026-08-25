using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;

public class ApproveAOBCommandValidator : AbstractValidator<ApproveAOBCommand>
{
    public ApproveAOBCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty()
            .WithMessage("AOB ID is required.");
    }
}
