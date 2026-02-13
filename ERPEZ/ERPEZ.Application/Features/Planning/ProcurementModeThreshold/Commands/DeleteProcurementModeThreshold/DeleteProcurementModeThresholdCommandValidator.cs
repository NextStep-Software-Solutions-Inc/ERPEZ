using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.DeleteProcurementModeThreshold;

public class DeleteProcurementModeThresholdCommandValidator : AbstractValidator<DeleteProcurementModeThresholdCommand>
{
    public DeleteProcurementModeThresholdCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement mode threshold ID is required for deletion.");
    }
}
