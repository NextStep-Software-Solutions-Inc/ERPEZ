using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.CreateKPIModeOfVerification;

public class CreateKPIModeOfVerificationCommandValidator : AbstractValidator<CreateKPIModeOfVerificationCommand>
{
    public CreateKPIModeOfVerificationCommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Verification Mode Name is required.")
            .MinimumLength(3)
            .WithMessage("Verification Mode Name must be at least 3 characters long.")
            .MaximumLength(250)
            .WithMessage("Verification Mode Name cannot exceed 250 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // FileId (Optional GUID, must be valid if provided)
        RuleFor(x => x.FileId)
            .Must(id => id.HasValue && id.Value != Guid.Empty)
            .WithMessage("FileId must be a valid, non-empty GUID.")
            .When(x => x.FileId.HasValue);
    }
}
