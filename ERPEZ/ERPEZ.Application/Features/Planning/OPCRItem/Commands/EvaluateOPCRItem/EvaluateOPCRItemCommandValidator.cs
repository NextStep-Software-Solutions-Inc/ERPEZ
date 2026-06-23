// EvaluateOPCRItemCommandValidator.cs
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.EvaluateOPCRItem;

public class EvaluateOPCRItemCommandValidator
    : AbstractValidator<EvaluateOPCRItemCommand>
{
    public EvaluateOPCRItemCommandValidator()
    {
        RuleFor(x => x.OPCRItemId)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");

        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request body is required.");

        RuleFor(x => x.Request.ActualAccomplishment)
            .MaximumLength(1000)
            .When(x => x.Request.ActualAccomplishment != null)
            .WithMessage("Actual accomplishment cannot exceed 1000 characters.");

        RuleForEach(x => x.Request.Ratings).ChildRules(rating =>
        {
            rating.RuleFor(r => r.FYActiveKPIMeasurementId)
                .NotEmpty()
                .WithMessage("FYActiveKPIMeasurementId is required per rating.");

            rating.RuleFor(r => r.SelfRating)
                .InclusiveBetween(1, 5)
                .WithMessage("Self rating must be between 1 and 5.");
        });
    }
}