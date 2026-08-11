using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;

/// <summary>
/// Validator for UpdateOPCRRatingStatusCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateOPCRRatingStatusCommandValidator : AbstractValidator<UpdateOPCRRatingStatusCommand>
{
    public UpdateOPCRRatingStatusCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required and must be a valid, non-empty GUID.");

        // UpdateStatus (Required)
        RuleFor(x => x.UpdateStatus)
            .NotNull()
            .WithMessage("Update status data is required.");

        // Status (Required, must be valid enum value)
        RuleFor(x => x.UpdateStatus.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid OPCR Rating Status (Draft, Submitted, or Returned).");
    }
}
