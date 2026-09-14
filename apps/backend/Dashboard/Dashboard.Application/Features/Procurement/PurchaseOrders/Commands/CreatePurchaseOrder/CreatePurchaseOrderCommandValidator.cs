using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.SourceDocumentId)
            .NotEmpty().WithMessage("Source Document ID is required.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(x => x.ProcurementMode)
            .IsInEnum().WithMessage("Invalid Procurement Mode.");

        RuleFor(x => x.SourceDocumentType)
            .IsInEnum().WithMessage("Invalid Source Document Type.");

        When(x => x.ProcurementMode == Domain.Enums.POProcurementModeEnum.DIRECT_ACQUISITION, () =>
        {
            RuleFor(x => x)
                .Must(x => (x.SupplierId.HasValue && x.SupplierId.Value != Guid.Empty) ||
                           (x.RetailStoreInfo != null && !string.IsNullOrWhiteSpace(x.RetailStoreInfo.Name)))
                .WithMessage("Either an existing Supplier or a Retail Store Name is required for Direct Acquisition.");
        });
    }
}
