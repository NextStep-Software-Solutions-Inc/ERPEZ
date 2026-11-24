using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;

/// <summary>
/// Validator for UpdateModuleCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateModuleCommandValidator : AbstractValidator<UpdateModuleCommand>
{
    public UpdateModuleCommandValidator()
    {
        // Id validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Module ID is required.");

        // UpdateModule validation
        RuleFor(x => x.UpdateModule)
            .NotNull()
            .WithMessage("Update module data is required.");

        // Name validation (optional, but if provided must meet constraints)
        When(x => x.UpdateModule?.Name != null, () =>
        {
            RuleFor(x => x.UpdateModule!.Name)
                .NotEmpty()
                .WithMessage("Module name cannot be empty if provided.")
                .MinimumLength(2)
                .WithMessage("Module name must be at least 2 characters long.")
                .MaximumLength(100)
                .WithMessage("Module name cannot exceed 100 characters.")
                .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
                .WithMessage("Module name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");
        });

        // Key validation (optional, but if provided must meet constraints)
        When(x => x.UpdateModule?.Key != null, () =>
        {
            RuleFor(x => x.UpdateModule!.Key)
                .NotEmpty()
                .WithMessage("Module key cannot be empty if provided.")
                .MinimumLength(2)
                .WithMessage("Module key must be at least 2 characters long.")
                .MaximumLength(50)
                .WithMessage("Module key cannot exceed 50 characters.")
                .Matches(@"^[a-zA-Z0-9\-_]+$")
                .WithMessage("Module key can only contain letters, numbers, hyphens, and underscores.");
        });

        // Description validation (optional, but if provided must meet constraints)
        When(x => x.UpdateModule?.Description != null, () =>
        {
            RuleFor(x => x.UpdateModule!.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.");
        });
    }
}
