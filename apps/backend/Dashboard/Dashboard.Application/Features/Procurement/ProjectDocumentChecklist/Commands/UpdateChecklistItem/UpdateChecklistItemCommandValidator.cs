using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.UpdateChecklistItem;

public class UpdateChecklistItemCommandValidator
    : AbstractValidator<UpdateChecklistItemCommand>
{
    public UpdateChecklistItemCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId).NotEmpty();
        RuleFor(x => x.ChecklistItemId).NotEmpty();
        RuleFor(x => x.OrderIndex).GreaterThanOrEqualTo(0);
    }
}