using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

/// <summary>
/// Validator for UpdateWFPCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPCommandValidator : AbstractValidator<UpdateWFPCommand>
{
    public UpdateWFPCommandValidator()
    {
        // ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Work and Financial Plan ID is required for update.");

        // OfficeId (Required GUID)
        RuleFor(x => x.UpdateWFP.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        // ProjectTitle (Optional for updates, Min/Max Length)
        RuleFor(x => x.UpdateWFP.ProjectTitle)
            .MinimumLength(5)
            .WithMessage("Project Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Project Title cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.ProjectTitle));

        // Description (Optional, Max Length)
        RuleFor(x => x.UpdateWFP.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.Description));

        // FiscalYearId (Optional GUID)
        RuleFor(x => x.UpdateWFP.FiscalYearId)
            .NotEqual(Guid.Empty)
            .WithMessage("Fiscal Year ID must be a valid GUID.")
            .When(x => x.UpdateWFP.FiscalYearId.HasValue);

        // ProjectEndDate must be after ProjectStartDate when both are provided
        RuleFor(x => x.UpdateWFP.ProjectEndDate)
            .GreaterThan(x => x.UpdateWFP.ProjectStartDate!.Value)
            .WithMessage("Project End Date must be after Project Start Date.")
            .When(x => x.UpdateWFP.ProjectStartDate.HasValue && x.UpdateWFP.ProjectEndDate.HasValue);

        // ProposedBudget (Optional, Non-Negative)
        RuleFor(x => x.UpdateWFP.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.")
            .When(x => x.UpdateWFP.ProposedBudget.HasValue);

        // GeneralObjective (Optional, Max Length)
        RuleFor(x => x.UpdateWFP.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.GeneralObjective));

        // Mode (Optional, must be valid enum value when provided)
        RuleFor(x => x.UpdateWFP.Mode)
            .Must(mode => Enum.TryParse<ModeEnum>(mode, true, out _))
            .WithMessage("Mode must be 'OPCR' or 'External'.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.Mode));
    }
}
