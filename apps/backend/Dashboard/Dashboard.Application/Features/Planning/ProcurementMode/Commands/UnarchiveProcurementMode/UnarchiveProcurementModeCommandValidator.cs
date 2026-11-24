using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UnarchiveProcurementMode;

public class UnarchiveProcurementModeCommandValidator : AbstractValidator<UnarchiveProcurementModeCommand>
{
    public UnarchiveProcurementModeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement mode ID is required.");
    }
}
