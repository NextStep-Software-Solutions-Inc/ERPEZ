using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.CreateAOB;

public class CreateAOBCommandValidator : AbstractValidator<CreateAOBCommand>
{
    public CreateAOBCommandValidator()
    {
        RuleFor(x => x.AOBNumber)
            .NotEmpty()
            .WithMessage("AOB Number is required.")
            .MaximumLength(100)
            .WithMessage("AOB Number cannot exceed 100 characters.");

        RuleFor(x => x.AwardCriterion)
            .IsInEnum()
            .WithMessage("Valid Award Criterion is required (e.g. LCRB, MEARB).");
    }
}
