using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVCommandValidator : AbstractValidator<UpdateOPCRItemMOVCommand>
{
    public UpdateOPCRItemMOVCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item MOV ID is required.");

        RuleFor(x => x.UpdateOPCRItemMOV.RequirementName)
            .NotEmpty()
            .WithMessage("Requirement Name is required.")
            .MaximumLength(500)
            .WithMessage("Requirement Name cannot exceed 500 characters.");

        RuleFor(x => x.UpdateOPCRItemMOV.AttachedUrl)
            .MaximumLength(2048)
            .WithMessage("Attached URL cannot exceed 2048 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateOPCRItemMOV.AttachedUrl));
    }
}