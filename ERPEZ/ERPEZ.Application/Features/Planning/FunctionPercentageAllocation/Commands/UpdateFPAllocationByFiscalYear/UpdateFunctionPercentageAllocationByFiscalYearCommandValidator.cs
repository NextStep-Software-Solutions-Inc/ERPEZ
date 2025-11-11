using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommandValidator : AbstractValidator<UpdateFunctionPercentageAllocationByFiscalYearCommand>
{
    public UpdateFunctionPercentageAllocationByFiscalYearCommandValidator()
    {
        RuleFor(x => x.FiscalYear)
            .InclusiveBetween(2000, 2100).WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

        RuleFor(x => x.UpdateFunctionPercentageAllocationsRequests)
            .NotNull().WithMessage("The list of percentage updates cannot be null.")
            .NotEmpty().WithMessage("At least one percentage update entry is required.");

        RuleFor(x => x.UpdateFunctionPercentageAllocationsRequests)
            .Must(list =>
                list.Select(r => r.FunctionType)
                .Where(t => t != null)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Count() == list.Count)
            .When(list => list.UpdateFunctionPercentageAllocationsRequests != null && list.UpdateFunctionPercentageAllocationsRequests.Count > 1)
            .WithMessage("The request batch must not contain duplicate Function Types.");

        RuleForEach(x => x.UpdateFunctionPercentageAllocationsRequests).ChildRules(update =>
        {
            update.RuleFor(u => u.FunctionType)
                .NotNull().WithMessage("Function Type is required for update.")
                .NotEmpty().WithMessage("Function Type is required for update.");

            update.RuleFor(u => u.Percentage)
                .NotNull().WithMessage("Percentage value is required for update.")
                .GreaterThan(0).WithMessage("Percentage must be greater than 0.")
                .LessThanOrEqualTo(100).WithMessage("Percentage cannot exceed 100.");
        });
    }
}