using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Location.Commands.CreateLocation;

public class CreateLocationCommandValidator : AbstractValidator<CreateLocationCommand>
{
    // Define a list of expected location types (e.g., Region, Province, City, etc.)
    private readonly string[] validTypes =
    [
        "Region", "Province", "City", "Municipality", "Barangay"
    ];

    public CreateLocationCommandValidator()
    {
        // ParentId (Optional GUID)
        // If ParentId is provided, it must be a valid, non-empty GUID.
        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Location Name is required.")
            .MinimumLength(2)
            .WithMessage("Location Name must be at least 2 characters long.")
            .MaximumLength(150)
            .WithMessage("Location Name cannot exceed 150 characters.");

        // Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Location Code is required.")
            .MinimumLength(1)
            .WithMessage("Location Code must be at least 1 character long.")
            .MaximumLength(20)
            .WithMessage("Location Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Location Code can only contain letters, numbers, hyphens, and underscores.");

        // Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Location Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Location Type must be one of the following: {string.Join(", ", validTypes)}.");
    }
}