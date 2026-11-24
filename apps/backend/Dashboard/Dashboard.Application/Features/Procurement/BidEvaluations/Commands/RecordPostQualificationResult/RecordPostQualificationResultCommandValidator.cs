using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;

public class RecordPostQualificationResultCommandValidator : AbstractValidator<RecordPostQualificationResultCommand>
{
    public RecordPostQualificationResultCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.BiddingEvaluatedBidId)
            .NotEmpty().WithMessage("Evaluated bid ID is required.");
    }
}
