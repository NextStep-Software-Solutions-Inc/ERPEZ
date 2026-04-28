using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.VerifySupplierRequirements;

public class VerifySupplierRequirementsCommandValidator : AbstractValidator<VerifySupplierRequirementsCommand>
{
    public VerifySupplierRequirementsCommandValidator()
    {
        RuleFor(x => x.SupplierId)
            .NotEmpty()
            .WithMessage("Supplier ID is required.");

        RuleFor(x => x.Requirements)
            .NotNull()
            .WithMessage("Requirements array is required.")
            .NotEmpty()
            .WithMessage("At least one requirement must be provided.");

        RuleForEach(x => x.Requirements)
            .ChildRules(requirement =>
            {
                requirement.RuleFor(r => r.SupplierRequirementId)
                    .NotEmpty()
                    .WithMessage("Supplier requirement ID is required.");
            });
    }
}
