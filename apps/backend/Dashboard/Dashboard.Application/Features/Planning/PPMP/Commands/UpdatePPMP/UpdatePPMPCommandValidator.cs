using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMP;

public class UpdatePPMPCommandValidator : AbstractValidator<UpdatePPMPCommand>
{
    public UpdatePPMPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.Dto.PPMPNumber)
            .MaximumLength(50)
            .WithMessage("PPMP Number cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.PPMPNumber));
    }
}
