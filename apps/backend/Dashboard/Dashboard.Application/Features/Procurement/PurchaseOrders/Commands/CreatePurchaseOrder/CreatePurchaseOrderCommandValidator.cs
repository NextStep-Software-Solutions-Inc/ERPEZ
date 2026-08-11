using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.PONumber)
            .NotEmpty().WithMessage("PO Number is required.");

        RuleFor(x => x.SourceDocumentId)
            .NotEmpty().WithMessage("Source Document ID is required.");

        RuleFor(x => x.SupplierId)
            .NotEmpty().WithMessage("Supplier ID is required.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(x => x.ProcurementMode)
            .IsInEnum().WithMessage("Invalid Procurement Mode.");

        RuleFor(x => x.SourceDocumentType)
            .IsInEnum().WithMessage("Invalid Source Document Type.");
            
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one PO item is required.");
    }
}
