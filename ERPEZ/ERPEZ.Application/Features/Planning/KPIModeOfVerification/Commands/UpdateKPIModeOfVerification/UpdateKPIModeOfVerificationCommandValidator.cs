using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;

public class UpdateKPIModeOfVerificationCommandValidator : AbstractValidator<UpdateKPIModeOfVerificationCommand>
{
    public UpdateKPIModeOfVerificationCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Verification Mode ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Verification Mode ID must be a valid, non-empty GUID.");

        // 2. KPIId (Required GUID)
        RuleFor(x => x.UpdateKPIModeOfVerification.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateKPIModeOfVerification.Name)
            .NotEmpty()
            .WithMessage("Verification Mode Name is required.")
            .MinimumLength(3)
            .WithMessage("Verification Mode Name must be at least 3 characters long.")
            .MaximumLength(250)
            .WithMessage("Verification Mode Name cannot exceed 250 characters.");

        // 4. Description (Optional String, Max Length)
        RuleFor(x => x.UpdateKPIModeOfVerification.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPIModeOfVerification.Description));
    }
}