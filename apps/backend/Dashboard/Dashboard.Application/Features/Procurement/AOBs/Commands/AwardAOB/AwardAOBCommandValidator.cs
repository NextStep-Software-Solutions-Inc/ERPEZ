using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;

public class AwardAOBCommandValidator : AbstractValidator<AwardAOBCommand>
{
    public AwardAOBCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty()
            .WithMessage("AOB ID is required.");

        RuleFor(x => x.AwardedItems)
            .NotEmpty()
            .WithMessage("At least one awarded item must be specified.");

        RuleForEach(x => x.AwardedItems).ChildRules(item =>
        {
            item.RuleFor(i => i.RFQItemId)
                .NotEmpty()
                .WithMessage("RFQ Item ID is required.");

            item.RuleFor(i => i.WinningSupplierId)
                .NotEmpty()
                .WithMessage("Winning Supplier ID is required.");

            item.RuleFor(i => i.AwardedUnitPrice)
                .GreaterThan(0)
                .WithMessage("Awarded unit price must be greater than zero.");
        });
    }
}
