using ERPEZ.Application.Common.Constants;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Validators
{
    public class UpdateFunctionPercentageAllocationCommandValidator : AbstractValidator<UpdateFunctionPercentageAllocationCommand>
    {

        public UpdateFunctionPercentageAllocationCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Function Percentage Allocation ID is required for update.")
                .Must(id => id != Guid.Empty)
                .WithMessage("Function Percentage Allocation ID must be a valid, non-empty GUID.");

            RuleFor(x => x.UpdateFPA.FiscalYear)
                .NotEmpty().WithMessage("Fiscal Year is required for update.")
                .Must(year => year >= 2000 && year <= 2100)
                .WithMessage("Fiscal Year must be a realistic year (e.g., 2000-2100).");

            RuleFor(x => x.UpdateFPA.FunctionType)
                .NotEmpty().WithMessage("Function Type is required.")
                .MaximumLength(100).WithMessage("Function Type cannot exceed 100 characters.")
                .Must(type => FunctionTypeConstants.ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
                .WithMessage($"Function Type must be one of the following: {string.Join(", ", FunctionTypeConstants.ValidFunctionTypes)}.");

            RuleFor(x => x.UpdateFPA.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.UpdateFPA.Description));

            RuleFor(x => x.UpdateFPA.Percentage)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Percentage must be a non-negative value.")
                .LessThanOrEqualTo(100)
                .WithMessage("Percentage cannot exceed 100.");
        }
    }
}