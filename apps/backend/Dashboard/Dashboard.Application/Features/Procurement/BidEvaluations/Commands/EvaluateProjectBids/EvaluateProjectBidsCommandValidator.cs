using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;

public class EvaluateProjectBidsCommandValidator : AbstractValidator<EvaluateProjectBidsCommand>
{
    public EvaluateProjectBidsCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.AwardCriterion)
            .NotEmpty().WithMessage("Bid evaluation criterion has not been established for this procurement project.");

        RuleFor(x => x.Request.Bidders)
            .NotEmpty().WithMessage("At least one bidder is required for evaluation.");
    }
}
