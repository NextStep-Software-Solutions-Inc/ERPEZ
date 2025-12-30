using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.BulkCreateWFPObjectiveTargetExpenditure;

/// <summary>
/// Validator for BulkCreateWFPObjectiveTargetExpenditureCommand ensuring all expenditure items meet business requirements.
/// </summary>
public class BulkCreateWFPObjectiveTargetExpenditureCommandValidator : AbstractValidator<BulkCreateWFPObjectiveTargetExpenditureCommand>
{
    public BulkCreateWFPObjectiveTargetExpenditureCommandValidator()
    {
        // WFPObjectiveTargetId (Required GUID)
        RuleFor(x => x.WFPObjectiveTargetId)
            .NotEmpty()
            .WithMessage("WFP Objective Target ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective Target ID must be a valid, non-empty GUID.");

        // Expenditures (Required List, At least one item)
        RuleFor(x => x.Expenditures)
            .NotNull()
            .WithMessage("Expenditures list is required.")
            .NotEmpty()
            .WithMessage("At least one expenditure item is required.");

        // Validate each expenditure item
        RuleForEach(x => x.Expenditures)
            .SetValidator(new CreateWFPObjectiveTargetExpenditureRequestValidator());
    }
}

public class CreateWFPObjectiveTargetExpenditureRequestValidator : AbstractValidator<ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos.CreateWFPObjectiveTargetExpenditureRequest>
{
    public CreateWFPObjectiveTargetExpenditureRequestValidator()
    {
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
            .WithMessage("Quantity must be greater than zero.");

        // CostEstimates (Required Decimal, Must be Positive)
        RuleFor(x => x.CostEstimates)
            .NotNull()
            .WithMessage("Cost Estimates are required.")
            .GreaterThan(0)
            .WithMessage("Cost Estimates must be greater than zero.");
    }
}
