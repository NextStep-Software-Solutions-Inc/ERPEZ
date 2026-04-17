using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.DeletePPMPItem;

public class DeletePPMPItemCommandValidator : AbstractValidator<DeletePPMPItemCommand>
{
    public DeletePPMPItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Item ID is required.");
    }
}
