using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;

public class UpdateFunctionPercentageAllocationCommandValidator : AbstractValidator<UpdateFunctionPercentageAllocationCommand>
{
    private readonly string[] ValidFunctionTypes = ["Core Function", "Strategic", "Priority", "Mandatory Support"];

    public UpdateFunctionPercentageAllocationCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Function Percentage Allocation ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Function Percentage Allocation ID must be a valid, non-empty GUID.");

        // 2. FunctionType (Required String, Valid Value)
        RuleFor(x => x.UpdateFPA.FunctionType)
            .NotEmpty()
            .WithMessage("Function Type is required.")
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", ValidFunctionTypes)}.");

        // 3. Description (Optional String, Max Length)
        RuleFor(x => x.UpdateFPA.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateFPA.Description));

        // 4. Percentage (Required Decimal, Valid Range)
        RuleFor(x => x.UpdateFPA.Percentage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Percentage must be a non-negative value.")
            .LessThanOrEqualTo(100)
            .WithMessage("Percentage cannot exceed 100.");
    }
}