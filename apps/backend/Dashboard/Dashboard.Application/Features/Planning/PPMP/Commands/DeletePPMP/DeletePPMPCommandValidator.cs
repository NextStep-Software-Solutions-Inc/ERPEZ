using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.DeletePPMP;

public class DeletePPMPCommandValidator : AbstractValidator<DeletePPMPCommand>
{
    public DeletePPMPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");
    }
}
