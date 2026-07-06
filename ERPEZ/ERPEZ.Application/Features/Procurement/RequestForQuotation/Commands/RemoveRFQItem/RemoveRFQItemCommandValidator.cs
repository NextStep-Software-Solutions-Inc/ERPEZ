using ERPEZ.Shared.Common;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.RemoveRFQItem;

public class RemoveRFQItemCommandValidator : AbstractValidator<RemoveRFQItemCommand>
{
    public RemoveRFQItemCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();
        RuleFor(x => x.RFQItemId).NotEmpty();
    }
}
