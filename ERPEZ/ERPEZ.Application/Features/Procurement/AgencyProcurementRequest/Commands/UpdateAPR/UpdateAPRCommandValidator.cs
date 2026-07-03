using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;

public class UpdateAPRCommandValidator : AbstractValidator<UpdateAPRCommand>
{
    public UpdateAPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APR Id is required.");

        RuleFor(x => x.RequestDate)
            .NotEmpty()
            .WithMessage("Request date is required.");

        RuleFor(x => x.AgencyControlNumber)
            .MaximumLength(100)
            .WithMessage("Agency control number must not exceed 100 characters.");

        RuleFor(x => x.AgencyAccountCode)
            .MaximumLength(100)
            .WithMessage("Agency account code must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.ModeOfDelivery)
            .IsInEnum()
            .WithMessage("A valid mode of delivery is required.");

        RuleFor(x => x.InsufficientFundsAction)
            .IsInEnum()
            .WithMessage("A valid insufficient funds action is required.");

        RuleFor(x => x.AdditionalRemarks)
            .MaximumLength(1000)
            .WithMessage("Additional remarks must not exceed 1000 characters.");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Please select at least one line item from the APP.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.APPItemId)
                .NotEmpty()
                .WithMessage("APP item ID is required.");

            item.RuleFor(i => i.QuantityRequested)
                .GreaterThan(0)
                .When(i => i.QuantityRequested.HasValue)
                .WithMessage("Quantity requested must be greater than zero.");

            item.RuleFor(i => i.UnitCost)
                .GreaterThan(0)
                .When(i => i.UnitCost.HasValue)
                .WithMessage("Unit cost must be greater than zero.");
        });
    }
}
