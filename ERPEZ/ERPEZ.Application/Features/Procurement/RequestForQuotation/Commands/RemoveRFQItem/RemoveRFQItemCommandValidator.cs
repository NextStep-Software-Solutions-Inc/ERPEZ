using FluentValidation;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.RemoveRFQItem;

public class RemoveRFQItemCommandValidator : AbstractValidator<RemoveRFQItemCommand>
{
    public RemoveRFQItemCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();
        RuleFor(x => x.RFQItemId).NotEmpty();
    }
}
