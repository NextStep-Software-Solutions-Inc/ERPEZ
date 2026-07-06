using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.AddRFQItems;

public class AddRFQItemsCommandValidator : AbstractValidator<AddRFQItemsCommand>
{
    public AddRFQItemsCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty();
 
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.CPRItemId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}
