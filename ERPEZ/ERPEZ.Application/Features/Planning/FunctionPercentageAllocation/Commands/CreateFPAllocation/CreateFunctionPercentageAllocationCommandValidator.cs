using ERPEZ.Application.Common.Constants;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;

public class CreateFunctionPercentageAllocationCommandValidator : AbstractValidator<CreateFunctionPercentageAllocationCommand>
{

    public CreateFunctionPercentageAllocationCommandValidator()
    {
        RuleFor(x => x.FunctionPercentageAllocationsRequests)
            .NotEmpty()
            .NotNull()
            .WithMessage("At least one Function Percentage Allocation is required.");

        RuleFor(x => x.FunctionPercentageAllocationsRequests)
            .Must(list => list
                .Select(r => (FunctionType: r.FunctionType?.Trim().ToLowerInvariant(), FiscalYear: r.FiscalYear))
                .Distinct()
                .Count() == list.Count)
            .When(list => list.FunctionPercentageAllocationsRequests != null && list.FunctionPercentageAllocationsRequests.Count > 1)
            .WithMessage("The batch must not contain duplicate combinations of Function Type and Fiscal Year.");

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

    public FunctionPercentageAllocationRequestValidator()
    {
        RuleFor(x => x.FiscalYear)
            .NotEmpty().WithMessage("Fiscal Year is required.")
            .Must(year => year >= 2000 && year <= 2100).WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

        RuleFor(x => x.FunctionType)
            .NotEmpty().WithMessage("Function Type is required.")
            .MaximumLength(100).WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => FunctionTypeConstants.ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", FunctionTypeConstants.ValidFunctionTypes)}.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.Description)).WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.Percentage)
            .GreaterThan(0).WithMessage("Percentage must be greater than 0.")
            .LessThanOrEqualTo(100).WithMessage("Percentage for a single item cannot exceed 100.");
    }
}