using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommandValidator : AbstractValidator<UpdateWFPCommand>
{
    private readonly string[] validStatuses = ["Draft", "Submitted", "Approved", "Rejected", "Completed", "Canceled"];

    public UpdateWFPCommandValidator()
    {
        // 1. 🔑 ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP ID is required for update.");

        // 2. DeliveryUnitId (Guid)
        RuleFor(x => x.UpdateWFP.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required.");

        // 3. ProgramTitle (Required, Min/Max Length)
        RuleFor(x => x.UpdateWFP.ProgramTitle)
            .NotEmpty()
            .WithMessage("Program Title is required.")
            .MinimumLength(5)
            .WithMessage("Program Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Program Title cannot exceed 250 characters.");

        // 4. Description (Optional, Max Length)
        RuleFor(x => x.UpdateWFP.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.Description));

        // 5. FiscalYear (Required, Valid Year Range)
        RuleFor(x => x.UpdateWFP.FiscalYear)
            .NotNull()
            .WithMessage("Fiscal Year is required.")
            .InclusiveBetween(DateTime.Now.Year - 1, DateTime.Now.Year + 10)
            .WithMessage($"Fiscal Year must be between {DateTime.Now.Year - 1} and {DateTime.Now.Year + 10}.");

        // 6. ProposedBudget (Required, Positive Value)
        RuleFor(x => x.UpdateWFP.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.");

        // 7. GeneralObjective (Optional, Max Length)
        RuleFor(x => x.UpdateWFP.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFP.GeneralObjective));

        // 8. Status (Required, Must be one of the defined valid statuses)
        RuleFor(x => x.UpdateWFP.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.");
    }
}