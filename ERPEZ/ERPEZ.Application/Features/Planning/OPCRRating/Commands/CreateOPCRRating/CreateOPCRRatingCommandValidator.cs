using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommandValidator : AbstractValidator<CreateOPCRRatingCommand>
{
    public CreateOPCRRatingCommandValidator()
    {
        // OPCREvaluationId (Required GUID)
        RuleFor(x => x.OPCREvaluationId)
            .NotEmpty()
            .WithMessage("OPCR Evaluation ID is required.");

        // PerformanceMeasureId (Required GUID)
        RuleFor(x => x.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required.");

        // OPCRKPIId (Required GUID)
        RuleFor(x => x.OPCRKPIId)
            .NotEmpty()
            .WithMessage("OPCR KPI ID is required.");

        // NumericalRating (Required Int, Range Check)
        RuleFor(x => x.NumericalRating)
            .InclusiveBetween(1, 5) // Assuming a standard 1-5 rating scale
            .WithMessage("Numerical Rating must be between 1 and 5.");

        // Remarks (Optional String, Max Length)
        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Remarks));
    }
}