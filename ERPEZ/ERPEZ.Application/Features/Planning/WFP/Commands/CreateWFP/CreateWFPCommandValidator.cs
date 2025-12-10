using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

/// <summary>
/// Validator for CreateWFPCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateWFPCommandValidator : AbstractValidator<CreateWFPCommand>
{
    public CreateWFPCommandValidator()
    {
        // DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required.");

        // ProjectTitle (Required, Min/Max Length)
        RuleFor(x => x.ProjectTitle)
            .NotEmpty()
            .WithMessage("Project Title is required.")
            .MinimumLength(5)
            .WithMessage("Project Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Project Title cannot exceed 250 characters.");

        // Description (Optional, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // FiscalYearId (Optional GUID)
        RuleFor(x => x.FiscalYearId)
            .NotEqual(Guid.Empty)
            .WithMessage("Fiscal Year ID must be a valid GUID.")
            .When(x => x.FiscalYearId.HasValue);

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

        // ProposedBudget (Optional, Non-Negative - will be auto-calculated from line items)
        RuleFor(x => x.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.")
            .When(x => x.ProposedBudget.HasValue);

        // GeneralObjective (Optional, Max Length)
        RuleFor(x => x.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.GeneralObjective));

        // Status (Required, Must be valid enum value)
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => Enum.TryParse<StatusEnum>(status, true, out _))
            .WithMessage($"Status must be one of the following: {string.Join(", ", Enum.GetNames<StatusEnum>())}.");
    }
}
