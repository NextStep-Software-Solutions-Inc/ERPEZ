using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.UpdatePPMPItemAllocation;

public class UpdatePPMPItemAllocationCommandValidator : AbstractValidator<UpdatePPMPItemAllocationCommand>
{
    public UpdatePPMPItemAllocationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Item Allocation ID is required.");

        RuleFor(x => x.AllocationMonth)
            .IsInEnum()
            .When(x => x.AllocationMonth.HasValue)
            .WithMessage("Invalid Allocation Month.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .When(x => x.Quantity.HasValue)
            .WithMessage("Quantity must be greater than 0.");
    }
}
