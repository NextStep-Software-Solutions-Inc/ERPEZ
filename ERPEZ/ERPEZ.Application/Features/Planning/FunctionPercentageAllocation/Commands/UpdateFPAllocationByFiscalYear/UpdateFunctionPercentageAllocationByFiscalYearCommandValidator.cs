using FluentValidation;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocationByFiscalYear;

public class UpdateFunctionPercentageAllocationByFiscalYearCommandValidator : AbstractValidator<UpdateFunctionPercentageAllocationByFiscalYearCommand>
{
    public UpdateFunctionPercentageAllocationByFiscalYearCommandValidator()
    {
        // 1. Top-Level Fiscal Year Validation (Syntax/Range)
        RuleFor(x => x.FiscalYear)
            .InclusiveBetween(2000, 2100).WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

        // 2. Updates List Check (Syntax)
        RuleFor(x => x.UpdateFunctionPercentageAllocationsRequests)
            .NotEmpty().WithMessage("At least one percentage update entry is required.");

        // 3. Individual Item Validation (Syntax/Range)
        RuleForEach(x => x.UpdateFunctionPercentageAllocationsRequests).ChildRules(update =>
        {
            update.RuleFor(u => u.FunctionType)
                    .NotEmpty().WithMessage("Function Type is required for update.");

            update.RuleFor(u => u.Percentage)
                    .GreaterThan(0).WithMessage("Percentage must be greater than 0.")
                    .LessThanOrEqualTo(100).WithMessage("Percentage cannot exceed 100.");
        });
    }
}