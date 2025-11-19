using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.DeleteDUFundAllocation;

public class DeleteDUFundAllocationCommandValidator : AbstractValidator<DeleteDUFundAllocationCommand>
{
    public DeleteDUFundAllocationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fund Allocation ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Fund Allocation ID must be a valid, non-empty GUID.");
    }
}
