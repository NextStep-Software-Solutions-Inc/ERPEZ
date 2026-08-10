using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

/// <summary>
/// Validator for CreateTenantCommand that ensures all required fields meet business rules.
/// This serves as an example implementation of FluentValidation in the application layer.
/// </summary>
public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        // Name validation
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Tenant name is required.")
            .MinimumLength(3)
            .WithMessage("Tenant name must be at least 3 characters long.")
            .MaximumLength(100)
            .WithMessage("Tenant name cannot exceed 100 characters.")
            .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
            .WithMessage("Tenant name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");

        // Description validation (optional, but if provided must meet constraints)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // BillingContactEmail validation
        RuleFor(x => x.BillingContactEmail)
            .NotEmpty()
            .WithMessage("Billing contact email is required.")
            .EmailAddress()
            .WithMessage("Billing contact email must be a valid email address.")
            .MaximumLength(255)
            .WithMessage("Billing contact email cannot exceed 255 characters.");

        // OnPremise is a boolean, no specific validation needed beyond type safety
    }
}
