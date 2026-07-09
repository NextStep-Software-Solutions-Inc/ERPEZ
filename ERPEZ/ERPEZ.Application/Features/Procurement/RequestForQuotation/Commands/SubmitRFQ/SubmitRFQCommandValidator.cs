using FluentValidation;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.SubmitRFQ;
 
public class SubmitRFQCommandValidator : AbstractValidator<SubmitRFQCommand>
{
    public SubmitRFQCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();
    }
}
