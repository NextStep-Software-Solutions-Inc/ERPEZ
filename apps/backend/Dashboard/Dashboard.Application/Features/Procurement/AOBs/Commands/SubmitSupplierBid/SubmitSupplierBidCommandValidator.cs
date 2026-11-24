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

        RuleFor(x => x.SignatoryName)
            .MaximumLength(200)
            .WithMessage("Signatory name must not exceed 200 characters.");

        RuleFor(x => x.QuotationDocumentUrl)
            .MaximumLength(2048)
            .WithMessage("Quotation document URL must not exceed 2048 characters.");

        RuleFor(x => x.SignatureUrl)
            .MaximumLength(500_000)
            .WithMessage("Signature URL or data URI must not exceed 500,000 characters.");
    }
}
