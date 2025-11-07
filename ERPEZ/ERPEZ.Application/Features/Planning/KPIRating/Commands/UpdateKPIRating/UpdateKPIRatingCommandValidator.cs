using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;

public class UpdateKPIRatingCommandValidator : AbstractValidator<UpdateKPIRatingCommand>
{
    public UpdateKPIRatingCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Rating ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Rating ID must be a valid, non-empty GUID.");

        // 2. KPIId (Required GUID)
        RuleFor(x => x.UpdateKPIRating.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // 3. PerformanceMeasureId (Required GUID)
        RuleFor(x => x.UpdateKPIRating.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required and must be a valid, non-empty GUID.");

        // 4. NumericalRating (Required Int, Valid Range)
        RuleFor(x => x.UpdateKPIRating.NumericalRating)
            .NotEmpty()
            .WithMessage("Numerical Rating is required.")
            .InclusiveBetween(1, 5) // Assuming a standard 1 to 5 rating scale
            .WithMessage("Numerical Rating must be between 1 and 5 (inclusive).");

        // 5. Remarks (Required String, Max Length)
        RuleFor(x => x.UpdateKPIRating.Remarks)
            .NotEmpty()
            .WithMessage("Remarks are required for the KPI rating.")
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.");
    }
}