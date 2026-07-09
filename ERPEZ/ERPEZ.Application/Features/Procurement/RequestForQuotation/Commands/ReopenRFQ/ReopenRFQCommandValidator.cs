using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ReopenRFQ;

public class ReopenRFQCommandValidator : AbstractValidator<ReopenRFQCommand>
{
    public ReopenRFQCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();
    }
}
