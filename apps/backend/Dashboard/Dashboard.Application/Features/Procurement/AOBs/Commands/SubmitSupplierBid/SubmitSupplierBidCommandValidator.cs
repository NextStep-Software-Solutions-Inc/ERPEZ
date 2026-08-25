using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;

public class SubmitSupplierBidCommandValidator : AbstractValidator<SubmitSupplierBidCommand>
{
    public SubmitSupplierBidCommandValidator()
    {
        RuleFor(x => x.RFQId)
            .NotEmpty()
            .WithMessage("RFQ ID is required.");

        RuleFor(x => x.SupplierId)
            .NotEmpty()
            .WithMessage("Supplier ID is required.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => status.ToUpperInvariant() == "DRAFT" || status.ToUpperInvariant() == "SUBMITTED")
            .WithMessage("Status must be either 'DRAFT' or 'SUBMITTED'.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.RFQItemId)
                .NotEmpty()
                .WithMessage("RFQ Item ID is required for bid items.");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThan(0)
                .WithMessage("Unit price must be greater than zero.");
        });
    }
}
