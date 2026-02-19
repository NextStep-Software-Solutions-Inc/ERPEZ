using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;

public class UpdateSupplierCommandValidator : AbstractValidator<UpdateSupplierCommand>
{
    public UpdateSupplierCommandValidator()
    {
        RuleFor(x => x.UpdateSupplier.Name)
            .NotEmpty()
            .WithMessage("Supplier Name is required.")
            .MaximumLength(250)
            .WithMessage("Supplier Name cannot exceed 250 characters.");

        RuleFor(x => x.UpdateSupplier.BusinessPermitNo)
            .NotEmpty()
            .WithMessage("Business Permit Number is required.")
            .MaximumLength(100)
            .WithMessage("Business Permit Number cannot exceed 100 characters.");

        RuleFor(x => x.UpdateSupplier.ContactPerson)
            .NotEmpty()
            .WithMessage("Contact Person is required.")
            .MaximumLength(200)
            .WithMessage("Contact Person cannot exceed 200 characters.");

        RuleFor(x => x.UpdateSupplier.ContactNumber)
            .NotEmpty()
            .WithMessage("Contact Number is required.")
            .MaximumLength(50)
            .WithMessage("Contact Number cannot exceed 50 characters.")
            .Matches(@"^[\d\s\+\-\(\)]+$")
            .WithMessage("Contact Number must contain only digits, spaces, and valid phone formatting characters.");

        RuleFor(x => x.UpdateSupplier.Address)
            .NotEmpty()
            .WithMessage("Address is required.")
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.");

        RuleFor(x => x.UpdateSupplier.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(200)
            .WithMessage("Email cannot exceed 200 characters.");

        RuleFor(x => x.UpdateSupplier.TINNumber)
            .NotEmpty()
            .WithMessage("TIN Number is required.")
            .MaximumLength(50)
            .WithMessage("TIN Number cannot exceed 50 characters.");

        RuleFor(x => x.UpdateSupplier.PhilGEPSNumber)
            .MaximumLength(50)
            .WithMessage("PhilGEPS Number cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdateSupplier.PhilGEPSNumber));

        RuleFor(x => x.UpdateSupplier.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => Enum.TryParse<SupplierStatusEnum>(status, out _))
            .WithMessage("Invalid Supplier Status. Allowed values: Pending, Approved, Declined.");

        RuleFor(x => x.UpdateSupplier.SupplierCategoryId)
            .NotEmpty()
            .WithMessage("Supplier Category is required.");
    }
}
