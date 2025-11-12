using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public class CreateOfficeCommandValidator : AbstractValidator<CreateOfficeCommand>
{
    public CreateOfficeCommandValidator()
    {
        RuleFor(x => x.ClusterId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Cluster ID must be a valid, non-empty GUID.")
            .When(x => x.ClusterId.HasValue);

        // OfficeHead (Required String, Min/Max Length)
        RuleFor(x => x.OfficeHead)
            .NotEmpty()
            .WithMessage("Office Head name is required.")
            .MinimumLength(5)
            .WithMessage("Office Head name must be at least 5 characters long.")
            .MaximumLength(100)
            .WithMessage("Office Head name cannot exceed 100 characters.");

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Office Name is required.")
            .MinimumLength(5)
            .WithMessage("Office Name must be at least 5 characters long.")
            .MaximumLength(150)
            .WithMessage("Office Name cannot exceed 150 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // Address (Required String, Min/Max Length)
        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Office Address is required.")
            .MaximumLength(300)
            .WithMessage("Address cannot exceed 300 characters.");

        // Email (Required String, Email Format)
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email address is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(100)
            .WithMessage("Email address cannot exceed 100 characters.");

        // ContactNumber (Required String, Max Length)
        RuleFor(x => x.ContactNumber)
            .NotEmpty()
            .WithMessage("Contact Number is required.")
            .MaximumLength(30)
            .WithMessage("Contact Number cannot exceed 30 characters.");

        // ResponsibilityCenterCode (Optional String, Max Length)
        RuleFor(x => x.ResponsibilityCenterCode)
            .MaximumLength(20)
            .WithMessage("Responsibility Center Code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.ResponsibilityCenterCode));
    }
}
