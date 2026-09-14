using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.TogglePPMPFinalization;

public class TogglePPMPFinalizationCommandValidator : AbstractValidator<TogglePPMPFinalizationCommand>
{
    public TogglePPMPFinalizationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("PPMP ID is required.");
    }
}
