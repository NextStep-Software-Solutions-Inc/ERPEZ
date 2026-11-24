using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.IssueNoticeToProceed;

public class IssueNoticeToProceedCommandValidator : AbstractValidator<IssueNoticeToProceedCommand>
{
    public IssueNoticeToProceedCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notice to Proceed ID is required.");
    }
}
