using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;

public class DeleteMFOPAPCommandValidator : AbstractValidator<DeleteMFOPAPCommand>
{
    public DeleteMFOPAPCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MFO/PAP ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("MFO/PAP ID must be a valid, non-empty GUID.");
    }
}