using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandValidator : AbstractValidator<CreateWFPCommand>
{
    private static readonly string[] ValidStatuses = [ "Draft", "Submitted", "Approved", "Rejected", "Completed" ];
    public CreateWFPCommandValidator()
    {
        // 1. DeliveryUnitId (Guid)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required.");

        // 2. ProgramTitle (Required, Min/Max Length)
        RuleFor(x => x.ProgramTitle)
            .NotEmpty()
            .WithMessage("Program Title is required.")
            .MinimumLength(5)
            .WithMessage("Program Title must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Program Title cannot exceed 250 characters.");

        // 3. Description (Optional, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // 4. FiscalYear (Required, Valid Year Range)
        RuleFor(x => x.FiscalYear)
            .NotNull()
            .WithMessage("Fiscal Year is required.")
            .InclusiveBetween(DateTime.Now.Year - 1, DateTime.Now.Year + 10) // Example: current year, previous year, and next 10 years
            .WithMessage($"Fiscal Year must be between {DateTime.Now.Year - 1} and {DateTime.Now.Year + 10}.");

        // 5. ProposedBudget (Required, Positive Value)
        RuleFor(x => x.ProposedBudget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Proposed Budget must be a non-negative value.");

        // 6. GeneralObjective (Optional, Max Length)
        RuleFor(x => x.GeneralObjective)
            .MaximumLength(1000)
            .WithMessage("General Objective cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.GeneralObjective));

        // 7. Status (Required, Must be one of the defined valid statuses)
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", ValidStatuses)}.");
    }
}
