using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public class ApprovePPMPCommandValidator : AbstractValidator<ApprovePPMPCommand>
{
    public ApprovePPMPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.ApprovedBy)
            .NotEmpty()
            .WithMessage("ApprovedBy is required.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .MaximumLength(100)
            .WithMessage("Role cannot exceed 100 characters.");
    }
}
