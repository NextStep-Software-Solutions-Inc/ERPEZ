using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;

public class EvaluateProjectBidsCommandValidator : AbstractValidator<EvaluateProjectBidsCommand>
{
    public EvaluateProjectBidsCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.AwardCriterion)
            .Must(c => string.Equals(c, "LCRB", System.StringComparison.OrdinalIgnoreCase) || 
                       string.Equals(c, "MEARB", System.StringComparison.OrdinalIgnoreCase))
            .WithMessage("Award criterion must be either 'LCRB' or 'MEARB'.");

        RuleFor(x => x.Request.Bidders)
            .NotEmpty().WithMessage("At least one bidder is required for evaluation.");
    }
}
