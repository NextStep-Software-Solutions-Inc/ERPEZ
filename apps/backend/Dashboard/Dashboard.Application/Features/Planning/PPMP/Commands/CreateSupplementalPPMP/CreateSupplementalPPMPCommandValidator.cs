using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreateSupplementalPPMP;

public class CreateSupplementalPPMPCommandValidator : AbstractValidator<CreateSupplementalPPMPCommand>
{
    public CreateSupplementalPPMPCommandValidator()
    {
        RuleFor(x => x.SourcePPMPId)
            .NotEmpty().WithMessage("Source PPMP ID is required.");

        RuleFor(x => x.Dto!.PPMPNumber)
            .MaximumLength(100).WithMessage("PPMP Number must not exceed 100 characters.")
            .When(x => x.Dto != null && !string.IsNullOrWhiteSpace(x.Dto.PPMPNumber));
    }
}
