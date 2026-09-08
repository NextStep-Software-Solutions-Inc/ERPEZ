using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;

public class SendPostQualificationNoticeCommandValidator : AbstractValidator<SendPostQualificationNoticeCommand>
{
    public SendPostQualificationNoticeCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.BiddingEvaluatedBidId)
            .NotEmpty().WithMessage("Evaluated bid ID is required.");
    }
}
