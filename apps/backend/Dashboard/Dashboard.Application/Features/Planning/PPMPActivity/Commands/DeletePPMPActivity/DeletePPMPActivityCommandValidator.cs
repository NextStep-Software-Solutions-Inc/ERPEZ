using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.DeletePPMPActivity;

public class DeletePPMPActivityCommandValidator : AbstractValidator<DeletePPMPActivityCommand>
{
    public DeletePPMPActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Activity ID is required.");
    }
}
