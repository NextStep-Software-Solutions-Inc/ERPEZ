using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;

public class UpdateAOBCommandValidator : AbstractValidator<UpdateAOBCommand>
{
    public UpdateAOBCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("AOB ID is required.");

        RuleFor(x => x.AOBNumber)
            .NotEmpty()
            .WithMessage("AOB Number is required.")
            .MaximumLength(100)
            .WithMessage("AOB Number cannot exceed 100 characters.");

        RuleFor(x => x.AwardCriterion)
            .NotEmpty()
            .Must(c => c == "LCRB" || c == "MEARB" || c == "MARB")
            .WithMessage("Award Criterion must be either LCRB, MEARB, or MARB.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => s == "DRAFT" || s == "FOR_APPROVAL" || s == "APPROVED")
            .WithMessage("Status must be either DRAFT, FOR_APPROVAL, or APPROVED.");

        RuleFor(x => x.ProcurementProjectIds)
            .NotEmpty()
            .WithMessage("At least one Procurement Project ID must be specified.");
    }
}
