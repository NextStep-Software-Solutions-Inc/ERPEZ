using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.ResetChecklist;

public class ResetChecklistCommandValidator : AbstractValidator<ResetChecklistCommand>
{
    public ResetChecklistCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId)
            .NotEmpty()
            .WithMessage("Procurement project ID is required.");
    }
}