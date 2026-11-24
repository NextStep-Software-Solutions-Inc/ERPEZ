using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.DeleteSupplierRequirement;

public class DeleteSupplierRequirementCommandValidator : AbstractValidator<DeleteSupplierRequirementCommand>
{
    public DeleteSupplierRequirementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Supplier requirement ID is required for deletion.");
    }
}
