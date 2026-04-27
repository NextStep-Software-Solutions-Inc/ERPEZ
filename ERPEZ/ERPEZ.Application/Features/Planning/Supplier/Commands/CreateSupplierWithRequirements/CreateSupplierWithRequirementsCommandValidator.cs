using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplierWithRequirements;

public class CreateSupplierWithRequirementsCommandValidator : AbstractValidator<CreateSupplierWithRequirementsCommand>
{
    public CreateSupplierWithRequirementsCommandValidator()
    {
        RuleFor(x => x.CreateSupplierRequest)
            .NotNull()
            .WithMessage("Supplier information is required.");

        RuleFor(x => x.CreateSupplierRequest.Name)
            .NotEmpty()
            .WithMessage("Supplier Name is required.")
            .MaximumLength(250)
            .WithMessage("Supplier Name cannot exceed 250 characters.");

        RuleFor(x => x.CreateSupplierRequest.BusinessPermitNo)
            .NotEmpty()
            .WithMessage("Business Permit Number is required.")
            .MaximumLength(100)
            .WithMessage("Business Permit Number cannot exceed 100 characters.");

        RuleFor(x => x.CreateSupplierRequest.ContactPerson)
            .NotEmpty()
            .WithMessage("Contact Person is required.")
            .MaximumLength(200)
            .WithMessage("Contact Person cannot exceed 200 characters.");

        RuleFor(x => x.CreateSupplierRequest.ContactNumber)
            .NotEmpty()
            .WithMessage("Contact Number is required.")
            .MaximumLength(50)
            .WithMessage("Contact Number cannot exceed 50 characters.")
            .Matches(@"^[\d\s\+\-\(\)]+$")
            .WithMessage("Contact Number must contain only digits, spaces, and valid phone formatting characters.");

        RuleFor(x => x.CreateSupplierRequest.Address)
            .NotEmpty()
            .WithMessage("Address is required.")
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.");

        RuleFor(x => x.CreateSupplierRequest.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(200)
            .WithMessage("Email cannot exceed 200 characters.");

        RuleFor(x => x.CreateSupplierRequest.TINNumber)
            .NotEmpty()
            .WithMessage("TIN Number is required.")
            .MaximumLength(50)
            .WithMessage("TIN Number cannot exceed 50 characters.");

        RuleFor(x => x.CreateSupplierRequest.PhilGEPSNumber)
            .MaximumLength(50)
            .WithMessage("PhilGEPS Number cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.CreateSupplierRequest.PhilGEPSNumber));

        RuleFor(x => x.CreateSupplierRequest.SupplierCategoryId)
            .NotEmpty()
            .WithMessage("Supplier Category is required.");

        RuleFor(x => x.CreateSupplierRequest.Requirements)
            .NotNull()
            .WithMessage("Requirements array is required.");

        RuleForEach(x => x.CreateSupplierRequest.Requirements)
            .ChildRules(requirement =>
            {
                requirement.RuleFor(r => r.RequirementName)
                    .NotEmpty()
                    .WithMessage("Requirement Name is required.")
                    .MaximumLength(250)
                    .WithMessage("Requirement Name cannot exceed 250 characters.");

                requirement.RuleFor(r => r.URL)
                    .NotEmpty()
                    .WithMessage("Requirement URL is required.")
                    .MaximumLength(500)
                    .WithMessage("Requirement URL cannot exceed 500 characters.");
            });
    }
}
