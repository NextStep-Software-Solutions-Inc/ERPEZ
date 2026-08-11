using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRatingsBatch;

/// <summary>
/// Validator for CreateOPCRActivityRatingsBatchCommand ensuring all batch input meets business requirements.
/// </summary>
public class CreateOPCRActivityRatingsBatchCommandValidator : AbstractValidator<CreateOPCRActivityRatingsBatchCommand>
{
    public CreateOPCRActivityRatingsBatchCommandValidator()
    {
        // OPCRActivityId (Required GUID)
        RuleFor(x => x.OPCRActivityId)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required and must be a valid, non-empty GUID.");

        // ActualAccomplishedValue (Required, must be non-negative)
        RuleFor(x => x.ActualAccomplishedValue)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Actual Accomplished Value must be greater than or equal to 0.");

        // Ratings list (Required, not empty)
        RuleFor(x => x.Ratings)
            .NotNull()
            .WithMessage("Ratings list is required.")
            .NotEmpty()
            .WithMessage("At least one rating must be provided.");

        // Validate each rating item
        RuleForEach(x => x.Ratings)
            .ChildRules(rating =>
            {
                rating.RuleFor(r => r.PerformanceMeasureId)
                    .NotEmpty()
                    .WithMessage("Performance Measure ID is required for each rating.");

                rating.RuleFor(r => r.Score)
                    .InclusiveBetween(1, 5)
                    .WithMessage("Score must be between 1 and 5 (inclusive).");

                rating.RuleFor(r => r.Remarks)
                    .MaximumLength(1000)
                    .WithMessage("Remarks cannot exceed 1000 characters.")
                    .When(r => !string.IsNullOrWhiteSpace(r.Remarks));
            });

        // Check for duplicate PerformanceMeasureIds within the batch
        RuleFor(x => x.Ratings)
            .Must(ratings => ratings.Select(r => r.PerformanceMeasureId).Distinct().Count() == ratings.Count)
            .WithMessage("Duplicate Performance Measure IDs found in the batch.")
            .When(x => x.Ratings != null && x.Ratings.Any());
    }
}