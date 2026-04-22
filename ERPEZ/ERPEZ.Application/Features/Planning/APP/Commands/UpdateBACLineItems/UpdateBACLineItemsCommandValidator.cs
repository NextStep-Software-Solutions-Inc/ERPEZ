using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;

public class UpdateBACLineItemsCommandValidator : AbstractValidator<UpdateBACLineItemsCommand>
{
    public UpdateBACLineItemsCommandValidator()
    {
        RuleFor(x => x.AppId)
            .NotEmpty().WithMessage("App ID is required.");

        RuleFor(x => x.LineItems)
            .NotNull().WithMessage("Line items are required.")
            .NotEmpty().WithMessage("At least one line item must be provided.");

        RuleForEach(x => x.LineItems).ChildRules(item =>
        {
            item.RuleFor(x => x.BACItemCode)
                .NotEmpty().WithMessage("BACItemCode is required.");

            item.RuleFor(x => x.ModeOfProcurementId)
                .NotEmpty().WithMessage("ModeOfProcurementId is required.");

            item.RuleForEach(x => x.Schedules).ChildRules(schedule =>
            {
                schedule.RuleFor(x => x.ProcurementActivityTypeId)
                    .NotEmpty().WithMessage("ProcurementActivityTypeId is required.");
            });
        });
    }
}
