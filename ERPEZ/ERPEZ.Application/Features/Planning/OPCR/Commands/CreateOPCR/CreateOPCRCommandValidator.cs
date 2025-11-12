using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandValidator : AbstractValidator<CreateOPCRCommand>
{
    private readonly string[] validStatuses = ["Draft", "Submitted", "Approved", "Revising"];

    public CreateOPCRCommandValidator()
    {
        // DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // FiscalYear (Required Integer, Valid Range)
        int currentYear = DateTime.UtcNow.Year;
        RuleFor(x => x.FiscalYear)
            .InclusiveBetween(currentYear - 2, currentYear + 5) // Allows current year, two years back, five years forward
            .WithMessage($"Fiscal Year must be a valid year, typically between {currentYear - 2} and {currentYear + 5}.");

        // Status (Required String, Must be one of the defined valid statuses)
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.");
    }
}