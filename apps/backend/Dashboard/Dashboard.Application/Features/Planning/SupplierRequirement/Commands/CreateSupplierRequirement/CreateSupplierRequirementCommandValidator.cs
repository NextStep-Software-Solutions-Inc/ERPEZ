using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.CreateSupplierRequirement;

public class CreateSupplierRequirementCommandValidator : AbstractValidator<CreateSupplierRequirementCommand>
{
    public CreateSupplierRequirementCommandValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty()
            .WithMessage("Supplier ID is required.");

        RuleFor(x => x.RequirementName)
            .NotEmpty()
            .WithMessage("Requirement Name is required.")
            .MaximumLength(250)
            .WithMessage("Requirement Name cannot exceed 250 characters.");

        RuleFor(x => x.FileId)
            .NotEmpty()
            .WithMessage("File ID is required.");
    }
}
