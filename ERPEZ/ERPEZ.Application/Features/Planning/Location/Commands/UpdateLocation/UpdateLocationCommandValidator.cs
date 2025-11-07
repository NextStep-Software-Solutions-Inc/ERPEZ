using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;

public class UpdateLocationCommandValidator : AbstractValidator<UpdateLocationCommand>
{
    private readonly string[] ValidTypes =
    [
        "Region", "Province", "City", "Municipality", "Barangay"
    ];

    public UpdateLocationCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Location ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Location ID must be a valid, non-empty GUID.");

        // 2. ParentId (Optional GUID)
        RuleFor(x => x.UpdateLocation.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateLocation.ParentId.HasValue);

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateLocation.Name)
            .NotEmpty()
            .WithMessage("Location Name is required.")
            .MinimumLength(2)
            .WithMessage("Location Name must be at least 2 characters long.")
            .MaximumLength(150)
            .WithMessage("Location Name cannot exceed 150 characters.");

        // 4. Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.UpdateLocation.Code)
            .NotEmpty()
            .WithMessage("Location Code is required.")
            .MinimumLength(1)
            .WithMessage("Location Code must be at least 1 character long.")
            .MaximumLength(20)
            .WithMessage("Location Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Location Code can only contain letters, numbers, hyphens, and underscores.");

        // 5. Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.UpdateLocation.Type)
            .NotEmpty()
            .WithMessage("Location Type is required.")
            .Must(type => ValidTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Location Type must be one of the following: {string.Join(", ", ValidTypes)}.");

        // 6. Self-Parenting Check (Cannot be its own parent)
        RuleFor(x => x.UpdateLocation.ParentId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateLocation.ParentId.HasValue)
            .WithMessage("A Location cannot be its own parent.");
    }
}