using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;

public class UpdateMFOPAPCommandValidator : AbstractValidator<UpdateMFOPAPCommand>
{
    // Updated list of expected MFO/PAP Types
    private readonly string[] validTypes = new[]
    {
        "Major Final Output", "Program", "Activity", "Project",
        "SubProject", "LowerLevelOperatingUnit"
    };

    public UpdateMFOPAPCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MFO/PAP ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("MFO/PAP ID must be a valid, non-empty GUID.");

        // 2. ParentId (Optional GUID)
        RuleFor(x => x.UpdateMFOPAP.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateMFOPAP.ParentId.HasValue);

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateMFOPAP.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(5)
            .WithMessage("Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.");

        // 4. Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.UpdateMFOPAP.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MinimumLength(2)
            .WithMessage("Code must be at least 2 characters long.")
            .MaximumLength(30)
            .WithMessage("Code cannot exceed 30 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Code can only contain letters, numbers, hyphens, and underscores.");

        // 5. Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.UpdateMFOPAP.Type)
            .NotEmpty()
            .WithMessage("Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Type must be one of the following: {string.Join(", ", validTypes)}.");

        // 6. Self-Parenting Check (Cannot be its own parent)
        RuleFor(x => x.UpdateMFOPAP.ParentId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateMFOPAP.ParentId.HasValue)
            .WithMessage("An MFO/PAP cannot be its own parent.");
    }
}
