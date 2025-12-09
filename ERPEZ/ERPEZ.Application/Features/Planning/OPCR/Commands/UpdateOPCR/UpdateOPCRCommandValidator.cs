using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;

public class UpdateOPCRCommandValidator : AbstractValidator<UpdateOPCRCommand>
{
    public UpdateOPCRCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");

        // 2. DeliveryUnitId (Optional GUID)
        When(x => x.UpdateOPCR.DeliveryUnitId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOPCR.DeliveryUnitId)
                .Must(id => id != Guid.Empty)
                .WithMessage("Delivery Unit ID must be a valid, non-empty GUID.");
        });

        // 3. FiscalYear (Optional Integer, Valid Range)
        When(x => x.UpdateOPCR.FiscalYear.HasValue, () =>
        {
            int currentYear = DateTime.UtcNow.Year;
            RuleFor(x => x.UpdateOPCR.FiscalYear)
                .InclusiveBetween(currentYear - 2, currentYear + 5)
                .WithMessage($"Fiscal Year must be a valid year, typically between {currentYear - 2} and {currentYear + 5}.");
        });
    }
}
