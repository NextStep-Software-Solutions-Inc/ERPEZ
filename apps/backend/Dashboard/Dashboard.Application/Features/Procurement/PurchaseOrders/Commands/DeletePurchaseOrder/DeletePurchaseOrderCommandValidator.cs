using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.DeletePurchaseOrder;

public class DeletePurchaseOrderCommandValidator : AbstractValidator<DeletePurchaseOrderCommand>
{
    public DeletePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Purchase Order ID is required.");
    }
}
