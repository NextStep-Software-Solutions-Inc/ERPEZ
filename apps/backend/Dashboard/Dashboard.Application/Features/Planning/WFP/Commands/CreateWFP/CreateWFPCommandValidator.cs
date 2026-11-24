using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandValidator : AbstractValidator<CreateWFPCommand>
{
    public CreateWFPCommandValidator()
    {
        // OfficeId (Required GUID)
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        // ProjectTitle (Required, Min/Max Length)
        RuleFor(x => x.ProjectTitle)
            .NotEmpty()
            .WithMessage("Project Title is required.")
            .MinimumLength(5)
            .WithMessage("Project Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Project Title cannot exceed 250 characters.");

        // OPCRId (Required when Mode is OPCR, must be empty when External)
        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required when Mode is OPCR.")
            .When(x => x.Mode == ModeEnum.OPCR);

        RuleFor(x => x.OPCRId)
            .Empty()
            .WithMessage("OPCR ID must not be provided when Mode is External.")
            .When(x => x.Mode == ModeEnum.External);

        // ProjectStartDate (Required)
        RuleFor(x => x.ProjectStartDate)
            .NotEmpty()
            .WithMessage("Project Start Date is required.");

        // ProjectEndDate (Required and must be after ProjectStartDate)
        RuleFor(x => x.ProjectEndDate)
            .NotEmpty()
            .WithMessage("Project End Date is required.")
            .GreaterThan(x => x.ProjectStartDate)
            .WithMessage("Project End Date must be after Project Start Date.");

        // ProposedBudget (Optional, Non-Negative)
        RuleFor(x => x.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.")
            .When(x => x.ProposedBudget.HasValue);

        // GeneralObjective (Optional, Max Length)
        RuleFor(x => x.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.GeneralObjective));

        // Mode (Required)
        RuleFor(x => x.Mode)
            .IsInEnum()
            .WithMessage("Mode must be 'OPCR' or 'External'.");
    }
}
