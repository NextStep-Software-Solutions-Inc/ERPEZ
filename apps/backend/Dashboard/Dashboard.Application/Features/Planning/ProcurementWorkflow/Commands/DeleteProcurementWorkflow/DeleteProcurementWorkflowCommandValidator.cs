using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.DeleteProcurementWorkflow;

/// <summary>
/// Validator for DeleteProcurementWorkflowCommand ensuring the ID is provided.
/// </summary>
public class DeleteProcurementWorkflowCommandValidator : AbstractValidator<DeleteProcurementWorkflowCommand>
{
    public DeleteProcurementWorkflowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement workflow ID is required for deletion.");
    }
}
