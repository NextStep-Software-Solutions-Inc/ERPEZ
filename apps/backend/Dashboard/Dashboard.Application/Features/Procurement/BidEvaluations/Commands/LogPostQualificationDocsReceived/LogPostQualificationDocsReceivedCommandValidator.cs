using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;

public class LogPostQualificationDocsReceivedCommandValidator : AbstractValidator<LogPostQualificationDocsReceivedCommand>
{
    public LogPostQualificationDocsReceivedCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.BiddingEvaluatedBidId)
            .NotEmpty().WithMessage("Evaluated bid ID is required.");
    }
}
