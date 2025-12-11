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

        // FiscalYearId (Required GUID)
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year ID is required and must be a valid, non-empty GUID.");

    }
}
