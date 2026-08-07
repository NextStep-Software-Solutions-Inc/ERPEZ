using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.UpdateWFPObjectiveActivityExpenditure;

public class UpdateWFPObjectiveActivityExpenditureCommandValidator : AbstractValidator<UpdateWFPObjectiveActivityExpenditureCommand>
{
    public UpdateWFPObjectiveActivityExpenditureCommandValidator()
    {
        // Id (Required Primary Key)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Objective Target Activity ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective Target Activity ID must be a valid, non-empty GUID.");

        // ItemDescription (Required String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjectiveActivityExpenditure.ItemDescription)
            .NotEmpty()
            .WithMessage("Item Description is required.")
            .MinimumLength(5)
            .WithMessage("Item Description must be at least 5 characters long.")
            .MaximumLength(500)
            .WithMessage("Item Description cannot exceed 500 characters.");

        // Quantity (Required Integer, Must be Positive)
        RuleFor(x => x.UpdateWFPObjectiveActivityExpenditure.Quantity)
            .NotNull()
            .WithMessage("Quantity is required.")
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than zero (0).");

        // UnitCost (Required Decimal, Must be Non-Negative)
        RuleFor(x => x.UpdateWFPObjectiveActivityExpenditure.UnitCost)
            .NotNull()
            .WithMessage("Cost Estimates are required.")
            .GreaterThanOrEqualTo(0)
            .WithMessage("Cost Estimates must be non-negative (zero or greater).");
    }
}
