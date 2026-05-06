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

        RuleFor(x => x.UpdateSupplierRequirement.FileId)
            .NotEmpty()
            .WithMessage("File ID is required.");
    }
}
