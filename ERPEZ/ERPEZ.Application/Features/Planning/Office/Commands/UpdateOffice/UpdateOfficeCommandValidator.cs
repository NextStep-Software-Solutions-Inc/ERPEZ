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

        // 2. OfficeHead (Optional String, Min/Max Length)
        When(x => x.UpdateOffice.OfficeHead != null, () =>
        {
            RuleFor(x => x.UpdateOffice.OfficeHead!)
                .NotEmpty()
                .WithMessage("Office Head name is required.")
                .MinimumLength(5)
                .WithMessage("Office Head name must be at least 5 characters long.")
                .MaximumLength(100)
                .WithMessage("Office Head name cannot exceed 100 characters.");
        });

        // 3. Name (Optional String, Min/Max Length)
        When(x => x.UpdateOffice.Name != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Name!)
                .NotEmpty()
                .WithMessage("Office Name is required.")
                .MinimumLength(5)
                .WithMessage("Office Name must be at least 5 characters long.")
                .MaximumLength(150)
                .WithMessage("Office Name cannot exceed 150 characters.");
        });

        // 4. Description (Optional String, Max Length)
        When(x => x.UpdateOffice.Description != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Description!)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.");
        });
       
        // 5. Address (Optional String, Min/Max Length)
        When(x => x.UpdateOffice.Address != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Address!)
                .NotEmpty()
                .WithMessage("Office Address is required.")
                .MaximumLength(300)
                .WithMessage("Address cannot exceed 300 characters.");
        });

        // 6. Email (Optional String, Email Format)
        When(x => x.UpdateOffice.Email != null, () =>
        {
            RuleFor(x => x.UpdateOffice.Email)
                .NotEmpty()
                .WithMessage("Email address is required.")
                .EmailAddress()
                .WithMessage("A valid email address is required.")
                .MaximumLength(100)
                .WithMessage("Email address cannot exceed 100 characters.");
        });

        // 7. ContactNumber (Optional String, Max Length)
        When(x => x.UpdateOffice.ContactNumber != null, () =>
        {
            RuleFor(x => x.UpdateOffice.ContactNumber!)
                .NotEmpty()
                .WithMessage("Contact Number is required.")
                .MaximumLength(30)
                .WithMessage("Contact Number cannot exceed 30 characters.");
        });

        // 8. ResponsibilityCenterCode (Optional String, Max Length)
        When(x => x.UpdateOffice.ResponsibilityCenterCode != null, () =>
        {
             RuleFor(x => x.UpdateOffice.ResponsibilityCenterCode)
            .MaximumLength(20)
            .WithMessage("Responsibility Center Code cannot exceed 20 characters.");
        });

        When(x => x.UpdateOffice.IsDeliveryUnit != null, () =>
        {
             RuleFor(x => x.UpdateOffice.IsDeliveryUnit)
            .NotNull()
            .WithMessage("IsDeliveryUnit must be specified as true or false.");
        });
    }
}
