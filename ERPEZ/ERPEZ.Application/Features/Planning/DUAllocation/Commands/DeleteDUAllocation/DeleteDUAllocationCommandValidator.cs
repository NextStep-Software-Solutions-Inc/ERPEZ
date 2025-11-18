using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.DeleteDUAllocation;

public class DeleteDUAllocationCommandValidator : AbstractValidator<DeleteDUAllocationCommand>
{
    public DeleteDUAllocationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Allocation ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Allocation ID must be a valid, non-empty GUID.");
    }
}
