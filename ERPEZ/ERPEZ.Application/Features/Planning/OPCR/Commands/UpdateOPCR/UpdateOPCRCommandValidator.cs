using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommandValidator : AbstractValidator<UpdateOPCRCommand>
{
    private readonly string[] validStatuses = ["Draft", "Submitted", "Approved", "Revising"];

    public UpdateOPCRCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");

        // 2. DeliveryUnitId (Required GUID)
        RuleFor(x => x.UpdateOPCR.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // 3. FiscalYear (Required Integer, Valid Range)
        int currentYear = DateTime.UtcNow.Year;
        RuleFor(x => x.UpdateOPCR.FiscalYear)
            .InclusiveBetween(currentYear - 2, currentYear + 5)
            .WithMessage($"Fiscal Year must be a valid year, typically between {currentYear - 2} and {currentYear + 5}.");

        // 4. Status (Required String, Must be one of the defined valid statuses)
        RuleFor(x => x.UpdateOPCR.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.");
    }
}
