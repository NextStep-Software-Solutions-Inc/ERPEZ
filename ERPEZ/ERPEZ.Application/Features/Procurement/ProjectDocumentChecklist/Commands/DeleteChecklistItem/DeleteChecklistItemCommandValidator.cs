using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.DeleteChecklistItem;

public class DeleteChecklistItemCommandValidator : AbstractValidator<DeleteChecklistItemCommand>
{
    public DeleteChecklistItemCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId)
            .NotEmpty()
            .WithMessage("Procurement project ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Procurement project ID must be a valid, non-empty GUID.");

        RuleFor(x => x.ChecklistItemId)
            .NotEmpty()
            .WithMessage("Checklist item ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Checklist item ID must be a valid, non-empty GUID.");
    }
}