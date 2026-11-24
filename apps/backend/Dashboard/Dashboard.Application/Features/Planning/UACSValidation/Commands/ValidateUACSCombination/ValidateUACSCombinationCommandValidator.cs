using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSValidation.Commands.ValidateUACSCombination;

/// <summary>
/// Validator for ValidateUACSCombinationCommand ensuring all element IDs are valid.
/// </summary>
public class ValidateUACSCombinationCommandValidator : AbstractValidator<ValidateUACSCombinationCommand>
{
    public ValidateUACSCombinationCommandValidator()
    {
        RuleFor(x => x.FundSourceId)
            .NotEmpty()
            .WithMessage("FundSource ID is required.");

        RuleFor(x => x.OrganizationId)
            .NotEmpty()
            .WithMessage("Organization ID is required.");

        RuleFor(x => x.LocationId)
            .NotEmpty()
            .WithMessage("Location ID is required.");

        RuleFor(x => x.MFOPAPId)
            .NotEmpty()
            .WithMessage("MFOPAP ID is required.");

        RuleFor(x => x.ObjectId)
            .NotEmpty()
            .WithMessage("Object ID is required.");
    }
}
