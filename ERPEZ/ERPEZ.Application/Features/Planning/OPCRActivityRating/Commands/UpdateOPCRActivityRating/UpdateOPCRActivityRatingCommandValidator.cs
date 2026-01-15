using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRActivityRating;

/// <summary>
/// Validator for UpdateOPCRActivityRatingCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateOPCRActivityRatingCommandValidator : AbstractValidator<UpdateOPCRActivityRatingCommand>
{
    public UpdateOPCRActivityRatingCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Rating ID is required and must be a valid, non-empty GUID.");

        // UpdateRating (Required)
        RuleFor(x => x.UpdateRating)
            .NotNull()
            .WithMessage("Update rating data is required.");

        // ActualAccomplishedValue (Optional, but must be non-negative if provided)
        RuleFor(x => x.UpdateRating.ActualAccomplishedValue)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Actual Accomplished Value must be greater than or equal to 0.")
            .When(x => x.UpdateRating.ActualAccomplishedValue.HasValue);

        // Score (Optional, but must be in valid range if provided)
        RuleFor(x => x.UpdateRating.Score)
            .InclusiveBetween(1, 5)
            .WithMessage("Score must be between 1 and 5 (inclusive).")
            .When(x => x.UpdateRating.Score.HasValue);

        // Remarks (Optional, but with max length constraint)
        RuleFor(x => x.UpdateRating.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateRating.Remarks));
    }
}
