using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOffice;

public class UpdateOfficeCommandValidator : AbstractValidator<UpdateOfficeCommand>
{
    public UpdateOfficeCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Office ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Office ID must be a valid, non-empty GUID.");

        // 2. OfficeHead (Required String, Min/Max Length)
        RuleFor(x => x.UpdateOffice.OfficeHead)
            .NotEmpty()
            .WithMessage("Office Head name is required.")
            .MinimumLength(5)
            .WithMessage("Office Head name must be at least 5 characters long.")
            .MaximumLength(100)
            .WithMessage("Office Head name cannot exceed 100 characters.");

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateOffice.Name)
            .NotEmpty()
            .WithMessage("Office Name is required.")
            .MinimumLength(5)
            .WithMessage("Office Name must be at least 5 characters long.")
            .MaximumLength(150)
            .WithMessage("Office Name cannot exceed 150 characters.");

        // 4. Description (Optional String, Max Length)
        RuleFor(x => x.UpdateOffice.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateOffice.Description));

        // 5. Address (Required String, Min/Max Length)
        RuleFor(x => x.UpdateOffice.Address)
            .NotEmpty()
            .WithMessage("Office Address is required.")
            .MaximumLength(300)
            .WithMessage("Address cannot exceed 300 characters.");

        // 6. Email (Required String, Email Format)
        RuleFor(x => x.UpdateOffice.Email)
            .NotEmpty()
            .WithMessage("Email address is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(100)
            .WithMessage("Email address cannot exceed 100 characters.");

        // 7. ContactNumber (Required String, Max Length)
        RuleFor(x => x.UpdateOffice.ContactNumber)
            .NotEmpty()
            .WithMessage("Contact Number is required.")
            .MaximumLength(30)
            .WithMessage("Contact Number cannot exceed 30 characters.");

        // 8. ResponsibilityCenterCode (Optional String, Max Length)
        RuleFor(x => x.UpdateOffice.ResponsibilityCenterCode)
            .MaximumLength(20)
            .WithMessage("Responsibility Center Code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateOffice.ResponsibilityCenterCode));
    }
}