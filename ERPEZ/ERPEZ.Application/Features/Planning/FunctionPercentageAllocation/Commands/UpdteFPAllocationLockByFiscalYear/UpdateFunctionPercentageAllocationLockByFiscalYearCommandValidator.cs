using ERPEZ.Application.Common.Constants;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdteFPAllocationLockByFiscalYear;

public class UpdateFunctionPercentageAllocationLockByFiscalYearCommandValidator : AbstractValidator<UpdateFunctionPercentageAllocationLockByFiscalYearCommand>
{
    public UpdateFunctionPercentageAllocationLockByFiscalYearCommandValidator()
    {
        RuleFor(x => x.FiscalYear)
            .InclusiveBetween(2000, 2100).WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

        RuleFor(x => x.UpdateFunctionPercentageAllocationsRequests)
            .NotNull().WithMessage("The list of function types to lock cannot be null.")
            .NotEmpty().WithMessage("At least one function type must be provided for locking.");

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
            update.RuleFor(x => x.FunctionType)
            .NotEmpty().WithMessage("Function Type is required.")
            .MaximumLength(100).WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => FunctionTypeConstants.ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", FunctionTypeConstants.ValidFunctionTypes)}.");
        });
    }
}