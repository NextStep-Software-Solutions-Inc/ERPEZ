using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFPStatus;

/// <summary>
/// Validator for UpdateWFPStatusCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPStatusCommandValidator : AbstractValidator<UpdateWFPStatusCommand>
{
    public UpdateWFPStatusCommandValidator()
    {
        // ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Work and Financial Plan ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Work and Financial Plan ID must be a valid, non-empty GUID.");

        // Status (Required, must be valid enum value)
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => Enum.TryParse<StatusEnum>(status, true, out _))
            .WithMessage($"Status must be one of the following: {string.Join(", ", Enum.GetNames<StatusEnum>())}.");
    }
}
