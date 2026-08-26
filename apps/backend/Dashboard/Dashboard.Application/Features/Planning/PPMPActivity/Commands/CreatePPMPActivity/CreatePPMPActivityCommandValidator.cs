using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.CreatePPMPActivity;

public class CreatePPMPActivityCommandValidator : AbstractValidator<CreatePPMPActivityCommand>
{
    public CreatePPMPActivityCommandValidator()
    {
        RuleFor(x => x.PPMPId)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.LIBActivityId)
            .NotEmpty()
            .WithMessage("LIB Activity ID is required.");
    }
}
