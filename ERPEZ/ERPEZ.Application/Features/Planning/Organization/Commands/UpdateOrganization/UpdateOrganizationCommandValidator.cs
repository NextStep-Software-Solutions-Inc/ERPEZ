using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;

public class UpdateOrganizationCommandValidator : AbstractValidator<UpdateOrganizationCommand>
{
    // Updated list of expected organization types
    private readonly string[] ValidTypes =
    [
        "Department", "Agency", "OperatingUnitClass", "LowerLevelOperatingUnit"
    ];

    public UpdateOrganizationCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Organization ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Organization ID must be a valid, non-empty GUID.");

        // 2. ParentId (Optional GUID)
        RuleFor(x => x.UpdateOrganization.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateOrganization.ParentId.HasValue);

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateOrganization.Name)
            .NotEmpty()
            .WithMessage("Organization Name is required.")
            .MinimumLength(3)
            .WithMessage("Organization Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Organization Name cannot exceed 150 characters.");

        // 4. Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.UpdateOrganization.Code)
            .NotEmpty()
            .WithMessage("Organization Code is required.")
            .MinimumLength(2)
            .WithMessage("Organization Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Organization Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Organization Code can only contain letters, numbers, hyphens, and underscores.");

        // 5. Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.UpdateOrganization.Type)
            .NotEmpty()
            .WithMessage("Organization Type is required.")
            .Must(type => ValidTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Organization Type must be one of the following: {string.Join(", ", ValidTypes)}.");

        // 6. Self-Parenting Check (Cannot be its own parent)
        RuleFor(x => x.UpdateOrganization.ParentId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateOrganization.ParentId.HasValue)
            .WithMessage("An Organization cannot be its own parent.");
    }
}