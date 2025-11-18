using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.DeleteKPIModeOfVerification;

public class DeleteKPIModeOfVerificationCommandValidator : AbstractValidator<DeleteKPIModeOfVerificationCommand>
{
    public DeleteKPIModeOfVerificationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Verification Mode ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Verification Mode ID must be a valid, non-empty GUID.");
    }
}
