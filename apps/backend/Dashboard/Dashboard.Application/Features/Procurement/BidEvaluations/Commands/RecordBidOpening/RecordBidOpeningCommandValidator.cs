using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;

public class RecordBidOpeningCommandValidator : AbstractValidator<RecordBidOpeningCommand>
{
    public RecordBidOpeningCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.BiddingSubmissionId)
            .NotEmpty().WithMessage("Bidding submission ID is required.");

        RuleFor(x => x.Request.Envelope1Result)
            .NotEmpty().WithMessage("Envelope 1 result is required.");
    }
}
