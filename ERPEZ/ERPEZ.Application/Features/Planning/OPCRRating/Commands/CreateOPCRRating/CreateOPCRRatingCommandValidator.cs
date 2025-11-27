using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommandValidator : AbstractValidator<CreateOPCRRatingCommand>
{
    public CreateOPCRRatingCommandValidator()
    {
        RuleFor(x => x.OPCREvaluationId)
            .NotEmpty()
            .WithMessage("OPCR Evaluation ID is required.");

        RuleFor(x => x.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required.");

        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required.");

        RuleFor(x => x.DUKPIAssignmentId)
            .NotEmpty()
            .WithMessage("DU KPI Assignment ID is required.");

        RuleFor(x => x.NumericalRating)
            .InclusiveBetween(1, 5)
            .WithMessage("Numerical Rating must be between 1 and 5.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}
