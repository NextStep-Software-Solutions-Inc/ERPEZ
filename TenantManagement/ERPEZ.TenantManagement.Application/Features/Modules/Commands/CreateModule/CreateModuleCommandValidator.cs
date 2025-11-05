using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;

/// <summary>
/// Validator for CreateModuleCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateModuleCommandValidator : AbstractValidator<CreateModuleCommand>
{
    public CreateModuleCommandValidator()
    {
        // Name validation
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Module name is required.")
            .MinimumLength(2)
            .WithMessage("Module name must be at least 2 characters long.")
            .MaximumLength(100)
            .WithMessage("Module name cannot exceed 100 characters.")
            .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
            .WithMessage("Module name can only contain letters, numbers, spaces, hyphens, underscores, and periods.");

        // Key validation
        RuleFor(x => x.Key)
            .NotEmpty()
            .WithMessage("Module key is required.")
            .MinimumLength(2)
            .WithMessage("Module key must be at least 2 characters long.")
            .MaximumLength(50)
            .WithMessage("Module key cannot exceed 50 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Module key can only contain letters, numbers, hyphens, and underscores.");

        // Description validation (optional, but if provided must meet constraints)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}
