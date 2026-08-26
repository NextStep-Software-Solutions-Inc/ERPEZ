using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ChangeDirectContractingStatus;

public class ChangeDirectContractingStatusCommandValidator : AbstractValidator<ChangeDirectContractingStatusCommand>
{
    public ChangeDirectContractingStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Direct Contracting Request ID is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("A valid status is required.");
    }
}
