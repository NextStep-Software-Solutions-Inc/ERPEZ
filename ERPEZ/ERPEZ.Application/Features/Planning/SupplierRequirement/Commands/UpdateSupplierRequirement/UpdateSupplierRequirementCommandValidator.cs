using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.UpdateSupplierRequirement;

public class UpdateSupplierRequirementCommandValidator : AbstractValidator<UpdateSupplierRequirementCommand>
{
    public UpdateSupplierRequirementCommandValidator()
    {
        RuleFor(x => x.UpdateSupplierRequirement.RequirementName)
            .NotEmpty()
            .WithMessage("Requirement Name is required.")
            .MaximumLength(250)
            .WithMessage("Requirement Name cannot exceed 250 characters.");

        RuleFor(x => x.UpdateSupplierRequirement.URL)
            .NotEmpty()
            .WithMessage("URL is required.")
            .MaximumLength(500)
            .WithMessage("URL cannot exceed 500 characters.");
    }
}
