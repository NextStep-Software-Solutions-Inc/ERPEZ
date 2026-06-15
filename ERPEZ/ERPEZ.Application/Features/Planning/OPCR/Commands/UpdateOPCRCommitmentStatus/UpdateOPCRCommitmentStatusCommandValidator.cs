// UpdateOPCRCommitmentStatusCommandValidator.cs

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRStatus;

public class UpdateOPCRCommitmentStatusCommandValidator
    : AbstractValidator<UpdateOPCRCommitmentStatusCommand>
{
    private static readonly string[] validValues = ["Draft", "Submitted", "Returned", "Approved"];

    public UpdateOPCRCommitmentStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");

        RuleFor(x => x.Request.CommitmentStatus)
            .NotEmpty()
            .WithMessage("Commitment status is required.")
            .Must(s => validValues.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Commitment status must be one of: {string.Join(", ", validValues)}.");
    }
}