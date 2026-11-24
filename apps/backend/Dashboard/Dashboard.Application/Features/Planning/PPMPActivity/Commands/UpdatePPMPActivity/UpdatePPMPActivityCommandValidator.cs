using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.UpdatePPMPActivity;

public class UpdatePPMPActivityCommandValidator : AbstractValidator<UpdatePPMPActivityCommand>
{
    public UpdatePPMPActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Activity ID is required.");

        RuleFor(x => x.LIBActivityId)
            .NotEmpty()
            .When(x => x.LIBActivityId.HasValue)
            .WithMessage("LIB Activity ID is invalid.");
    }
}
