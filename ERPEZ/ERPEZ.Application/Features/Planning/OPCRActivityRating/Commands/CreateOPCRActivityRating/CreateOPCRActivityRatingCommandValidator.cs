using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRating;

/// <summary>
/// Validator for CreateOPCRActivityRatingCommand ensuring all user input meets business requirements
/// and enforces strict validation rules for OPCR Activity Rating creation.
/// </summary>
public class CreateOPCRActivityRatingCommandValidator : AbstractValidator<CreateOPCRActivityRatingCommand>
{
    public CreateOPCRActivityRatingCommandValidator()
    {
        // OPCRActivityId (Required GUID)
        RuleFor(x => x.OPCRActivityId)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required and must be a valid, non-empty GUID.");

        // PerformanceMeasureId (Required GUID)
        RuleFor(x => x.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required and must be a valid, non-empty GUID.");

        // ActualAccomplishedValue (Required, must be non-negative)
        RuleFor(x => x.ActualAccomplishedValue)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Actual Accomplished Value must be greater than or equal to 0.");

        // Score (Required, valid range 1-5)
        RuleFor(x => x.Score)
            .InclusiveBetween(1, 5)
            .WithMessage("Score must be between 1 and 5 (inclusive).");

        // Remarks (Optional, but with max length constraint)
        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));

        // Status (Required, must be valid enum value)
        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid OPCR Activity Rating Status (Draft, Submitted, or Returned).");

        // SubmittedDate validation
        RuleFor(x => x.SubmittedDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Submitted Date cannot be in the future.")
            .When(x => x.SubmittedDate.HasValue);

        // SubmittedDate required when Status is Submitted
        RuleFor(x => x.SubmittedDate)
            .NotEmpty()
            .WithMessage("Submitted Date is required when Status is Submitted.")
            .When(x => x.Status == Domain.Enums.OPCRActivityRatingStatus.Submitted);
    }
}
