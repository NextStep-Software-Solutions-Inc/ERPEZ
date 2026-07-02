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
            .NotEmpty()
            .Must(c => c == "LCRB" || c == "MEARB" || c == "MARB")
            .WithMessage("Award Criterion must be either LCRB, MEARB, or MARB.");

        RuleFor(x => x.ProcurementProjectIds)
            .NotEmpty()
            .WithMessage("At least one Procurement Project ID must be specified.");
    }
}
