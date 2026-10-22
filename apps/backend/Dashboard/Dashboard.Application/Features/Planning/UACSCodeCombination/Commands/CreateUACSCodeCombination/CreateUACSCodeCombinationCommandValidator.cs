using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Commands.CreateUACSCodeCombination;

/// <summary>
/// Validator for CreateUACSCodeCombinationCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateUACSCodeCombinationCommandValidator : AbstractValidator<CreateUACSCodeCombinationCommand>
{
    public CreateUACSCodeCombinationCommandValidator()
    {
        RuleFor(x => x.CombinationCode)
            .NotEmpty()
            .WithMessage("Combination code is required.")
            .MinimumLength(10)
            .WithMessage("Combination code must be at least 10 characters.")
            .MaximumLength(100)
            .WithMessage("Combination code cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters.")
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.EffectiveDate)
            .NotEmpty()
            .WithMessage("Effective date is required.");

        RuleFor(x => x.ExpiryDate)
            .GreaterThan(x => x.EffectiveDate)
            .WithMessage("Expiry date must be greater than effective date.")
            .When(x => x.ExpiryDate.HasValue);

        RuleFor(x => x)
            .Must(x => x.FundSourceId.HasValue || x.OrganizationId.HasValue || x.LocationId.HasValue || x.MFOPAPId.HasValue || x.ObjectId.HasValue)
            .WithMessage("At least one of FundSourceId, OrganizationId, LocationId, MFOPAPId, or ObjectId must be provided.");
    }
}
