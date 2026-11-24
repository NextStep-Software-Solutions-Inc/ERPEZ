using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.UpdateUACSCodeCombination;

/// <summary>
/// Validator for UpdateUACSCodeCombinationCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateUACSCodeCombinationCommandValidator : AbstractValidator<UpdateUACSCodeCombinationCommand>
{
    public UpdateUACSCodeCombinationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UACS code combination ID is required.");

        RuleFor(x => x.UpdateUACSCodeCombination.CombinationCode)
            .NotEmpty()
            .WithMessage("Combination code is required.")
            .MinimumLength(10)
            .WithMessage("Combination code must be at least 10 characters.")
            .MaximumLength(100)
            .WithMessage("Combination code cannot exceed 100 characters.");

        RuleFor(x => x.UpdateUACSCodeCombination.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters.")
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.UpdateUACSCodeCombination.EffectiveDate)
            .NotEmpty()
            .WithMessage("Effective date is required.");

        RuleFor(x => x.UpdateUACSCodeCombination.ExpiryDate)
            .GreaterThan(x => x.UpdateUACSCodeCombination.EffectiveDate)
            .WithMessage("Expiry date must be greater than effective date.")
            .When(x => x.UpdateUACSCodeCombination.ExpiryDate.HasValue);

        RuleFor(x => x.UpdateUACSCodeCombination)
            .Must(x => x.FundSourceId.HasValue || x.OrganizationId.HasValue || x.LocationId.HasValue || x.MFOPAPId.HasValue || x.ObjectId.HasValue)
            .WithMessage("At least one of FundSourceId, OrganizationId, LocationId, MFOPAPId, or ObjectId must be provided.");
    }
}
