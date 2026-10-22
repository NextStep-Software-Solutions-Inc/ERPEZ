using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;

public class CreateBiddingAwardRecommendationCommandValidator : AbstractValidator<CreateBiddingAwardRecommendationCommand>
{
    public CreateBiddingAwardRecommendationCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.BiddingPostQualificationId)
            .NotEmpty().WithMessage("Post-qualification ID is required.");
    }
}
