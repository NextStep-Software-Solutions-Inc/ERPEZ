using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.CreateABR;

public class CreateActivityBudgetRequirementCommandValidator : AbstractValidator<CreateActivityBudgetRequirementCommand>
{
    public CreateActivityBudgetRequirementCommandValidator()
    {
        // WFPObjectiveTargetId (Required GUID)
        RuleFor(x => x.WFPObjectiveTargetId)
            .NotEmpty()
            .WithMessage("WFP Objective Target ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective Target ID must be a valid, non-empty GUID.");

        // ObjectId (Required GUID)
        RuleFor(x => x.ObjectId)
            .NotEmpty()
            .WithMessage("Object ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Object ID must be a valid, non-empty GUID.");

        // ItemDescription (Required String, Min/Max Length)
        RuleFor(x => x.ItemDescription)
            .NotEmpty()
            .WithMessage("Item Description is required.")
            .MinimumLength(5)
            .WithMessage("Item Description must be at least 5 characters long.")
            .MaximumLength(500)
            .WithMessage("Item Description cannot exceed 500 characters.");

        // Quantity (Required Integer, Must be Positive)
        RuleFor(x => x.Quantity)
            .NotNull()
            .WithMessage("Quantity is required.")
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than zero (0).");

        // CostEstimates (Required Decimal, Must be Non-Negative)
        RuleFor(x => x.CostEstimates)
            .NotNull()
            .WithMessage("Cost Estimates are required.")
            .GreaterThan(0)
            .WithMessage("Cost Estimates must be non-negative (greater than 0).");
    }
}
