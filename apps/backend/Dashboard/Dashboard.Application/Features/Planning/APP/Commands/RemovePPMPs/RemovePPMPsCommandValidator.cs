using FluentValidation;
using System;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.APP.Commands.RemovePPMPs;

public class RemovePPMPsCommandValidator : AbstractValidator<RemovePPMPsCommand>
{
    public RemovePPMPsCommandValidator()
    {
        RuleFor(x => x.APPId)
            .NotEmpty()
            .WithMessage("APP ID is required.");

        RuleFor(x => x.PPMPIds)
            .NotEmpty()
            .WithMessage("At least one PPMP must be specified for removal.")
            .Must(ids => ids.All(id => id != Guid.Empty))
            .WithMessage("All PPMP IDs must be valid GUIDs.");
    }
}
