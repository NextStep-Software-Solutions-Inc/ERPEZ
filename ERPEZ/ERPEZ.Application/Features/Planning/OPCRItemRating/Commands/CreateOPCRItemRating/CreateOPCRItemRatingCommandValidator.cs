using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.CreateOPCRItemRating;

public class CreateOPCRItemRatingCommandValidator : AbstractValidator<CreateOPCRItemRatingCommand>
{
    public CreateOPCRItemRatingCommandValidator()
    {
        RuleFor(x => x.OPCRItemId)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");

        RuleFor(x => x.FYActiveKPIMeasurementId)
            .NotEmpty()
            .WithMessage("FY Active KPI Measurement ID is required.");

        RuleFor(x => x.SelfRating)
            .InclusiveBetween(0, 5)
            .WithMessage("Self Rating must be between 0 and 5.")
            .When(x => x.SelfRating.HasValue);
    }
}