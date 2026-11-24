using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.CreateAPR;

public class CreateAPRCommandValidator : AbstractValidator<CreateAPRCommand>
{
    public CreateAPRCommandValidator()
    {
        RuleFor(x => x.APPId).NotEmpty();
        RuleFor(x => x.OfficeId).NotEmpty();
        RuleFor(x => x.FiscalYearId).NotEmpty();
        RuleFor(x => x.RequestDate).NotEmpty();

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Please select at least one line item from the APP."); // Image 4/5 error text

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.APPItemId).NotEmpty();
            item.RuleFor(i => i.QuantityRequested)
                .GreaterThan(0)
                .When(i => i.QuantityRequested.HasValue);
            item.RuleFor(i => i.UnitCost)
                .GreaterThan(0)
                .When(i => i.UnitCost.HasValue);
        });
    }
}
