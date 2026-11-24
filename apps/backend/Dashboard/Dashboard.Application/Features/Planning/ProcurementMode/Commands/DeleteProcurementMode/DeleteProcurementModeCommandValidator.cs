using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.DeleteProcurementMode;

public class DeleteProcurementModeCommandValidator : AbstractValidator<DeleteProcurementModeCommand>
{
    public DeleteProcurementModeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement mode ID is required for deletion.");
    }
}
