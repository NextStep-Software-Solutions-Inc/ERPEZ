using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRStatus;

public class UpdateOPCRStatusCommandValidator : AbstractValidator<UpdateOPCRStatusCommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();
    public UpdateOPCRStatusCommandValidator()
    {
        
        // OPCR ID validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required for status update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");

        // Status validation
        RuleFor(x => x.UpdateOPCRStatus.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.");
    }
}