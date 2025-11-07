using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommandValidator : AbstractValidator<CreateFunctionPercentageAllocationCommand>
{
    // Define a list of expected function types (e.g., standard categories)
    private readonly string[] ValidFunctionTypes = ["Core Function", "Strategic", "Priority", "Mandatory Support"];

    public CreateFunctionPercentageAllocationCommandValidator()
    {
        // 1. FunctionType (Required String, Valid Value)
        RuleFor(x => x.FunctionType)
            .NotEmpty()
            .WithMessage("Function Type is required.")
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", ValidFunctionTypes)}.");

        // 2. Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // 3. Percentage (Required Decimal, Valid Range)
        RuleFor(x => x.Percentage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Percentage must be a non-negative value.")
            .LessThanOrEqualTo(100)
            .WithMessage("Percentage cannot exceed 100.");
    }
}