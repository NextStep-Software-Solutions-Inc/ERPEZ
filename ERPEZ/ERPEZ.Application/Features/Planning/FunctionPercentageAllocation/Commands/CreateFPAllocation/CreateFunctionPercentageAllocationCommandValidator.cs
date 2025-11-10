using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using FluentValidation;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommandValidator : AbstractValidator<CreateFunctionPercentageAllocationCommand>
{

    public CreateFunctionPercentageAllocationCommandValidator()
    {
        RuleFor(x => x.FunctionPercentageAllocationsRequests)
            .NotEmpty()
            .NotNull()
            .WithMessage("Atleast one Function Percentage Allocation is required.");

        RuleFor(x => x.FunctionPercentageAllocationsRequests)
            .Must(x => x.Sum(f=> f.Percentage) == 100m)
            .When(x => x.FunctionPercentageAllocationsRequests.Count != 0)
            .WithMessage(x => $"The total percentage allocated in this batch must equal exactly 100%. Received {x.FunctionPercentageAllocationsRequests.Sum(x=> x.Percentage)}%.");

        RuleForEach(x => x.FunctionPercentageAllocationsRequests)
            .SetValidator(new FunctionPercentageAllocationRequestValidator());


    }
}
public class FunctionPercentageAllocationRequestValidator : AbstractValidator<FunctionPercentageAllocationRequest>
{
    private readonly string[] ValidFunctionTypes = ["Core Function", "Strategic", "Priority", "Mandatory Support"];

    public FunctionPercentageAllocationRequestValidator()
    {
        RuleFor(x => x.FiscalYear)
            .NotEmpty().WithMessage("Fiscal Year is required.")
            .Must(year => year >= 2000 && year <= 2100).WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

        RuleFor(x => x.FunctionType)
            .NotEmpty().WithMessage("Function Type is required.")
            .MaximumLength(100).WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", ValidFunctionTypes)}.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.Description)).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.Percentage)
            .GreaterThan(0).WithMessage("Percentage must be greater than 0.")
            .LessThanOrEqualTo(100).WithMessage("Percentage for a single item cannot exceed 100.");
    }
}