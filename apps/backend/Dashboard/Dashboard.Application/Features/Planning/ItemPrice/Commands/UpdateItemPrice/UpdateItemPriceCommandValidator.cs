using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.UpdateItemPrice;

public class UpdateItemPriceCommandValidator : AbstractValidator<UpdateItemPriceCommand>
{
    public UpdateItemPriceCommandValidator()
    {
        RuleFor(x => x.UpdateItemPrice.ProcurementItemId)
            .NotEmpty()
            .WithMessage("Procurement Item is required.");

        RuleFor(x => x.UpdateItemPrice.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        RuleFor(x => x.UpdateItemPrice.UnitPrice)
            .GreaterThan(0)
            .WithMessage("Unit Price must be greater than 0.")
            .LessThanOrEqualTo(999999999999.99m)
            .WithMessage("Unit Price cannot exceed 999,999,999,999.99.");
    }
}
