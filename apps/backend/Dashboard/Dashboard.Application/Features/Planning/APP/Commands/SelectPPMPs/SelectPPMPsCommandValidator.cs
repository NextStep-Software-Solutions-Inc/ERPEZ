using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;

public class SelectPPMPsCommandValidator : AbstractValidator<SelectPPMPsCommand>
{
    public SelectPPMPsCommandValidator()
    {
        RuleFor(x => x.APPId)
            .NotEmpty()
            .WithMessage("APP ID is required.");

        RuleFor(x => x.PPMPIds)
            .NotEmpty()
            .WithMessage("At least one PPMP must be selected.")
            .Must(ids => ids.All(id => id != Guid.Empty))
            .WithMessage("All PPMP IDs must be valid GUIDs.");
    }
}
