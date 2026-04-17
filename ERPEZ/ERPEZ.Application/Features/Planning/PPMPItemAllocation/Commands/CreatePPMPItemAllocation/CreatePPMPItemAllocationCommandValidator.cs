using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.CreatePPMPItemAllocation;

public class CreatePPMPItemAllocationCommandValidator : AbstractValidator<CreatePPMPItemAllocationCommand>
{
    public CreatePPMPItemAllocationCommandValidator()
    {
        RuleFor(x => x.PPMPItemId)
            .NotEmpty()
            .WithMessage("PPMP Item ID is required.");

        RuleFor(x => x.AllocationMonth)
            .IsInEnum()
            .WithMessage("Invalid Allocation Month.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Amount must be greater than or equal to 0.");
    }
}
