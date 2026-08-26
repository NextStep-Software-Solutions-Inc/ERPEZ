using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplier;

public class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Supplier Name is required.")
            .MaximumLength(250)
            .WithMessage("Supplier Name cannot exceed 250 characters.");

        RuleFor(x => x.BusinessPermitNo)
            .NotEmpty()
            .WithMessage("Business Permit Number is required.")
            .MaximumLength(100)
            .WithMessage("Business Permit Number cannot exceed 100 characters.");

        RuleFor(x => x.ContactPerson)
            .NotEmpty()
            .WithMessage("Contact Person is required.")
            .MaximumLength(200)
            .WithMessage("Contact Person cannot exceed 200 characters.");

        RuleFor(x => x.ContactNumber)
            .NotEmpty()
            .WithMessage("Contact Number is required.")
            .MaximumLength(50)
            .WithMessage("Contact Number cannot exceed 50 characters.")
            .Matches(@"^[\d\s\+\-\(\)]+$")
            .WithMessage("Contact Number must contain only digits, spaces, and valid phone formatting characters.");

        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Address is required.")
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(200)
            .WithMessage("Email cannot exceed 200 characters.");

        RuleFor(x => x.TINNumber)
            .NotEmpty()
            .WithMessage("TIN Number is required.")
            .MaximumLength(50)
            .WithMessage("TIN Number cannot exceed 50 characters.");

        RuleFor(x => x.PhilGEPSNumber)
            .MaximumLength(50)
            .WithMessage("PhilGEPS Number cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.PhilGEPSNumber));

        RuleFor(x => x.SupplierCategoryId)
            .NotEmpty()
            .WithMessage("Supplier Category is required.");
    }
}
