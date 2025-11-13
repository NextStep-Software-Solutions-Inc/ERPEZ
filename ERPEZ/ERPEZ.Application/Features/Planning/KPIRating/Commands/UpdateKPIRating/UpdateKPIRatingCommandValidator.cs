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

        // 4. NumericalRating (Required Int, Valid Range)
        RuleFor(x => x.UpdateKPIRating.NumericalRating)
            .NotNull()
            .WithMessage("Numerical Rating is required.")
            .InclusiveBetween(1, 5)
            .WithMessage("Numerical Rating must be between 1 and 5 (inclusive).");

        RuleFor(x => x.UpdateKPIRating.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.");
    }
}
