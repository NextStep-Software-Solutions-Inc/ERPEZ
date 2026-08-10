using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

/// <summary>
/// Validator for UpdateTenantCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        // Id validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Tenant ID is required.");

        // UpdateTenant validation
        RuleFor(x => x.UpdateTenant)
            .NotNull()
            .WithMessage("Update tenant data is required.");

        // Name validation (optional, but if provided must meet constraints)
        When(x => x.UpdateTenant?.Name != null, () =>
        {
            RuleFor(x => x.UpdateTenant!.Name)
                .NotEmpty()
                .WithMessage("Tenant name cannot be empty if provided.")
                .MinimumLength(3)
                .WithMessage("Tenant name must be at least 3 characters long.")
                .MaximumLength(100)
                .WithMessage("Tenant name cannot exceed 100 characters.")
                .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
                .WithMessage("Tenant name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
        });

        // Description validation (optional, but if provided must meet constraints)
        When(x => x.UpdateTenant?.Description != null, () =>
        {
            RuleFor(x => x.UpdateTenant!.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.");
        });
    }
}
