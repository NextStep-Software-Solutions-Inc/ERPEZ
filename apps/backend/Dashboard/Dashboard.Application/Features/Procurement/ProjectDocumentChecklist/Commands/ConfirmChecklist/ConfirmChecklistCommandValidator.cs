using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ConfirmChecklist;

public class ConfirmChecklistCommandValidator : AbstractValidator<ConfirmChecklistCommand>
{
    public ConfirmChecklistCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId)
            .NotEmpty()
            .WithMessage("Procurement project ID is required.");
    }
}