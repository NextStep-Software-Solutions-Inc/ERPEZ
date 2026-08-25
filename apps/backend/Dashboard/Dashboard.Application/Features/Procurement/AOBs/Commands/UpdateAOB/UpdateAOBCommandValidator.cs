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
            .IsInEnum()
            .WithMessage("Valid Award Criterion is required.");
    }
}
