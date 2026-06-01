using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public class CreateOPCRItemMOVCommandValidator : AbstractValidator<CreateOPCRItemMOVCommand>
{
    public CreateOPCRItemMOVCommandValidator()
    {
        RuleFor(x => x.OPCRItemId)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");

        RuleFor(x => x.RequirementName)
            .NotEmpty()
            .WithMessage("Requirement Name is required.")
            .MaximumLength(500)
            .WithMessage("Requirement Name cannot exceed 500 characters.");

        RuleFor(x => x.AttachedUrl)
            .MaximumLength(2048)
            .WithMessage("Attached URL cannot exceed 2048 characters.")
            .When(x => !string.IsNullOrEmpty(x.AttachedUrl));
    }
}