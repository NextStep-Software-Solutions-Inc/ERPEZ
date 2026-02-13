using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.ArchiveProcurementMode;

public class ArchiveProcurementModeCommandValidator : AbstractValidator<ArchiveProcurementModeCommand>
{
    public ArchiveProcurementModeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement mode ID is required.");
    }
}
