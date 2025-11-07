using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;

public class CreateMFOPAPCommandValidator : AbstractValidator<CreateMFOPAPCommand>
{
    // Updated list of expected MFO/PAP Types
    private readonly string[] ValidTypes = new[]
    {
        "Major Final Output", "Program", "Activity", "Project",
        "SubProject", "LowerLevelOperatingUnit"
    };

    public CreateMFOPAPCommandValidator()
    {
        // ParentId (Optional GUID)
        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(5)
            .WithMessage("Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.");

        // Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MinimumLength(2)
            .WithMessage("Code must be at least 2 characters long.")
            .MaximumLength(30)
            .WithMessage("Code cannot exceed 30 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Code can only contain letters, numbers, hyphens, and underscores.");

        // Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Type is required.")
            .Must(type => ValidTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Type must be one of the following: {string.Join(", ", ValidTypes)}.");
    }
}