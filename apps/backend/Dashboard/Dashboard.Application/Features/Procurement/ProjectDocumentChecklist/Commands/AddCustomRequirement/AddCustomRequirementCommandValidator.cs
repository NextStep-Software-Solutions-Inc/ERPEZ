using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.AddCustomRequirement;

public class AddCustomRequirementCommandValidator
    : AbstractValidator<AddCustomRequirementCommand>
{
    public AddCustomRequirementCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId).NotEmpty();
        RuleFor(x => x.CustomDocumentName)
            .NotEmpty().WithMessage("Custom document name is required.")
            .MaximumLength(256);
        RuleFor(x => x.EnvelopeType)
            .InclusiveBetween(1, 2)
            .WithMessage("EnvelopeType must be 1 (Technical) or 2 (Financial).");
        RuleFor(x => x.OrderIndex).GreaterThanOrEqualTo(0);
    }
}