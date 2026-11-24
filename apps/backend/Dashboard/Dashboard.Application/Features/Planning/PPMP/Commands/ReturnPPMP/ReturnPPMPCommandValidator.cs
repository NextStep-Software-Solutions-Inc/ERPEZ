using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;

public class ReturnPPMPCommandValidator : AbstractValidator<ReturnPPMPCommand>
{
    public ReturnPPMPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.Request.Remarks)
            .NotEmpty()
            .WithMessage("Revision remarks are required when returning a PPMP.")
            .MaximumLength(1000)
            .WithMessage("Revision remarks cannot exceed 1000 characters.");
    }
}
