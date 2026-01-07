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
        When(x => x.UpdateOPCR.FiscalYearId.HasValue, () =>
        {
            RuleFor(x => x.UpdateOPCR.FiscalYearId)
                .Must(id => id != Guid.Empty)
                .WithMessage("Fiscal Year ID must be a valid, non-empty GUID.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.UpdateOPCR.Name), () =>
        {
            RuleFor(x => x.UpdateOPCR.Name)
                .NotEmpty()
                .WithMessage("Name is required when provided.")
                .MinimumLength(3)
                .WithMessage("Name must be at least 3 characters long.")
                .MaximumLength(256)
                .WithMessage("Name cannot exceed 256 characters.");
        });
    }
}
