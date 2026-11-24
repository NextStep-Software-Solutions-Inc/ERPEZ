using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.CreateOrganization;

public class CreateOrganizationCommandValidator : AbstractValidator<CreateOrganizationCommand>
{
    // Updated list of expected organization types
    private readonly string[] validTypes =
    [
        "Department", "Agency", "OperatingUnitClass", "LowerLevelOperatingUnit"
    ];

    public CreateOrganizationCommandValidator()
    {
        // ParentId (Optional GUID)
        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Organization Name is required.")
            .MinimumLength(3)
            .WithMessage("Organization Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Organization Name cannot exceed 150 characters.");

        // Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Organization Code is required.")
            .MinimumLength(2)
            .WithMessage("Organization Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Organization Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Organization Code can only contain letters, numbers, hyphens, and underscores.");

        // Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Organization Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Organization Type must be one of the following: {string.Join(", ", validTypes)}.");

        // FiscalYearId (Optional GUID)
        RuleFor(x => x.FiscalYearId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Fiscal Year ID must be a valid, non-empty GUID.")
            .When(x => x.FiscalYearId.HasValue);
    }
}
