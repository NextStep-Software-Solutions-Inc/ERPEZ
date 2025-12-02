using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandValidator : AbstractValidator<CreateOPCRCommand>
{
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

    }
}
