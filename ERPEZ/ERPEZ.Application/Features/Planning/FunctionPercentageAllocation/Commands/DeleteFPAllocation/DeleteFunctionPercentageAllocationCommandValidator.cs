using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.DeleteFPAllocation;

public class DeleteFunctionPercentageAllocationCommandValidator : AbstractValidator<DeleteFunctionPercentageAllocationCommand>
{
    public DeleteFunctionPercentageAllocationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Function Percentage Allocation ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Function Percentage Allocation ID must be a valid, non-empty GUID.");
    }
}