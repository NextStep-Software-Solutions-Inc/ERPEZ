using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.DeletePPMPItemAllocation;

public class DeletePPMPItemAllocationCommandValidator : AbstractValidator<DeletePPMPItemAllocationCommand>
{
    public DeletePPMPItemAllocationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Item Allocation ID is required.");
    }
}
