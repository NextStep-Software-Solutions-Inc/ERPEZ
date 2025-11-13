using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.CreateKPIRating;

public class CreateKPIRatingCommandValidator : AbstractValidator<CreateKPIRatingCommand>
{
    public CreateKPIRatingCommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // PerformanceMeasureId (Required GUID)
        RuleFor(x => x.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required and must be a valid, non-empty GUID.");

        // NumericalRating (Required Int, Valid Range)
        RuleFor(x => x.NumericalRating)
            .NotEmpty()
            .WithMessage("Numerical Rating is required.")
            .InclusiveBetween(1, 5)
            .WithMessage("Numerical Rating must be between 1 and 5 (inclusive).");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.");
    }
}
