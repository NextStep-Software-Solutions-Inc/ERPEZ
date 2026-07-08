using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;

public class UpdatePPMPStatusCommandValidator : AbstractValidator<UpdatePPMPStatusCommand>
{
    public UpdatePPMPStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.Action)
            .NotEmpty()
            .Must(x => Enum.TryParse<StatusEnum>(x.Trim(), ignoreCase: true, out _))
            .WithMessage($"Action must be a valid status: {string.Join(", ", Enum.GetNames<StatusEnum>())}");
    }
}