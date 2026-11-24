using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.LinkRFQs;

public class LinkRFQsCommandValidator : AbstractValidator<LinkRFQsCommand>
{
    public LinkRFQsCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty()
            .WithMessage("AOB ID is required.");

        RuleFor(x => x.RFQIds)
            .NotEmpty()
            .WithMessage("At least one RFQ ID must be provided.");
    }
}
