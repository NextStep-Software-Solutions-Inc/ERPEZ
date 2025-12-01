using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.LockDUAllocation;

/// <summary>
/// Validator for LockDUAllocationCommand ensuring the DU allocation ID is valid.
/// </summary>
public class LockDUAllocationCommandValidator : AbstractValidator<LockDUAllocationCommand>
{
    public LockDUAllocationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("DU Allocation ID is required.");
    }
}